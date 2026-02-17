/// Widget de campo de placa brasileira com busca automática.
///
/// Aplica máscara ABC-1D23 (Mercosul) ou ABC-1234 (antiga),
/// com botão de lupa para consultar dados do veículo.
/// Quando a busca falha, permite alternar para modo manual.
library;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/app_tokens.dart';
import 'plate_lookup_data.dart';
import 'plate_mask_formatter.dart';

export 'plate_lookup_data.dart';

/// Campo de placa brasileira com máscara, busca e fallback manual.
class TqPlateField extends StatefulWidget {
  /// Controller para o campo de placa.
  final TextEditingController controller;

  /// Função que executa a busca por placa.
  final PlateLookupFn onLookup;

  /// Callback quando dados são encontrados.
  final OnPlateLookup onDataFound;

  /// Callback quando o modo manual é ativado/desativado.
  final ValueChanged<bool> onManualModeChanged;

  /// Se o campo está em modo de edição (placa existente).
  final bool isEditing;

  /// Validador do campo.
  final String? Function(String?)? validator;

  /// Cria campo de placa brasileira com busca.
  const TqPlateField({
    super.key,
    required this.controller,
    required this.onLookup,
    required this.onDataFound,
    required this.onManualModeChanged,
    this.isEditing = false,
    this.validator,
  });

  @override
  State<TqPlateField> createState() => _TqPlateFieldState();
}

class _TqPlateFieldState extends State<TqPlateField>
    with SingleTickerProviderStateMixin {
  bool _searching = false;
  bool _manualMode = false;
  bool _lookupDone = false;
  String? _lookupError;
  late final AnimationController _fadeCtrl;
  late final Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _fadeCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _fadeAnim = CurvedAnimation(parent: _fadeCtrl, curve: Curves.easeInOut);
    if (widget.isEditing) {
      _manualMode = true;
      _lookupDone = true;
    }
  }

  @override
  void dispose() {
    _fadeCtrl.dispose();
    super.dispose();
  }

  bool get _canSearch {
    final raw = widget.controller.text.replaceAll(RegExp(r'[^A-Za-z0-9]'), '');
    return raw.length >= 7;
  }

  Future<void> _doLookup() async {
    if (!_canSearch || _searching) return;
    setState(() {
      _searching = true;
      _lookupError = null;
    });

    final result = await widget.onLookup(widget.controller.text);
    if (!mounted) return;

    if (result != null) {
      widget.onDataFound(result);
      setState(() {
        _searching = false;
        _lookupDone = true;
        _manualMode = false;
        _lookupError = null;
      });
    } else {
      setState(() {
        _searching = false;
        _lookupDone = true;
        _lookupError = 'Veículo não encontrado';
        _manualMode = true;
      });
      widget.onManualModeChanged(true);
    }
    _fadeCtrl.forward(from: 0);
  }

  void _toggleManualMode(bool value) {
    setState(() => _manualMode = value);
    widget.onManualModeChanged(value);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildPlateInput(),
        if (_lookupDone) ...[
          const SizedBox(height: TqTokens.space4),
          FadeTransition(opacity: _fadeAnim, child: _buildStatusBanner()),
        ],
      ],
    );
  }

  Widget _buildPlateInput() {
    return TextFormField(
      controller: widget.controller,
      decoration: InputDecoration(
        labelText: 'Placa *',
        hintText: 'ABC1D23',
        prefixIcon: const Icon(Icons.pin),
        suffixIcon: _buildSuffixIcon(),
      ),
      textCapitalization: TextCapitalization.characters,
      inputFormatters: [
        FilteringTextInputFormatter.allow(RegExp(r'[A-Za-z0-9\-]')),
        BrazilianPlateMaskFormatter(),
      ],
      maxLength: 8,
      validator:
          widget.validator ??
          (value) => value == null || value.trim().isEmpty
              ? 'Placa obrigatória'
              : null,
      onFieldSubmitted: (_) {
        if (_canSearch) _doLookup();
      },
    );
  }

  Widget _buildSuffixIcon() {
    if (_searching) {
      return const Padding(
        padding: EdgeInsets.all(12),
        child: SizedBox(
          width: 20,
          height: 20,
          child: CircularProgressIndicator(strokeWidth: 2),
        ),
      );
    }
    return IconButton(
      onPressed: _canSearch ? _doLookup : null,
      icon: const Icon(Icons.search),
      tooltip: 'Buscar dados do veículo',
      color: TqTokens.accent,
    );
  }

  Widget _buildStatusBanner() {
    if (_lookupError != null) {
      return _buildInfoCard(
        icon: Icons.info_outline,
        color: TqTokens.warning,
        title: _lookupError!,
        trailing: _buildManualToggle(),
      );
    }
    if (!_manualMode && _lookupDone) {
      return _buildInfoCard(
        icon: Icons.check_circle_outline,
        color: TqTokens.success,
        title: 'Dados preenchidos automaticamente',
        trailing: TextButton(
          onPressed: () => _toggleManualMode(true),
          child: const Text(
            'Editar',
            style: TextStyle(fontSize: TqTokens.fontSizeXs),
          ),
        ),
      );
    }
    return const SizedBox.shrink();
  }

  Widget _buildManualToggle() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          'Manual',
          style: TextStyle(
            fontSize: TqTokens.fontSizeXs,
            color: _manualMode ? TqTokens.accent : TqTokens.neutral500,
            fontWeight: TqTokens.fontWeightMedium,
          ),
        ),
        const SizedBox(width: TqTokens.space2),
        SizedBox(
          height: 24,
          child: Switch.adaptive(
            value: _manualMode,
            onChanged: _toggleManualMode,
            activeColor: TqTokens.accent,
          ),
        ),
      ],
    );
  }

  Widget _buildInfoCard({
    required IconData icon,
    required Color color,
    required String title,
    Widget? trailing,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: TqTokens.space6,
        vertical: TqTokens.space4,
      ),
      decoration: BoxDecoration(
        color: color.withAlpha(15),
        borderRadius: BorderRadius.circular(TqTokens.radiusMd),
        border: Border.all(color: color.withAlpha(50)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 18),
          const SizedBox(width: TqTokens.space4),
          Expanded(
            child: Text(
              title,
              style: TextStyle(
                fontSize: TqTokens.fontSizeSm,
                color: color,
                fontWeight: TqTokens.fontWeightMedium,
              ),
            ),
          ),
          if (trailing != null) trailing,
        ],
      ),
    );
  }
}
