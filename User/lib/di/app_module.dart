import 'package:dio/dio.dart';
import 'package:injectable/injectable.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/custom_router.dart';
import '../utils/mqtt_helper.dart';
import '../network/api_helper.dart';
import 'package:package_info_plus/package_info_plus.dart';

@module
abstract class AppModule {
  @singleton
  Dio get dio => Dio();

  @singleton
  ApiHelper get apiHelper => ApiHelper();

  @preResolve
  @singleton
  Future<SharedPreferences> get sharePreference =>
      SharedPreferences.getInstance();

  @singleton
  CustomRouter get customRouterConfig => CustomRouter();

  @singleton
  MqttHelper get mqttHelper => MqttHelper();

  @preResolve
  @singleton
  Future<PackageInfo> get packageInfo => PackageInfo.fromPlatform();
}
