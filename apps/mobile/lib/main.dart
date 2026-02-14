import 'package:flutter/material.dart';
import 'screens/orders_screen.dart';
import 'screens/create_order_screen.dart';
import 'screens/customers_screen.dart';
import 'screens/vehicles_screen.dart';

void main() {
  runApp(const TorqueHubApp());
}

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

/// Shell com BottomNavigationBar: Ordens | Nova Ordem | Clientes | Veículos
class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  // GlobalKey para poder dar refresh na lista de ordens após criar uma
  final _ordersKey = GlobalKey<OrdersScreenState>();

  late final List<Widget> _screens;

  @override
  void initState() {
    super.initState();
    _screens = [
      OrdersScreen(key: _ordersKey),
      CreateOrderScreen(
        onOrderCreated: () {
          // Volta pra aba de ordens e recarrega
          setState(() => _currentIndex = 0);
          _ordersKey.currentState?.refresh();
        },
      ),
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
            icon: Icon(Icons.add_circle_outline),
            selectedIcon: Icon(Icons.add_circle),
            label: 'Nova Ordem',
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

