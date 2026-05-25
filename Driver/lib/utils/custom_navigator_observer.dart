import 'package:flutter/cupertino.dart';

import 'package:flutter/material.dart';
import 'package:taxiappzpro/main.dart';

class CustomNavigatorObserver extends NavigatorObserver {
  static String currentRoute = '/splash';

  @override
  void didPush(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPush(route, previousRoute);
    _updateCurrentRoute(route);
  }

  @override
  void didPop(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPop(route, previousRoute);
    if (previousRoute != null) {
      _updateCurrentRoute(previousRoute);
    }
  }

  @override
  void didReplace({Route<dynamic>? newRoute, Route<dynamic>? oldRoute}) {
    super.didReplace(newRoute: newRoute, oldRoute: oldRoute);
    if (newRoute != null) {
      _updateCurrentRoute(newRoute);
    }
  }

  void _updateCurrentRoute(Route<dynamic> route) {
    if (route.settings.name != null) {
      currentRoute = route.settings.name!;
    }
    if (navigatorKey.currentState != null) {
      MyApp.of(navigatorKey.currentState!.context)
          ?.setCurrentLocation(currentRoute);
    }
    debugPrint('Current Route: $currentRoute');
  }
}
