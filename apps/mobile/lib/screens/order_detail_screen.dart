import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/api_service.dart';

const _statusConfig = <String, Map<String, dynamic>>{
  'DRAFT': {'label': 'Rascunho', 'color': 0xFF94A3B8, 'icon': Icons.edit_note},
  'PENDING_APPROVAL': {'label': 'Aguardando Aprovação', 'color': 0xFFF59E0B, 'icon': Icons.hourglass_top},
  'APPROVED': {'label': 'Aprovada', 'color': 0xFF3B82F6, 'icon': Icons.thumb_up_outlined},
  'IN_PROGRESS': {'label': 'Em Andamento', 'color': 0xFF8B5CF6, 'icon': Icons.build_outlined},
  'COMPLETED': {'label': 'Concluída', 'color': 0xFF22C55E, 'icon': Icons.check_circle_outline},
  'CANCELLED': {'label': 'Cancelada', 'color': 0xFFEF4444, 'icon': Icons.cancel_outlined},
};

const _statusFlow = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'IN_PROGRESS', 'COMPLETED'];

/// Tela de detalhe de uma ordem de serviço.
/// O mecânico pode ver os itens, avançar status, cancelar ou excluir.
class OrderDetailScreen extends StatefulWidget {
  final String orderId;

  const OrderDetailScreen({super.key, required this.orderId});

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  Map<String, dynamic>? _order;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadOrder();
  }

  Future<void> _loadOrder() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await ApiService.getServiceOrder(widget.orderId);
      if (!mounted) return;
      setState(() {
        _order = data;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  String _formatCurrency(dynamic cents) {
    final value = (cents is int ? cents : int.tryParse(cents.toString()) ?? 0) / 100;
    return 'R\$ ${value.toStringAsFixed(2).replaceAll('.', ',')}';
  }

  String _formatDate(String? iso) {
    if (iso == null) return '';
    final dt = DateTime.tryParse(iso);
    if (dt == null) return iso;
    final local = dt.toLocal();
    return '${local.day.toString().padLeft(2, '0')}/${local.month.toString().padLeft(2, '0')}/${local.year} ${local.hour.toString().padLeft(2, '0')}:${local.minute.toString().padLeft(2, '0')}';
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  Future<void> _advanceStatus() async {
    final status = _order?['status'] as String?;
    if (status == null) return;
    final idx = _statusFlow.indexOf(status);
    if (idx < 0 || idx >= _statusFlow.length - 1) return;
    final next = _statusFlow[idx + 1];

    try {
      await ApiService.updateOrderStatus(widget.orderId, next);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Status atualizado para: ${_statusConfig[next]?['label'] ?? next}'),
          backgroundColor: Colors.green,
        ),
      );
      _loadOrder();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro: $e'), backgroundColor: Colors.red),
      );
    }
  }

  Future<void> _cancelOrder() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cancelar Ordem'),
        content: const Text('Tem certeza que deseja cancelar esta ordem de serviço?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Não')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Sim, cancelar', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    try {
      await ApiService.updateOrderStatus(widget.orderId, 'CANCELLED');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Ordem cancelada'), backgroundColor: Colors.orange),
      );
      _loadOrder();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro: $e'), backgroundColor: Colors.red),
      );
    }
  }

  Future<void> _deleteOrder() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Excluir Ordem'),
        content: const Text(
          'Tem certeza que deseja EXCLUIR esta ordem?\nEsta ação não pode ser desfeita.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Não')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Sim, excluir', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    try {
      await ApiService.deleteServiceOrder(widget.orderId);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Ordem excluída'), backgroundColor: Colors.green),
      );
      Navigator.pop(context); // volta pra lista
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro: $e'), backgroundColor: Colors.red),
      );
    }
  }

  void _copyPublicToken() {
    final token = _order?['publicToken'] as String?;
    if (token == null) return;
    Clipboard.setData(ClipboardData(text: token));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Token copiado! Envie ao cliente para acompanhamento.')),
    );
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalhes da Ordem'),
        centerTitle: true,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? _buildError()
              : _order == null
                  ? const Center(child: Text('Ordem não encontrada'))
                  : _buildContent(),
    );
  }

  Widget _buildError() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(_error!, style: const TextStyle(color: Colors.grey), textAlign: TextAlign.center),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: _loadOrder,
              icon: const Icon(Icons.refresh),
              label: const Text('Tentar novamente'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent() {
    final order = _order!;
    final status = order['status'] as String? ?? 'DRAFT';
    final config = _statusConfig[status] ?? _statusConfig['DRAFT']!;
    final color = Color(config['color'] as int);
    final items = List<Map<String, dynamic>>.from(order['items'] ?? []);
    final canAdvance = _statusFlow.contains(status) &&
        _statusFlow.indexOf(status) < _statusFlow.length - 1;
    final canCancel = status != 'CANCELLED' && status != 'COMPLETED';

    return RefreshIndicator(
      onRefresh: _loadOrder,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // ── Status Badge ──────────────────────────────────────────
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 16),
            decoration: BoxDecoration(
              color: color.withAlpha(20),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: color.withAlpha(60)),
            ),
            child: Column(
              children: [
                Icon(config['icon'] as IconData, color: color, size: 36),
                const SizedBox(height: 6),
                Text(
                  config['label'] as String,
                  style: TextStyle(
                    color: color,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // ── Descrição ─────────────────────────────────────────────
          Text(
            order['description'] as String? ?? 'Sem descrição',
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
          ),
          if (order['observations'] != null && (order['observations'] as String).isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              order['observations'] as String,
              style: TextStyle(fontSize: 14, color: Colors.grey.shade600, fontStyle: FontStyle.italic),
            ),
          ],
          const SizedBox(height: 8),
          Text(
            'Criada em: ${_formatDate(order['createdAt'] as String?)}',
            style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
          ),

          // ── Token público ─────────────────────────────────────────
          const SizedBox(height: 12),
          InkWell(
            onTap: _copyPublicToken,
            borderRadius: BorderRadius.circular(8),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.blue.shade200),
              ),
              child: Row(
                children: [
                  Icon(Icons.link, size: 18, color: Colors.blue.shade700),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Token: ${order['publicToken'] ?? '—'}',
                      style: TextStyle(
                        fontSize: 13,
                        fontFamily: 'monospace',
                        color: Colors.blue.shade700,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Icon(Icons.copy, size: 16, color: Colors.blue.shade400),
                ],
              ),
            ),
          ),

          const SizedBox(height: 24),
          const Divider(),
          const SizedBox(height: 16),

          // ── Itens ─────────────────────────────────────────────────
          const Text(
            'Itens / Serviços',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          ...items.map((item) => _buildItemRow(item)),

          // ── Total ─────────────────────────────────────────────────
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: const Color(0xFF1A1A2E).withAlpha(8),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Total',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                ),
                Text(
                  _formatCurrency(order['totalAmount']),
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF1A1A2E),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 28),

          // ── Actions ───────────────────────────────────────────────
          if (canAdvance)
            FilledButton.icon(
              onPressed: _advanceStatus,
              icon: const Icon(Icons.arrow_forward),
              label: Text(
                'Avançar para: ${_statusConfig[_statusFlow[_statusFlow.indexOf(status) + 1]]?['label'] ?? 'Próximo'}',
              ),
              style: FilledButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
              ),
            ),
          if (canAdvance) const SizedBox(height: 10),

          if (canCancel)
            OutlinedButton.icon(
              onPressed: _cancelOrder,
              icon: const Icon(Icons.cancel_outlined, color: Colors.orange),
              label: const Text('Cancelar Ordem', style: TextStyle(color: Colors.orange)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Colors.orange),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
          if (canCancel) const SizedBox(height: 10),

          TextButton.icon(
            onPressed: _deleteOrder,
            icon: Icon(Icons.delete_outline, color: Colors.red.shade300),
            label: Text('Excluir Ordem', style: TextStyle(color: Colors.red.shade300)),
          ),

          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildItemRow(Map<String, dynamic> item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Expanded(
            flex: 3,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item['description'] as String? ?? '',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 2),
                Text(
                  '${item['quantity']}x  ${_formatCurrency(item['unitPrice'])}',
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                ),
              ],
            ),
          ),
          Text(
            _formatCurrency(item['totalPrice']),
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
          ),
        ],
      ),
    );
  }
}
