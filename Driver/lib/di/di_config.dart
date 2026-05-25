import 'dart:io';

import 'package:device_info_plus/device_info_plus.dart';
import 'package:get_it/get_it.dart';
import 'package:injectable/injectable.dart';

import 'di_config.config.dart';

final getIt = GetIt.instance;

@InjectableInit(
  initializerName: r'$initGetIt', // default
  preferRelativeImports: true, // default
  asExtension: false, // default
)
Future<void> configureDependencies() async {
  await $initGetIt(getIt);
  getIt.registerSingleton<DeviceInfoPlugin>(DeviceInfoPlugin());
  if (Platform.isAndroid) {
    final androidInfo = await getIt<DeviceInfoPlugin>().androidInfo;
    getIt.registerSingleton<AndroidDeviceInfo>(androidInfo);
  }else if (Platform.isIOS) {
    final iosInfo = await getIt<DeviceInfoPlugin>().iosInfo;
    print('IosDeviceInfo  $iosInfo');
    getIt.registerSingleton<IosDeviceInfo>(iosInfo);
  }
}