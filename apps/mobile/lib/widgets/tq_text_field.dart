/// Reusable text field component with consistent visual style.
///
/// Follows the same design language as [TqDropdown] — clean rounded borders,
/// matching typography and color tokens from [TqTokens].
/// Use this instead of raw [TextFormField] across the app.
library;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/app_tokens.dart';

/// Campo de texto padronizado para o TorqueHub.
///
/// Estilo visual consistente: fundo branco (card), borda arredondada
/// `neutral200`, texto `neutral800`, hint/label `neutral400`/`neutral600`.
class TqTextField extends StatelessWidget {
  /// Controller do campo.
  final TextEditingController? controller;

  /// Rótulo flutuante.
  final String? label;

  /// Texto de dica (placeholder).
  final String? hint;

  /// Ícone à esquerda.
  final IconData? prefixIcon;

  /// Widget à direita (ex: botão de visibilidade de senha).
  final Widget? suffix;

  /// Número máximo de linhas. Use > 1 para textarea.
  final int maxLines;

  /// Tipo de teclado.
  final TextInputType? keyboardType;

  /// Ação do teclado (next, done, etc).
  final TextInputAction? textInputAction;

  /// Se o texto deve ser obscurecido (senha).
  final bool obscureText;

  /// Capitalização automática.
  final TextCapitalization textCapitalization;

  /// Formatadores de input (máscaras, filtros).
  final List<TextInputFormatter>? inputFormatters;

  /// Comprimento máximo de caracteres.
  final int? maxLength;

  /// Se o campo está habilitado.
  final bool enabled;

  /// Validador para uso dentro de um [Form].
  final String? Function(String?)? validator;

  /// Callback ao submeter o campo.
  final void Function(String)? onFieldSubmitted;

  /// Callback a cada mudança de texto.
  final void Function(String)? onChanged;

  /// Se true, usa padding reduzido (para uso dentro de cards).
  final bool dense;

  const TqTextField({
    super.key,
    this.controller,
    this.label,
    this.hint,
    this.prefixIcon,
    this.suffix,
    this.maxLines = 1,
    this.keyboardType,
    this.textInputAction,
    this.obscureText = false,
    this.textCapitalization = TextCapitalization.none,
    this.inputFormatters,
    this.maxLength,
    this.enabled = true,
    this.validator,
    this.onFieldSubmitted,
    this.onChanged,
    this.dense = false,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      keyboardType: keyboardType,
      textInputAction: textInputAction,
      obscureText: obscureText,
      textCapitalization: textCapitalization,
      inputFormatters: inputFormatters,
      maxLength: maxLength,
      enabled: enabled,
      validator: validator,
      onFieldSubmitted: onFieldSubmitted,
      onChanged: onChanged,
      style: const TextStyle(
        color: TqTokens.neutral800,
        fontSize: TqTokens.fontSizeMd,
      ),
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        labelStyle: const TextStyle(
          color: TqTokens.neutral600,
          fontSize: TqTokens.fontSizeMd,
        ),
        hintStyle: const TextStyle(
          color: TqTokens.neutral400,
          fontSize: TqTokens.fontSizeMd,
        ),
        prefixIcon: prefixIcon != null
            ? Icon(prefixIcon, color: TqTokens.neutral400, size: 20)
            : null,
        suffixIcon: suffix,
        filled: true,
        fillColor: enabled ? TqTokens.card : TqTokens.background,
        isDense: dense,
        contentPadding: EdgeInsets.symmetric(
          horizontal: TqTokens.space6,
          vertical: dense ? TqTokens.space4 : TqTokens.space5,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(TqTokens.radiusXl),
          borderSide: const BorderSide(color: TqTokens.neutral200, width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(TqTokens.radiusXl),
          borderSide: const BorderSide(color: TqTokens.neutral200, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(TqTokens.radiusXl),
          borderSide: const BorderSide(color: TqTokens.primary, width: 1.5),
        ),
        disabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(TqTokens.radiusXl),
          borderSide: BorderSide(
            color: TqTokens.neutral200.withAlpha(120),
            width: 1,
          ),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(TqTokens.radiusXl),
          borderSide: const BorderSide(color: TqTokens.danger, width: 1),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(TqTokens.radiusXl),
          borderSide: const BorderSide(color: TqTokens.danger, width: 1.5),
        ),
      ),
    );
  }
}
