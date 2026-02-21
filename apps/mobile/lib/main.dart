/// TorqueHub Mobile — Mechanic's workshop management tool.
///
/// This is the entry point for the Flutter mobile application.
/// After login, the bottom navigation adapts to the user's role:
/// - WORKSHOP_OWNER: OS · Clientes · Veículos · Equipe · Config
/// - MECHANIC: Minhas OS · Config
/// - PLATFORM_ADMIN: OS (overview) · Config
library;

import 'package:flutter/material.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'screens/login_screen.dart';
import 'screens/orders_screen.dart';
import 'screens/customers_screen.dart';
import 'screens/vehicles_screen.dart';
import 'screens/team_screen.dart';
import 'screens/settings_screen.dart';
import 'services/auth_service.dart';
import 'theme/app_theme.dart';
import 'utils/constants.dart';

/// Entry point — initializes auth state and launches the app.
Future<void> main() async {
  final widgetsBinding = WidgetsFlutterBinding.ensureInitialized();
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);
  await AuthService.init();
  FlutterNativeSplash.remove();
  runApp(const TorqueHubApp());
}

/// Root application widget with Material Design theme and route management.
class TorqueHubApp extends StatelessWidget {
  const TorqueHubApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TorqueHub',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      initialRoute: AuthService.isAuthenticated ? '/home' : '/login',
      routes: {
        '/login': (_) => const LoginScreen(),
        '/home': (_) => const MainShell(),
      },
    );
  }
}

/// Shell com BottomNavigationBar adaptada ao role do usuário.
///
/// - WORKSHOP_OWNER: OS · Clientes · Veículos · Equipe · Config (5 tabs)
/// - MECHANIC: Minhas OS · Config (2 tabs)
/// - PLATFORM_ADMIN: OS · Config (2 tabs — gestão pesada é feita no web)
class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  final _ordersKey = GlobalKey<OrdersScreenState>();

  late final List<Widget> _screens;
  late final List<NavigationDestination> _destinations;

  @override
  void initState() {
    super.initState();
    _buildNavigation();
  }

  /// Constrói as telas e destinos de navegação com base no role.
  void _buildNavigation() {
    final role = AuthService.role;

    switch (role) {
      case UserRole.workshopOwner:
        _screens = [
          OrdersScreen(key: _ordersKey),
          const CustomersScreen(),
          const VehiclesScreen(),
          const TeamScreen(),
          const SettingsScreen(),
        ];
        _destinations = const [
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
          NavigationDestination(
            icon: Icon(Icons.group_outlined),
            selectedIcon: Icon(Icons.group),
            label: 'Equipe',
          ),
          NavigationDestination(
            icon: Icon(Icons.settings_outlined),
            selectedIcon: Icon(Icons.settings),
            label: 'Config',
          ),
        ];

      case UserRole.mechanic:
        _screens = [OrdersScreen(key: _ordersKey), const SettingsScreen()];
        _destinations = const [
          NavigationDestination(
            icon: Icon(Icons.list_alt_outlined),
            selectedIcon: Icon(Icons.list_alt),
            label: 'Minhas OS',
          ),
          NavigationDestination(
            icon: Icon(Icons.settings_outlined),
            selectedIcon: Icon(Icons.settings),
            label: 'Config',
          ),
        ];

      default:
        // PLATFORM_ADMIN — funcionalidades pesadas ficam no web portal
        _screens = [OrdersScreen(key: _ordersKey), const SettingsScreen()];
        _destinations = const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: 'Overview',
          ),
          NavigationDestination(
            icon: Icon(Icons.settings_outlined),
            selectedIcon: Icon(Icons.settings),
            label: 'Config',
          ),
        ];
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _screens),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
        destinations: _destinations,
      ),
    );
  }
}
