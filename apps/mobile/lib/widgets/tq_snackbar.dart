/// Reusable SnackBar helpers — consistent feedback using TqTokens.
///
/// Eliminates ~25 scattered `ScaffoldMessenger.of(context).showSnackBar()`
/// calls with hardcoded `Colors.red`, `Colors.green`, `Colors.orange`.
library;

import 'package:flutter/material.dart';
import '../theme/app_tokens.dart';

/// Shows a success snackbar (green background).
void showSuccessSnack(BuildContext context, String message) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(message), backgroundColor: TqTokens.success),
  );
}

/// Shows an error snackbar (red background).
void showErrorSnack(BuildContext context, String message) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(message), backgroundColor: TqTokens.danger),
  );
}

/// Shows a warning snackbar (amber background).
void showWarningSnack(BuildContext context, String message) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(message), backgroundColor: TqTokens.warning),
  );
}

/// Shows a neutral/info snackbar (default theme colors).
void showInfoSnack(BuildContext context, String message) {
  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
}
