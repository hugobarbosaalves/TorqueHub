/// TorqueHub AppTheme — Material 3 theme built from design tokens.
///
/// This file creates the ThemeData from [TqTokens] constants,
/// providing a single place to control the visual identity.
/// @see packages/design-tokens/tokens.json — canonical source
library;

import 'package:flutter/material.dart';
import 'app_tokens.dart';

/// Builds the TorqueHub Material 3 theme.
abstract final class AppTheme {
  /// Light theme — the primary theme for the app.
  static ThemeData get light {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: TqTokens.primary,
      brightness: Brightness.light,
      primary: TqTokens.primary,
      secondary: TqTokens.accent,
      error: TqTokens.danger,
      surface: TqTokens.card,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: TqTokens.background,
      appBarTheme: const AppBarTheme(
        backgroundColor: TqTokens.primary,
        foregroundColor: TqTokens.card,
        elevation: 0,
      ),
      cardTheme: CardThemeData(
        color: TqTokens.card,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(TqTokens.radiusXl),
          side: BorderSide(color: TqTokens.neutral200),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: TqTokens.primary,
          foregroundColor: TqTokens.card,
          padding: const EdgeInsets.symmetric(
            vertical: TqTokens.space6,
            horizontal: TqTokens.space12,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(TqTokens.radiusMd),
          ),
          textStyle: const TextStyle(
            fontSize: TqTokens.fontSizeLg,
            fontWeight: TqTokens.fontWeightSemibold,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: TqTokens.primary,
          side: BorderSide(color: TqTokens.neutral200),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(TqTokens.radiusMd),
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: const OutlineInputBorder(),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: TqTokens.space6,
          vertical: TqTokens.space5,
        ),
        focusedBorder: OutlineInputBorder(
          borderSide: BorderSide(color: colorScheme.primary, width: 2),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        indicatorColor: TqTokens.accent.withAlpha(30),
        labelTextStyle: WidgetStatePropertyAll(
          TextStyle(
            fontSize: TqTokens.fontSizeXs,
            fontWeight: TqTokens.fontWeightSemibold,
            color: TqTokens.neutral600,
          ),
        ),
      ),
      snackBarTheme: const SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
      ),
      dividerTheme: DividerThemeData(
        color: TqTokens.neutral200,
        thickness: 1,
        space: TqTokens.space8,
      ),
      dropdownMenuTheme: DropdownMenuThemeData(
        menuStyle: MenuStyle(
          backgroundColor: WidgetStatePropertyAll(TqTokens.card),
          elevation: const WidgetStatePropertyAll(4),
          shape: WidgetStatePropertyAll(
            RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(TqTokens.radiusXl),
              side: const BorderSide(color: TqTokens.neutral200, width: 0.5),
            ),
          ),
          surfaceTintColor: const WidgetStatePropertyAll(Colors.transparent),
        ),
      ),
    );
  }
}
