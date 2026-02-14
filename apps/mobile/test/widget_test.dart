// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:torquehub_mobile/main.dart';

void main() {
  testWidgets('App renders TorqueHub title', (WidgetTester tester) async {
    await tester.pumpWidget(const TorqueHubApp());

    expect(find.text('TorqueHub'), findsOneWidget);
    expect(find.text('TorqueHub Mobile'), findsOneWidget);
    expect(find.text('Gestão de Manutenção Automotiva'), findsOneWidget);
  });

  testWidgets('App renders test buttons', (WidgetTester tester) async {
    await tester.pumpWidget(const TorqueHubApp());

    expect(find.text('GET /health'), findsOneWidget);
    expect(find.text('POST /service-orders'), findsOneWidget);
  });
}
