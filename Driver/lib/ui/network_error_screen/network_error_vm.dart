import 'dart:async';
import 'dart:developer' as developer;
import 'dart:io';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/cupertino.dart';
import 'package:go_router/go_router.dart';
import 'package:taxiappzpro/base/base_vm.dart';
import 'package:taxiappzpro/utils/custom_router_config.dart';

import '../../main.dart';
import '../../network/response_models/translation_model.dart';

class ConnectionStatusListener extends BaseVm {
  @override
  TranslationModel translation = TranslationModel();
  static final ConnectionStatusListener _singleton =
      ConnectionStatusListener._internal();

  ConnectionStatusListener._internal();

  static ConnectionStatusListener getInstance() => _singleton;

  final Connectivity _connectivity = Connectivity();
  bool hasConnection = false;
  bool hasShownNoInternet = false;
  String? previousRoute;

  final StreamController<bool> connectionChangeController =
      StreamController<bool>.broadcast();

  Stream<bool> get connectionChange => connectionChangeController.stream;

  Future<void> initialize() async {
    _connectivity.onConnectivityChanged.listen((result) {
      _updateConnectionStatus(result);
    });

    await _initializeConnectivity();
  }

  Future<void> _initializeConnectivity() async {
    try {
      final result = await _connectivity.checkConnectivity();
      hasConnection = await _checkInternetAccess();
    } catch (e) {
      developer.log('Could not check connectivity status', error: e);
    }

    connectionChangeController.add(hasConnection);
  }

  Future<void> _updateConnectionStatus(List<ConnectivityResult> result) async {
    hasConnection = await _checkInternetAccess();
    connectionChangeController.add(hasConnection);
    developer.log('Connectivity changed: $hasConnection');
  }

  Future<bool> _checkInternetAccess() async {
    const int maxRetries = 3;
    int retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        final result = await InternetAddress.lookup('google.com')
            .timeout(const Duration(seconds: 10));
        return result.isNotEmpty && result[0].rawAddress.isNotEmpty;
      } on SocketException {
        retryCount++;
        if (retryCount >= maxRetries) {
          return false;
        }
      } on TimeoutException {
        retryCount++;
        if (retryCount >= maxRetries) {
          return false;
        }
      }
    }
    return false;
  }

  void dispose() {
    connectionChangeController.close();
  }
}

// void updateConnectivity(
//     bool hasConnection, ConnectionStatusListener connectionStatus) {
//   if (!hasConnection) {
//     if (!connectionStatus.hasShownNoInternet) {
//       connectionStatus.hasShownNoInternet = true;
//       connectionStatus.previousRoute = GoRouter.of(navigatorKey.currentContext!)
//           .routerDelegate
//           .currentConfiguration
//           .fullPath;
//       GoRouter.of(navigatorKey.currentContext!).go('/noInternetScreen');
//     }
//   } else {
//     if (connectionStatus.hasShownNoInternet) {
//       connectionStatus.hasShownNoInternet = false;
//       if (connectionStatus.previousRoute != null) {
//         GoRouter.of(navigatorKey.currentContext!).go(connectionStatus.previousRoute!);
//       } else {
//         GoRouter.of(navigatorKey.currentContext!).go('/');
//       }
//     }
//   }
// }

void updateConnectivity(
    bool hasConnection, ConnectionStatusListener connectionStatus) {
  if (!hasConnection) {
    if (!connectionStatus.hasShownNoInternet) {
      connectionStatus.hasShownNoInternet = true;
      if (MyApp.of(navigatorKey.currentState!.context)?.currentScreenLabel !=
          CustomRouterConfig.noInternetScreen) {
        GoRouter.of(navigatorKey.currentContext!)
            .pushNamed(CustomRouterConfig.noInternetScreen);
      }
    }
  } else {
    if (connectionStatus.hasShownNoInternet) {
      connectionStatus.hasShownNoInternet = false;
      if (GoRouter.of(navigatorKey.currentContext!).canPop()) {
        GoRouter.of(navigatorKey.currentContext!).pop();
      } else {
        GoRouter.of(navigatorKey.currentContext!)
            .pushNamed(CustomRouterConfig.splashScreen);
      }

      if (MyApp.of(navigatorKey.currentState!.context)?.currentScreenLabel ==
          CustomRouterConfig.noInternetScreen) {
        if (GoRouter.of(navigatorKey.currentContext!).canPop()) {
          GoRouter.of(navigatorKey.currentContext!).pop();
        } else {
          GoRouter.of(navigatorKey.currentContext!)
              .pushNamed(CustomRouterConfig.splashScreen);
        }
      }
    }
  }
}

Future<void> initNoInternetListener() async {
  var connectionStatus = ConnectionStatusListener.getInstance();
  await connectionStatus.initialize();

  if (!connectionStatus.hasConnection) {
    updateConnectivity(false, connectionStatus);
  }

  connectionStatus.connectionChange.listen((hasConnection) {
    developer.log("Connectivity changed: $hasConnection");
    updateConnectivity(hasConnection, connectionStatus);
  });
}
