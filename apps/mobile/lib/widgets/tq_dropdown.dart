/// Reusable dropdown component with consistent visual style.
///
/// Follows the same design language as [TqButton] — clean borders,
/// rounded corners, matching typography and color tokens.
/// Uses [showMenu] for the popup, allowing independent margin control
/// (Flutter's native DropdownButtonFormField forces popup = field width).
library;

import 'package:flutter/material.dart';
import '../theme/app_tokens.dart';

/// Margem horizontal do popup de opções.
const _kPopupMargin = 16.0;

/// Dropdown select padronizado para o TorqueHub.
///
/// Campo visual idêntico ao [TqTextField]. Popup com margens laterais,
/// cantos arredondados e sombra sutil.
class TqDropdown<T> extends StatelessWidget {
  /// Valor atualmente selecionado.
  final T? value;

  /// Texto exibido quando nenhum valor está selecionado.
  final String hint;

  /// Rótulo exibido acima do dropdown.
  final String? label;

  /// Lista de itens disponíveis para seleção.
  final List<DropdownMenuItem<T>> items;

  /// Callback quando o valor muda. Null desabilita o dropdown.
  final void Function(T?)? onChanged;

  /// Validador para uso dentro de um [Form].
  final String? Function(T?)? validator;

  /// Ícone à esquerda (prefixo).
  final IconData? prefixIcon;

  const TqDropdown({
    super.key,
    required this.value,
    required this.hint,
    required this.items,
    required this.onChanged,
    this.label,
    this.validator,
    this.prefixIcon,
  });

  @override
  Widget build(BuildContext context) {
    final isDisabled = onChanged == null;
    final selectedItem = items.cast<DropdownMenuItem<T>?>().firstWhere(
      (item) => item?.value == value,
      orElse: () => null,
    );

    return FormField<T>(
      initialValue: value,
      validator: validator,
      builder: (FormFieldState<T> state) {
        final hasError = state.hasError;

        return GestureDetector(
          onTap: isDisabled || items.isEmpty
              ? null
              : () => _openMenu(context, state),
          child: InputDecorator(
            decoration: InputDecoration(
              labelText: label,
              labelStyle: TextStyle(
                color: hasError ? TqTokens.danger : TqTokens.neutral600,
                fontSize: TqTokens.fontSizeMd,
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: TqTokens.space6,
                vertical: TqTokens.space5,
              ),
              filled: true,
              fillColor:
                  isDisabled ? TqTokens.background : TqTokens.card,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(TqTokens.radiusXl),
                borderSide: BorderSide(
                  color: hasError ? TqTokens.danger : TqTokens.neutral200,
                  width: 1,
                ),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(TqTokens.radiusXl),
                borderSide: BorderSide(
                  color: hasError ? TqTokens.danger : TqTokens.neutral200,
                  width: 1,
                ),
              ),
              disabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(TqTokens.radiusXl),
                borderSide: BorderSide(
                  color: TqTokens.neutral200.withAlpha(120),
                  width: 1,
                ),
              ),
              errorText: state.errorText,
              suffixIcon: Icon(
                Icons.keyboard_arrow_down_rounded,
                color: isDisabled
                    ? TqTokens.neutral400
                    : TqTokens.neutral600,
                size: 22,
              ),
            ),
            child: selectedItem != null
                ? DefaultTextStyle(
                    style: const TextStyle(
                      color: TqTokens.neutral800,
                      fontSize: TqTokens.fontSizeMd,
                    ),
                    child: selectedItem.child,
                  )
                : Text(
                    hint,
                    style: const TextStyle(
                      color: TqTokens.neutral400,
                      fontSize: TqTokens.fontSizeMd,
                    ),
                  ),
          ),
        );
      },
    );
  }

  /// Abre o popup de opções com margens laterais.
  void _openMenu(BuildContext context, FormFieldState<T> state) {
    final renderBox = context.findRenderObject() as RenderBox;
    final offset = renderBox.localToGlobal(Offset.zero);
    final fieldHeight = renderBox.size.height;
    final screenWidth = MediaQuery.of(context).size.width;

    showMenu<T>(
      context: context,
      position: RelativeRect.fromLTRB(
        _kPopupMargin,
        offset.dy + fieldHeight + 4,
        _kPopupMargin,
        0,
      ),
      items: items
          .map(
            (item) => PopupMenuItem<T>(
              value: item.value,
              height: 48,
              child: DefaultTextStyle(
                style: TextStyle(
                  color: item.value == value
                      ? TqTokens.primary
                      : TqTokens.neutral800,
                  fontSize: TqTokens.fontSizeMd,
                  fontWeight: item.value == value
                      ? TqTokens.fontWeightSemibold
                      : TqTokens.fontWeightNormal,
                ),
                child: item.child,
              ),
            ),
          )
          .toList(),
      elevation: 3,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(TqTokens.radiusXl),
        side: const BorderSide(color: TqTokens.neutral200, width: 0.5),
      ),
      color: TqTokens.card,
      surfaceTintColor: Colors.transparent,
      constraints: BoxConstraints(
        maxWidth: screenWidth - (_kPopupMargin * 2),
        minWidth: screenWidth - (_kPopupMargin * 2),
      ),
    ).then((selectedValue) {
      if (selectedValue != null) {
        state.didChange(selectedValue);
        onChanged?.call(selectedValue);
      }
    });
  }
}
