/// Team management screen — WORKSHOP_OWNER can view and add mechanics.
///
/// Lists team members and allows creating new MECHANIC users
/// via the admin API endpoint.
library;

import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_tokens.dart';
import '../utils/constants.dart';
import '../widgets/widgets.dart';

/// Tela de gestão de equipe — lista mecânicos e permite adicionar novos.
class TeamScreen extends StatefulWidget {
  const TeamScreen({super.key});

  @override
  State<TeamScreen> createState() => _TeamScreenState();
}

class _TeamScreenState extends State<TeamScreen> {
  List<Map<String, dynamic>> _members = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadTeam();
  }

  /// Carrega a lista de membros da equipe.
  Future<void> _loadTeam() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await ApiService.listTeam();
      if (!mounted) return;
      setState(() {
        _members = data;
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

  /// Exibe o dialóg para adicionar um novo mecânico.
  Future<void> _showAddMemberDialog() async {
    final nameCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final passwordCtrl = TextEditingController();
    final formKey = GlobalKey<FormState>();

    final result = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Novo Mecânico'),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TqTextField(
                controller: nameCtrl,
                label: 'Nome',
                prefixIcon: Icons.person,
                textCapitalization: TextCapitalization.words,
                validator: (value) => value == null || value.trim().isEmpty
                    ? 'Nome obrigatório'
                    : null,
              ),
              const SizedBox(height: TqTokens.space6),
              TqTextField(
                controller: emailCtrl,
                label: 'Email',
                prefixIcon: Icons.email_outlined,
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Email obrigatório';
                  }
                  if (!value.contains('@')) return 'Email inválido';
                  return null;
                },
              ),
              const SizedBox(height: TqTokens.space6),
              TqTextField(
                controller: passwordCtrl,
                label: 'Senha',
                prefixIcon: Icons.lock_outlined,
                obscureText: true,
                validator: (value) {
                  if (value == null || value.isEmpty)
                    return 'Senha obrigatória';
                  if (value.length < 6) return 'Mínimo 6 caracteres';
                  return null;
                },
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () {
              if (formKey.currentState?.validate() == true) {
                Navigator.pop(ctx, true);
              }
            },
            child: const Text('Criar'),
          ),
        ],
      ),
    );

    if (result != true) {
      nameCtrl.dispose();
      emailCtrl.dispose();
      passwordCtrl.dispose();
      return;
    }

    try {
      await ApiService.createTeamMember(
        name: nameCtrl.text.trim(),
        email: emailCtrl.text.trim(),
        password: passwordCtrl.text,
        role: UserRole.mechanic,
      );
      if (!mounted) return;
      showSuccessSnack(context, 'Mecânico adicionado com sucesso!');
      _loadTeam();
    } catch (e) {
      if (!mounted) return;
      showErrorSnack(context, 'Erro: $e');
    } finally {
      nameCtrl.dispose();
      emailCtrl.dispose();
      passwordCtrl.dispose();
    }
  }

  /// Retorna a cor do badge com base no role do membro.
  Color _roleColor(String role) {
    switch (role) {
      case UserRole.workshopOwner:
        return TqTokens.primary;
      case UserRole.mechanic:
        return TqTokens.info;
      default:
        return TqTokens.neutral400;
    }
  }

  /// Retorna o label legível do role.
  String _roleLabel(String role) {
    switch (role) {
      case UserRole.workshopOwner:
        return 'Dono';
      case UserRole.mechanic:
        return 'Mecânico';
      case UserRole.platformAdmin:
        return 'Admin';
      default:
        return role;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Equipe'), centerTitle: true),
      floatingActionButton: FloatingActionButton(
        heroTag: 'fab_team',
        onPressed: _showAddMemberDialog,
        child: const Icon(Icons.person_add),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? TqErrorState(message: _error!, onRetry: _loadTeam)
          : _members.isEmpty
          ? const TqEmptyState(
              icon: Icons.group_outlined,
              title: 'Nenhum membro na equipe',
            )
          : RefreshIndicator(
              onRefresh: _loadTeam,
              child: ListView(
                padding: const EdgeInsets.symmetric(
                  horizontal: TqTokens.space8,
                  vertical: TqTokens.space6,
                ),
                children: [
                  Padding(
                    padding: const EdgeInsets.only(bottom: TqTokens.space6),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: TqTokens.space5,
                            vertical: TqTokens.space2,
                          ),
                          decoration: BoxDecoration(
                            color: TqTokens.neutral400.withAlpha(18),
                            borderRadius: BorderRadius.circular(
                              TqTokens.radiusPill,
                            ),
                            border: Border.all(
                              color: TqTokens.neutral400.withAlpha(50),
                              width: 0.5,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                '${_members.length}',
                                style: const TextStyle(
                                  color: TqTokens.neutral400,
                                  fontSize: TqTokens.fontSizeSm,
                                  fontWeight: TqTokens.fontWeightBold,
                                ),
                              ),
                              const SizedBox(width: 4),
                              const Text(
                                'membros',
                                style: TextStyle(
                                  color: TqTokens.neutral400,
                                  fontSize: TqTokens.fontSizeXs,
                                  fontWeight: TqTokens.fontWeightMedium,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  ..._members.map(_buildMemberCard),
                ],
              ),
            ),
    );
  }

  /// Constrói o card de um membro da equipe.
  Widget _buildMemberCard(Map<String, dynamic> member) {
    final name = member['name'] as String? ?? '';
    final email = member['email'] as String? ?? '';
    final role = member['role'] as String? ?? UserRole.mechanic;

    return Padding(
      padding: const EdgeInsets.only(bottom: TqTokens.space5),
      child: TqCardShell(
        accentColor: _roleColor(role),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                TqBadgePill(
                  label: _roleLabel(role),
                  color: _roleColor(role),
                  icon: role == UserRole.workshopOwner
                      ? Icons.star
                      : Icons.build,
                ),
                const Spacer(),
              ],
            ),
            const SizedBox(height: TqTokens.space5),
            Text(
              name,
              style: const TextStyle(
                fontSize: TqTokens.fontSizeLg,
                fontWeight: TqTokens.fontWeightSemibold,
                color: TqTokens.neutral800,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: TqTokens.space4),
            const Divider(height: 1, thickness: 0.5),
            const SizedBox(height: TqTokens.space4),
            if (email.isNotEmpty)
              TqInfoRow(icon: Icons.email_outlined, text: email),
          ],
        ),
      ),
    );
  }
}
