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

import '../bottom_sheets/trip_request_bs/trip_request_vm.dart' as _i546;
import '../network/api_helper.dart' as _i938;
import '../ui/app_camera_preview/app_camera_previewVm.dart' as _i1032;
import '../ui/company/company_vehicle_list_vm.dart' as _i78;
import '../ui/country/coutry_list_vm.dart' as _i536;
import '../ui/dash_board/dashboard_vm.dart' as _i438;
import '../ui/demokey/demo_key_vm.dart' as _i190;
import '../ui/documents/documents_vm.dart' as _i447;
import '../ui/documents/upload_document/document_upload_vm.dart' as _i297;
import '../ui/driver_blocked/driver_blocked_vm.dart' as _i114;
import '../ui/history/cancelled/cancelled_detail_vm.dart' as _i491;
import '../ui/history/completed/invoice_vm.dart' as _i160;
import '../ui/history/history_list_vm.dart' as _i749;
import '../ui/history/scheduled/scheduled_detail_vm.dart' as _i392;
import '../ui/intro/intro_vm.dart' as _i460;
import '../ui/language/language_vm.dart' as _i939;
import '../ui/login/login_vm.dart' as _i351;
import '../ui/map/map_vm.dart' as _i942;
import '../ui/notification/notification_vm.dart' as _i20;
import '../ui/otp/otp_vm.dart' as _i125;
import '../ui/permission_screen/permission_vm.dart' as _i1068;
import '../ui/profile/profile_vehicle/profile_vehicle_vm.dart' as _i724;
import '../ui/profile/profile_vm.dart' as _i619;
import '../ui/register/register_vm.dart' as _i95;
import '../ui/register/vehicle_information_vm.dart' as _i663;
import '../ui/splash/splash_vm.dart' as _i514;
import '../ui/trip/trip_vm.dart' as _i1049;
import '../ui/updateapp/update_app_vm.dart' as _i689;
import '../ui/wallet/wallet_vm.dart' as _i245;
import '../ui/web_view/web_view_vm.dart' as _i620;
import '../utils/custom_router_config.dart' as _i546;
import '../utils/mqtt_helper.dart' as _i575;
import 'app_module.dart' as _i460;
import 'viemodel_module.dart' as _i141;

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
  final viewModelModule = _$ViewModelModule();
  final appModule = _$AppModule();
  gh.factory<_i460.IntroVm>(() => viewModelModule.introVm);
  gh.factory<_i689.UpdateAppVm>(() => viewModelModule.updateVm);
  gh.factory<_i942.MapVm>(() => viewModelModule.mapVm);
  gh.factory<_i514.SplashVm>(() => viewModelModule.splashVm);
  gh.factory<_i546.TripRequestVm>(() => viewModelModule.tripRequestVm);
  gh.factory<_i351.LoginVm>(() => viewModelModule.loginVm);
  gh.factory<_i1049.TripVm>(() => viewModelModule.tripVm);
  gh.factory<_i95.RegisterVm>(() => viewModelModule.registerVm);
  gh.factory<_i663.VehicleInformationVm>(
      () => viewModelModule.vehicleInformationVm);
  gh.factory<_i619.ProfileVm>(() => viewModelModule.profileVm);
  gh.factory<_i724.ProfileVehicleVm>(() => viewModelModule.profileVehicleVm);
  gh.factory<_i125.OtpVm>(() => viewModelModule.otpVm);
  gh.factory<_i749.HistoryListVm>(() => viewModelModule.historyListVm);
  gh.factory<_i160.InvoiceVm>(() => viewModelModule.invoiceVm);
  gh.factory<_i392.ScheduledDetailVm>(() => viewModelModule.scheduledDetailVm);
  gh.factory<_i491.CancelledDetailVm>(() => viewModelModule.cancelledDetailVm);
  gh.factory<_i245.WalletVm>(() => viewModelModule.walletVm);
  gh.factory<_i438.DashboardVm>(() => viewModelModule.dashboardVm);
  gh.factory<_i939.LanguageVm>(() => viewModelModule.languageVm);
  gh.factory<_i536.CountryListVm>(() => viewModelModule.countryList);
  gh.factory<_i1068.PermissionVm>(() => viewModelModule.permissionVm);
  gh.factory<_i114.DriverBlockedVm>(() => viewModelModule.driverBlockedVm);
  gh.factory<_i447.DocumentsVm>(() => viewModelModule.documentsVm);
  gh.factory<_i297.DocumentUploadVm>(() => viewModelModule.documentUploadVm);
  gh.factory<_i1032.AppCameraPreviewVm>(() => viewModelModule.appCameraPreview);
  gh.factory<_i20.NotificationVm>(() => viewModelModule.notificationVM);
  gh.factory<_i620.WebViewVm>(() => viewModelModule.webViewVm);
  gh.factory<_i190.DemoKeyVm>(() => viewModelModule.demoKeyVm);
  gh.factory<_i78.CompanyVehicleListVm>(
      () => viewModelModule.companyVehicleListVm);
  gh.singleton<_i361.Dio>(() => appModule.dio);
  gh.singleton<_i938.ApiHelper>(() => appModule.apiHelper);
  await gh.singletonAsync<_i460.SharedPreferences>(
    () => appModule.sharePreference,
    preResolve: true,
  );
  gh.singleton<_i546.CustomRouterConfig>(() => appModule.customRouterConfig);
  await gh.singletonAsync<_i655.PackageInfo>(
    () => appModule.packageInfo,
    preResolve: true,
  );
  gh.singleton<_i575.MqttHelper>(() => appModule.mqttHelper);
  return getIt;
}

class _$ViewModelModule extends _i141.ViewModelModule {}

class _$AppModule extends _i460.AppModule {}
