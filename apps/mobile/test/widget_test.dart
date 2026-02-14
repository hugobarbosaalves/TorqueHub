// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter_test/flutter_test.dart';

import 'package:torquehub_mobile/main.dart';

void main() {
  testWidgets('App renders TorqueHub appbar and bottom nav', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const TorqueHubApp());

    // AppBar title
    expect(find.text('TorqueHub'), findsOneWidget);

    // Bottom navigation labels
    expect(find.text('Ordens'), findsOneWidget);
    expect(find.text('Nova Ordem'), findsOneWidget);
    expect(find.text('Clientes'), findsOneWidget);
    expect(find.text('Veículos'), findsOneWidget);
  });
}
