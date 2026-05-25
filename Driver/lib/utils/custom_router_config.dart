import 'package:taxiappzpro/network/response_models/advertisement_model.dart';
import 'package:taxiappzpro/ui/company/company_vehicle_list_screen.dart';
import 'package:flutter/cupertino.dart';
import 'package:go_router/go_router.dart';
import 'package:taxiappzpro/main.dart';
import 'package:taxiappzpro/network/response_models/trips_model.dart';
import 'package:taxiappzpro/ui/Register/vehicle_information_screen.dart';
import 'package:taxiappzpro/ui/app_camera_preview/app_camera_preview.dart';
import 'package:taxiappzpro/ui/app_status/app_status.dart';
import 'package:taxiappzpro/ui/country/country_list_screen.dart';
import 'package:taxiappzpro/ui/dash_board/dashboard_screen.dart';
import 'package:taxiappzpro/ui/demokey/demo_key.dart';
import 'package:taxiappzpro/ui/documents/documents_screen.dart';
import 'package:taxiappzpro/ui/documents/upload_document/upload_document_screen.dart';
import 'package:taxiappzpro/ui/driver_blocked/driver_blocked_screen.dart';
import 'package:taxiappzpro/ui/intro/into_screen.dart';
import 'package:taxiappzpro/ui/language/language_screen.dart';
import 'package:taxiappzpro/ui/map/map_screen.dart';
import 'package:taxiappzpro/ui/notification/notification_screen.dart';
import 'package:taxiappzpro/ui/otp/otp_screen.dart';
import 'package:taxiappzpro/ui/permission_screen/permission_screen.dart';
import 'package:taxiappzpro/ui/profile/profile_screen.dart';
import 'package:taxiappzpro/ui/profile/profile_vehicle/profile_vehicle_screen.dart';
import 'package:taxiappzpro/ui/referral/referral_screen.dart';
import 'package:taxiappzpro/ui/splash/splash_screen.dart';
import 'package:taxiappzpro/ui/support/faq/faq_screen.dart';
import 'package:taxiappzpro/ui/support/sos/sos_screen.dart';
import 'package:taxiappzpro/ui/support/support_screen.dart';
import 'package:taxiappzpro/ui/tracktickets/track_tickets.dart';
import 'package:taxiappzpro/ui/trip/trip_screen.dart';
import 'package:taxiappzpro/ui/updateapp/update_app.dart';
import 'package:taxiappzpro/ui/wallet/wallet_screen.dart';
import 'package:taxiappzpro/ui/web_view/web_view.dart';
import 'package:taxiappzpro/utils/custom_navigator_observer.dart';
import '../components/driver_block_screen.dart';
import '../network/response_models/req_in_pro_model.dart';
import '../network/response_models/translation_model.dart';
import '../play_ground.dart';
import '../ui/Register/register_screen.dart';
import '../ui/chat_screen/chat_screen.dart';
import '../ui/history/cancelled/cancelled_detail_screen.dart';
import '../ui/history/completed/invoice_screen.dart';
import '../ui/history/history_list_screen.dart';
import '../ui/history/scheduled/scheduled_detail_screen.dart';
import '../ui/login/login_screen.dart';
import '../ui/manage_vehicle/manage_vehicle.dart';
import '../ui/meterUploadScreen/meter_upload_screen.dart';
import '../ui/network_error_screen/network_error_screen.dart';
import '../ui/subscription/subscription_screen.dart';
import '../ui/support/Complaint/complaint_screen.dart';
import '../ui/tracktickets/track_ticket_details.dart';
import '../ui/wallet/saved_card_list/saved_card_list_screen.dart';
import '../ui/wallet/transaction_list/transaction_list_screen.dart';

class CustomRouterConfig {
  static const splashScreen = "splashScreen";
  static const introScreen = "introScreen";
  static const mapScreen = "mapScreen";
  static const loginScreen = "loginScreen";
  static const tripScreen = "tripScreen";
  static const registerScreen = "registerScreen";
  static const vehicleInformationScreen = "vehicleInformationScreen";
  static const otpScreen = "otpScreen";
  static const profileScreen = "profileScreen";
  static const profileVehicleScreen = "profileVehicleScreen";
  static const historyListScreen = "historyListScreen";
  static const invoiceScreen = "invoiceScreen";
  static const scheduledDetailScreen = "scheduledDetailScreen";
  static const cancelledDetailScreen = "cancelledDetailScreen";
  static const dashBoardScreen = "dashboardScreen";
  static const walletScreen = "walletScreen";
  static const myRidesScreen = "myRidesScreen";
  static const referralScreen = "referralScreen";
  static const documentsScreen = "documentScreen";
  static const notificationScreen = "notificationScreen";
  static const supportScreen = "supportScreen";
  static const languageScreen = "languageScreen";
  static const appStatusScreen = "appStatusScreen";
  static const savedCardListScreen = "savedCardListScreen";
  static const transactionListScreen = "transactionListScreen";
  static const sosScreen = "sosScreen";
  static const faqScreen = "faqScreen";
  static const complaintScreen = "complaintScreen";
  static const uploadDocumentScreen = "uploadDocumentScreen";
  static const playGround = "playGround";
  static const countryList = "countryList";
  static const permissionScreen = "permissionScreen";
  static const driverBlockedScreen = "driverBlockedScreen";
  static const subscriptionScreen = "subscriptionScreen";
  static const appCameraPreview = "appCameraPreview";
  static const webView = "webView";
  static const noInternetScreen = "noInternetScreen";
  static const meterUploadScreen = "meterUploadScreen";
  static const demoKey = "demoKey";
  static const updateApp = "updateApp";
  static const trackTickets = "trackTickets";
  static const trackTicketsDetails = "trackTicketsDetails";
  static const driverBlockscreen = "driverBlockscreen";
  static const companyVehicleListScreen = "companyVehicleListScreen";
  static const chatScreen = "chatScreen";
  static const manageVehicle = "manageVehicle";

  final routerConfig = GoRouter(
    initialLocation: "/splash",
    navigatorKey: navigatorKey,
    observers: [routeObserver, CustomNavigatorObserver()],
    routes: [
      GoRoute(
          path: "/splash",
          name: splashScreen,
          builder: (context, state) => const SplashScreen()),
      GoRoute(
          path: "/intro",
          name: introScreen,
          builder: (context, state) => const IntroScreen()),
      GoRoute(
          path: "/map",
          name: mapScreen,
          builder: (context, state) {
            final args = state.extra;
            if (args is Key) {
              return MapScreen(
                key: args,
              );
            } else {
              return const MapScreen();
            }
          }),
      GoRoute(
          path: "/login",
          name: loginScreen,
          builder: (context, state) => const LoginScreen()),
      GoRoute(
          path: "/otp",
          name: otpScreen,
          builder: (context, state) {
            final args = state.extra;
            if (args is Map<String, dynamic>) {
              return OtpScreen(
                args: args,
              );
            }
            return Container();
          }),
      GoRoute(
          path: "/trip",
          name: tripScreen,
          builder: (context, state) {
            final args = state.extra;
            if (args is RequestInProModel) {
              return TripScreen(tripModel: args);
            } else {
              return const TripScreen();
            }
          }),
      GoRoute(
          path: "/register",
          name: registerScreen,
          builder: (context, state) {
            final args = state.extra;
            if (args is Map<String, dynamic>) {
              return RegisterScreen(
                args: args,
              );
            }
            return Container();
          }),
      GoRoute(
          path: "/play_ground",
          name: playGround,
          builder: (context, state) => const PlayGround()),
      GoRoute(
          path: "/manageVehicle",
          name: manageVehicle,
          builder: (context, state) => const ManageVehicle()),
      GoRoute(
        path: "/$subscriptionScreen",
        name: subscriptionScreen,
        builder: (c, s) => const SubscriptionScreen(),
      ),
      GoRoute(
        path: "/vehicleInformation",
        name: vehicleInformationScreen,
        builder: (context, state) {
          final args = state.extra;

          Map<String, dynamic> dataArgs = {};
          bool fromManageVehicle = false;

          if (args is Map<String, dynamic>) {
            fromManageVehicle = args["fromManageVehicle"] == true;

            // If called from ManageVehicle you'll pass { fromManageVehicle: true, data: {...} }
            // If called from Register you'll pass the map directly.
            dataArgs = fromManageVehicle
                ? Map<String, dynamic>.from(args["data"] ?? {})
                : Map<String, dynamic>.from(args);
          }

          // Ensure the final args ALWAYS contains the fromManageVehicle flag
          dataArgs["fromManageVehicle"] = fromManageVehicle;

          return VehicleInformationScreen(
            args: dataArgs,
          );
        },
      ),




      GoRoute(
          path: "/profile",
          name: profileScreen,
          builder: (context, state) => const ProfileScreen()),
      GoRoute(
          path: "/profileVehicle",
          name: profileVehicleScreen,
          builder: (context, state) {
            final args = state.extra;
            if (args is Map<String, dynamic>) {
              return ProfileVehicleScreen(
                args: args,
              );
            }
            return Container();
          }),
      GoRoute(
          path: "/historyList",
          name: historyListScreen,
          builder: (context, state) => const HistoryListScreen()),
      GoRoute(
        path: "/invoice",
        name: invoiceScreen,
        builder: (context, state) {
          final args = state.extra;
          if (args is TripModel) {
            return InvoiceScreen(tripModel: args);
          } else {
            return const InvoiceScreen();
          }
        },
      ),
      GoRoute(
          path: "/scheduledDetail",
          name: scheduledDetailScreen,
          builder: (context, state) => const ScheduledDetailScreen()),
      GoRoute(
          path: "/cancelledDetail",
          name: cancelledDetailScreen,
          builder: (context, state) => state.extra is Map<String, dynamic>
              ? CancelledDetailScreen(map: state.extra as Map<String, dynamic>)
              : const CancelledDetailScreen(map: {})),
      GoRoute(
          path: "/dashboard",
          name: dashBoardScreen,
          builder: (context, state) => const DashboardScreen()),
      GoRoute(
          path: "/wallet",
          name: walletScreen,
          builder: (context, state) => const WalletScreen()),
      GoRoute(
          path: "/referral",
          name: referralScreen,
          builder: (context, state) => const ReferralScreen()),
      GoRoute(
        path: "/document",
        name: documentsScreen,
        builder: (context, state) {
          final args = state.extra;
          return DocumentsScreen(
            args: args is Map<String, dynamic> ? args : null,
          );
        },
      ),

      GoRoute(
          path: "/notification",
          name: notificationScreen,
          builder: (context, state) => const NotificationScreen()),
      GoRoute(
          path: "/support",
          name: supportScreen,
          builder: (context, state) => const SupportScreen()),
      GoRoute(
          path: "/language",
          name: languageScreen,
          builder: (context, state) => const LanguageScreen()),
      GoRoute(
          path: "/savedCardList",
          name: savedCardListScreen,
          builder: (context, state) => SavedCardListScreen()),
      GoRoute(
          path: "/transactionList",
          name: transactionListScreen,
          builder: (context, state) {
            final args = state.extra;
            if (args is Map<String, dynamic>) {
              return TransactionListScreen(
                args: args,
              );
            }
            return Container();
          }),
      GoRoute(
          path: "/sos",
          name: sosScreen,
          builder: (context, state) => const SosScreen()),
      GoRoute(
          path: "/faq",
          name: faqScreen,
          builder: (context, state) => FaqScreen(
              data: state.extra is Map<String, dynamic>
                  ? state.extra as Map<String, dynamic>
                  : const {})),
      GoRoute(
          path: "/complaint",
          name: complaintScreen,
          builder: (context, state) => ComplaintScreen(
              data: state.extra is Map<String, dynamic>
                  ? state.extra as Map<String, dynamic>
                  : {})),
      GoRoute(
          path: "/uploadDocument",
          name: uploadDocumentScreen,
          builder: (context, state) {
            final args = state.extra;
            if (args is Map<String, dynamic>) {
              return UploadDocumentScreen(
                args: args,
              );
            }
            return Container();
          }),
      GoRoute(
          path: "/appStatus",
          name: appStatusScreen,
          builder: (context, state) => const AppStatus()),
      GoRoute(
          path: "/countryList",
          name: countryList,
          builder: (context, state) => const CountryListScreen()),
      GoRoute(
          path: "/permission",
          name: permissionScreen,
          builder: (context, state) {
            final args = state.extra;
            if (args is String) {
              return PermissionScreen(
                destinationName: args,
              );
            }
            return Container();
          }),
      GoRoute(
          path: "/driverBlockedScreen",
          name: driverBlockedScreen,
          builder: (context, state) {
            final args = state.extra;
            if (args is Map<String,dynamic>) {
              return DriverBlockedScreen(
                args: args,
              );
            }
            return Container();
          }),
      GoRoute(
          path: "/appCameraPreview",
          name: appCameraPreview,
          builder: (context, state) {
            return const AppCameraPreview();
          }),
      GoRoute(
          path: "/companyVehicleListScreen",
          name: companyVehicleListScreen,
          builder: (context, state) {
            return const CompanyVehicleListScreen();
          }),
      GoRoute(
          path: "/webView",
          name: webView,
          builder: (context, state) {
            final args = state.extra;
            if (args is String) {
              return WebView(
                htmlContent: args,
              );
            }
            return Container();
          }),
      GoRoute(
          path: "/meterUploadScreen",
          name: meterUploadScreen,
          builder: (context, state) => state.extra is Map<String, dynamic>
              ? MeterUploadScreen(map: state.extra as Map<String, dynamic>)
              : Container()),
      GoRoute(
          path: "/noInternetScreen",
          name: noInternetScreen,
          builder: (context, state) => NoInternetScreen()),
      GoRoute(
          path: "/updateApp",
          name: updateApp,
          builder: (context, state) {
            final args = state.extra;
            if (args is TranslationModel) {
              return UpdateApp(
                translation: args,
              );
            }
            return Container();
          }),
      GoRoute(
          path: "/demoKey",
          name: demoKey,
          builder: (context, state) {
            final args = state.extra;
            if (args is Map<String, dynamic>) {
              return DemoKey(
                args: args,
              );
            }
            return Container();
          }),
      GoRoute(
        path: "/$trackTickets",
        name: trackTickets,
        builder: (c, s) => const TrackTickets(),
      ),
      GoRoute(
          path: "/driverBlockscreen",
          name: driverBlockscreen,
          builder: (context, state) {
            final args = state.extra;
            if (args is AdvertisementModel) {
              return DriverBlockScreen(
                args: args,
              );
            }
            return Container();
          }),
      GoRoute(
        path: "/chatScreen",
        name: chatScreen,
        builder: (context, state) {
          final args = state.extra;
          if (args is Map<String, dynamic>) {
            return DriverChatScreen(
              driverId: args["driverId"] as String?,
              userId: args["userId"] as String?,
              userName: args["userName"]as String?,
              tripStartTime : args["tripStartTime"]as String?,
              reqId : args["requestID"]as String?,
            );
          }
          return const DriverChatScreen();
        },
      ),
      GoRoute(
        path: "/$trackTicketsDetails",
        name: trackTicketsDetails,
        builder: (c, s) => TrackTicketDetails(
          data: s.extra is Map<String, dynamic>
              ? s.extra as Map<String, dynamic>
              : {},
        ),
      ),
    ],
  );
}
