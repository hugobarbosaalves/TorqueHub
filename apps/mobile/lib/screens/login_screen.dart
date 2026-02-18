/// Tela de login — autenticação do mecânico/admin.
///
/// Exibe campos de email e senha com validação básica.
/// Ao autenticar com sucesso, navega para a tela principal (MainShell).
library;

import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../theme/app_tokens.dart';
import '../widgets/tq_button.dart';
import '../widgets/tq_text_field.dart';
import '../widgets/tq_snackbar.dart';

/// Tela de login com email e senha.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  /// Executa o login e navega para a shell principal.
  Future<void> _handleLogin() async {
    if (_formKey.currentState?.validate() != true) return;

    setState(() => _loading = true);
    try {
      await AuthService.login(
        _emailController.text.trim(),
        _passwordController.text,
      );
      if (!mounted) return;
      Navigator.of(context).pushReplacementNamed('/home');
    } catch (e) {
      if (!mounted) return;
      showErrorSnack(context, '$e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: TqTokens.space16),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.build_circle,
                    size: 80,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                  const SizedBox(height: TqTokens.space8),
                  Text(
                    'TorqueHub',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: TqTokens.fontWeightBold,
                    ),
                  ),
                  const SizedBox(height: TqTokens.space4),
                  Text(
                    'Acesso do mecânico',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: TqTokens.neutral400,
                    ),
                  ),
                  const SizedBox(height: TqTokens.space24),
                  TqTextField(
                    controller: _emailController,
                    label: 'Email',
                    prefixIcon: Icons.email_outlined,
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                    validator: (value) {
                      if (value == null || value.trim().isEmpty) {
                        return 'Informe o email';
                      }
                      if (!value.contains('@')) return 'Email inválido';
                      return null;
                    },
                  ),
                  const SizedBox(height: TqTokens.space8),
                  TqTextField(
                    controller: _passwordController,
                    label: 'Senha',
                    prefixIcon: Icons.lock_outlined,
                    obscureText: _obscurePassword,
                    textInputAction: TextInputAction.done,
                    onFieldSubmitted: (_) => _handleLogin(),
                    suffix: IconButton(
                      icon: Icon(
                        _obscurePassword
                            ? Icons.visibility_off
                            : Icons.visibility,
                      ),
                      onPressed: () {
                        setState(() => _obscurePassword = !_obscurePassword);
                      },
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Informe a senha';
                      }
                      if (value.length < 6) return 'Mínimo de 6 caracteres';
                      return null;
                    },
                  ),
                  const SizedBox(height: TqTokens.space16),
                  TqButton.ghost(
                    label: 'Entrar',
                    loading: _loading,
                    onPressed: _loading ? null : _handleLogin,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
