// dart format width=80
// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// InjectableConfigGenerator
// **************************************************************************

// ignore_for_file: type=lint
// coverage:ignore-file

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:dio/dio.dart' as _i361;
import 'package:get_it/get_it.dart' as _i174;
import 'package:injectable/injectable.dart' as _i526;
import 'package:package_info_plus/package_info_plus.dart' as _i655;
import 'package:shared_preferences/shared_preferences.dart' as _i460;

import '../network/api_helper.dart' as _i938;
import '../utils/custom_router.dart' as _i647;
import '../utils/mqtt_helper.dart' as _i575;
import 'app_module.dart' as _i460;

// initializes the registration of main-scope dependencies inside of GetIt
Future<_i174.GetIt> $initGetIt(
  _i174.GetIt getIt, {
  String? environment,
  _i526.EnvironmentFilter? environmentFilter,
}) async {
  final gh = _i526.GetItHelper(
    getIt,
    environment,
    environmentFilter,
  );
  final appModule = _$AppModule();
  gh.singleton<_i361.Dio>(() => appModule.dio);
  gh.singleton<_i938.ApiHelper>(() => appModule.apiHelper);
  await gh.singletonAsync<_i460.SharedPreferences>(
    () => appModule.sharePreference,
    preResolve: true,
  );
  gh.singleton<_i647.CustomRouter>(() => appModule.customRouterConfig);
  gh.singleton<_i575.MqttHelper>(() => appModule.mqttHelper);
  await gh.singletonAsync<_i655.PackageInfo>(
    () => appModule.packageInfo,
    preResolve: true,
  );
  return getIt;
}

class _$AppModule extends _i460.AppModule {}
