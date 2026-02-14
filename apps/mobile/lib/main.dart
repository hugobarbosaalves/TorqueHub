/// TorqueHub Mobile — Mechanic's workshop management tool.
///
/// This is the entry point for the Flutter mobile application.
/// The mobile app is designed for mechanics/workshop staff, NOT customers.
/// Customers use the web portal at apps/web.
library;

import 'package:flutter/material.dart';
import 'screens/orders_screen.dart';
import 'screens/customers_screen.dart';
import 'screens/vehicles_screen.dart';

/// Entry point — launches the [TorqueHubApp] widget.
void main() {
  runApp(const TorqueHubApp());
}

/// Root application widget with Material Design theme and bottom navigation.
class TorqueHubApp extends StatelessWidget {
  const TorqueHubApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TorqueHub',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorSchemeSeed: const Color(0xFF1A1A2E),
        useMaterial3: true,
        brightness: Brightness.light,
      ),
      home: const MainShell(),
    );
  }
}

/// Shell com BottomNavigationBar: Ordens | Clientes | Veículos
class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  final _ordersKey = GlobalKey<OrdersScreenState>();

  late final List<Widget> _screens;

  @override
  void initState() {
    super.initState();
    _screens = [
      OrdersScreen(key: _ordersKey),
      const CustomersScreen(),
      const VehiclesScreen(),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _screens),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (i) => setState(() => _currentIndex = i),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.list_alt_outlined),
            selectedIcon: Icon(Icons.list_alt),
            label: 'Ordens',
          ),
          NavigationDestination(
            icon: Icon(Icons.people_outline),
            selectedIcon: Icon(Icons.people),
            label: 'Clientes',
          ),
          NavigationDestination(
            icon: Icon(Icons.directions_car_outlined),
            selectedIcon: Icon(Icons.directions_car),
            label: 'Veículos',
          ),
        ],
      ),
    );
  }
}
