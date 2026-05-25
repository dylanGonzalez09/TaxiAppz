import 'package:injectable/injectable.dart';
import 'package:taxiappzpro/bottom_sheets/trip_request_bs/trip_request_vm.dart';
import 'package:taxiappzpro/ui/app_camera_preview/app_camera_previewVm.dart';
import 'package:taxiappzpro/ui/country/coutry_list_vm.dart';
import 'package:taxiappzpro/ui/dash_board/dashboard_vm.dart';
import 'package:taxiappzpro/ui/demokey/demo_key_vm.dart';
import 'package:taxiappzpro/ui/documents/documents_vm.dart';
import 'package:taxiappzpro/ui/documents/upload_document/document_upload_vm.dart';
import 'package:taxiappzpro/ui/driver_blocked/driver_blocked_vm.dart';
import 'package:taxiappzpro/ui/intro/intro_vm.dart';
import 'package:taxiappzpro/ui/language/language_vm.dart';
import 'package:taxiappzpro/ui/notification/notification_vm.dart';
import 'package:taxiappzpro/ui/permission_screen/permission_vm.dart';
import 'package:taxiappzpro/ui/profile/profile_vehicle/profile_vehicle_vm.dart';
import 'package:taxiappzpro/ui/profile/profile_vm.dart';
import 'package:taxiappzpro/ui/register/vehicle_information_vm.dart';
import 'package:taxiappzpro/ui/splash/splash_vm.dart';
import 'package:taxiappzpro/ui/trip/trip_vm.dart';
import 'package:taxiappzpro/ui/web_view/web_view.dart';

import '../ui/company/company_vehicle_list_vm.dart';
import '../ui/history/cancelled/cancelled_detail_vm.dart';
import '../ui/history/completed/invoice_vm.dart';
import '../ui/history/history_list_vm.dart';
import '../ui/history/scheduled/scheduled_detail_vm.dart';
import '../ui/login/login_vm.dart';
import '../ui/map/map_vm.dart';
import '../ui/otp/otp_vm.dart';
import '../ui/register/register_vm.dart';
import '../ui/updateapp/update_app_vm.dart';
import '../ui/wallet/wallet_vm.dart';
import '../ui/web_view/web_view_vm.dart';

@module
abstract class ViewModelModule {
  IntroVm get introVm => IntroVm();
  UpdateAppVm get updateVm => UpdateAppVm();

  MapVm get mapVm => MapVm();

  SplashVm get splashVm => SplashVm();

  TripRequestVm get tripRequestVm => TripRequestVm();

  LoginVm get loginVm => LoginVm();

  TripVm get tripVm => TripVm();

  RegisterVm get registerVm => RegisterVm();

  VehicleInformationVm get vehicleInformationVm => VehicleInformationVm();

  ProfileVm get profileVm => ProfileVm();

  ProfileVehicleVm get profileVehicleVm => ProfileVehicleVm();

  OtpVm get otpVm => OtpVm();

  HistoryListVm get historyListVm => HistoryListVm();

  InvoiceVm get invoiceVm => InvoiceVm();

  ScheduledDetailVm get scheduledDetailVm => ScheduledDetailVm();

  CancelledDetailVm get cancelledDetailVm => CancelledDetailVm();

  WalletVm get walletVm => WalletVm();

  DashboardVm get dashboardVm => DashboardVm();

  LanguageVm get languageVm => LanguageVm();

  CountryListVm get countryList => CountryListVm();

  PermissionVm get permissionVm => PermissionVm();

  DriverBlockedVm get driverBlockedVm => DriverBlockedVm();

  DocumentsVm get documentsVm => DocumentsVm();

  DocumentUploadVm get documentUploadVm => DocumentUploadVm();

  AppCameraPreviewVm get appCameraPreview => AppCameraPreviewVm();

  NotificationVm get notificationVM => NotificationVm();

  WebViewVm get webViewVm => WebViewVm();

  DemoKeyVm get demoKeyVm => DemoKeyVm();

  CompanyVehicleListVm get companyVehicleListVm => CompanyVehicleListVm();
}
