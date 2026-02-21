/// Settings screen — user profile, change password, and logout.
///
/// Shows the logged-in user's info (name, email, role, workshop),
/// provides a password change dialog and logout action.
library;

import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../theme/app_tokens.dart';
import '../utils/constants.dart';
import '../widgets/tq_button.dart';
import '../widgets/tq_card_shell.dart';
import '../widgets/tq_info_row.dart';
import '../widgets/tq_badge_pill.dart';

/// Tela de configurações — perfil do usuário, troca de senha e logout.
class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  /// Retorna o label legível do role.
  String _roleLabel(String role) {
    switch (role) {
      case UserRole.platformAdmin:
        return 'Administrador da Plataforma';
      case UserRole.workshopOwner:
        return 'Dono da Oficina';
      case UserRole.mechanic:
        return 'Mecânico';
      default:
        return role;
    }
  }

  /// Retorna a cor do badge com base no role.
  Color _roleColor(String role) {
    switch (role) {
      case UserRole.platformAdmin:
        return TqTokens.warning;
      case UserRole.workshopOwner:
        return TqTokens.primary;
      case UserRole.mechanic:
        return TqTokens.info;
      default:
        return TqTokens.neutral400;
    }
  }

  /// Retorna o ícone do role.
  IconData _roleIcon(String role) {
    switch (role) {
      case UserRole.platformAdmin:
        return Icons.admin_panel_settings;
      case UserRole.workshopOwner:
        return Icons.store;
      case UserRole.mechanic:
        return Icons.build;
      default:
        return Icons.person;
    }
  }

  /// Exibe o dialog de troca de senha.
  void _showChangePasswordDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (dialogContext) => const _ChangePasswordDialog(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = AuthService.user;
    final name = user?['name'] as String? ?? 'Usuário';
    final email = user?['email'] as String? ?? '';
    final role = AuthService.role;
    final workshopName = user?['workshopName'] as String? ?? '';

    return Scaffold(
      appBar: AppBar(title: const Text('Configurações'), centerTitle: true),
      body: ListView(
        padding: const EdgeInsets.all(TqTokens.space8),
        children: [
          // — Avatar e nome —
          Center(
            child: Column(
              children: [
                CircleAvatar(
                  radius: 40,
                  backgroundColor: _roleColor(role).withAlpha(30),
                  child: Icon(
                    _roleIcon(role),
                    size: 40,
                    color: _roleColor(role),
                  ),
                ),
                const SizedBox(height: TqTokens.space6),
                Text(
                  name,
                  style: const TextStyle(
                    fontSize: TqTokens.fontSizeXl,
                    fontWeight: TqTokens.fontWeightBold,
                    color: TqTokens.neutral800,
                  ),
                ),
                const SizedBox(height: TqTokens.space3),
                TqBadgePill(
                  label: _roleLabel(role),
                  color: _roleColor(role),
                  icon: _roleIcon(role),
                ),
              ],
            ),
          ),
          const SizedBox(height: TqTokens.space12),

          // — Card de informações —
          TqCardShell(
            accentColor: _roleColor(role),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Informações da Conta',
                  style: TextStyle(
                    fontSize: TqTokens.fontSizeMd,
                    fontWeight: TqTokens.fontWeightSemibold,
                    color: TqTokens.neutral800,
                  ),
                ),
                const SizedBox(height: TqTokens.space6),
                TqInfoRow(
                  icon: Icons.email_outlined,
                  text: email,
                  fontWeight: TqTokens.fontWeightMedium,
                ),
                if (workshopName.isNotEmpty) ...[
                  const SizedBox(height: TqTokens.space4),
                  TqInfoRow(icon: Icons.store_outlined, text: workshopName),
                ],
                const SizedBox(height: TqTokens.space4),
                TqInfoRow(
                  icon: Icons.shield_outlined,
                  text: _roleLabel(role),
                  textColor: _roleColor(role),
                ),
              ],
            ),
          ),
          const SizedBox(height: TqTokens.space8),

          // — Botão alterar senha —
          TqButton.secondary(
            label: 'Alterar Senha',
            icon: Icons.lock_outline,
            onPressed: () => _showChangePasswordDialog(context),
          ),
          const SizedBox(height: TqTokens.space8),

          // — Botão de logout —
          TqButton.ghost(
            label: 'Sair da Conta',
            icon: Icons.logout,
            onPressed: () async {
              await AuthService.logout();
              if (!context.mounted) return;
              Navigator.of(context).pushReplacementNamed('/login');
            },
          ),
          const SizedBox(height: TqTokens.space6),

          // — Versão do app —
          Center(
            child: Text(
              'TorqueHub v1.0.0',
              style: TextStyle(
                fontSize: TqTokens.fontSizeXs,
                color: TqTokens.neutral400,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Dialog para troca de senha com validação.
class _ChangePasswordDialog extends StatefulWidget {
  const _ChangePasswordDialog();

  @override
  State<_ChangePasswordDialog> createState() => _ChangePasswordDialogState();
}

class _ChangePasswordDialogState extends State<_ChangePasswordDialog> {
  final _formKey = GlobalKey<FormState>();
  final _currentController = TextEditingController();
  final _newController = TextEditingController();
  final _confirmController = TextEditingController();
  bool _loading = false;
  bool _obscureCurrent = true;
  bool _obscureNew = true;

  @override
  void dispose() {
    _currentController.dispose();
    _newController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  /// Submete a troca de senha.
  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);
    try {
      await ApiService.changePassword(
        currentPassword: _currentController.text,
        newPassword: _newController.text,
      );
      if (!mounted) return;
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Senha alterada com sucesso!'),
          backgroundColor: TqTokens.success,
        ),
      );
    } on ApiException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error.message),
          backgroundColor: TqTokens.danger,
        ),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Alterar Senha'),
      content: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextFormField(
              controller: _currentController,
              obscureText: _obscureCurrent,
              decoration: InputDecoration(
                labelText: 'Senha atual',
                prefixIcon: const Icon(Icons.lock_outline),
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscureCurrent ? Icons.visibility : Icons.visibility_off,
                  ),
                  onPressed: () =>
                      setState(() => _obscureCurrent = !_obscureCurrent),
                ),
              ),
              validator: (value) {
                if (value == null || value.isEmpty)
                  return 'Informe a senha atual';
                return null;
              },
            ),
            const SizedBox(height: TqTokens.space6),
            TextFormField(
              controller: _newController,
              obscureText: _obscureNew,
              decoration: InputDecoration(
                labelText: 'Nova senha',
                prefixIcon: const Icon(Icons.lock_reset),
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscureNew ? Icons.visibility : Icons.visibility_off,
                  ),
                  onPressed: () => setState(() => _obscureNew = !_obscureNew),
                ),
              ),
              validator: (value) {
                if (value == null || value.length < 6) {
                  return 'Mínimo 6 caracteres';
                }
                return null;
              },
            ),
            const SizedBox(height: TqTokens.space6),
            TextFormField(
              controller: _confirmController,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'Confirmar nova senha',
                prefixIcon: Icon(Icons.check_circle_outline),
              ),
              validator: (value) {
                if (value != _newController.text) {
                  return 'As senhas não coincidem';
                }
                return null;
              },
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: _loading ? null : () => Navigator.of(context).pop(),
          child: const Text('Cancelar'),
        ),
        FilledButton(
          onPressed: _loading ? null : _submit,
          child: _loading
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : const Text('Alterar'),
        ),
      ],
    );
  }
}
