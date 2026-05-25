import 'package:dio/dio.dart';
import 'package:injectable/injectable.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:taxiappzpro/network/api_helper.dart';
import 'package:taxiappzpro/utils/custom_router_config.dart';
import 'package:taxiappzpro/utils/mqtt_helper.dart';

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
  CustomRouterConfig get customRouterConfig => CustomRouterConfig();

  @preResolve
  @singleton
  Future<PackageInfo> get packageInfo => PackageInfo.fromPlatform();

  @singleton
  MqttHelper get mqttHelper => MqttHelper();
}
