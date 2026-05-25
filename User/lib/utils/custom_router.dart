import 'package:flutter/cupertino.dart';
import 'package:go_router/go_router.dart';
import 'package:user/components/user_block_screen.dart';
import 'package:user/network/response_models/advertisement_model.dart';
import 'package:user/network/response_models/types_model.dart';
import '../main.dart';
import '../network/response_models/translation_model.dart';
import '../network/response_models/trip_model.dart';
import '../play_ground.dart';
import '../ui/applyPromo/apply_promo_screen.dart';
import '../ui/camerapreview/app_camera_preview.dart';
import '../ui/chat_screen/chat_screen.dart';
import '../ui/demokey/demo_key.dart';
import '../ui/history/cancelled/cancelled_detail_screen.dart';
import '../ui/language/language_screen.dart';
import '../ui/login/login_screen.dart';
import '../ui/map/map_screen.dart';
import '../ui/map_view/map_view_screen.dart';
import '../ui/network_error_screen/network_error_screen.dart';
import '../ui/otp/otp_screen.dart';
import '../ui/profile/profile_screen.dart';
import '../ui/register/register_screen.dart';
import '../ui/rental/rental_screen.dart';
import '../ui/ride_confirm/ride_confirmation_screen.dart';
import '../ui/splash/splash_screen.dart';
import '../ui/support/faq/faq_screen.dart';
import '../ui/support/sos/sos_screen.dart';
import '../ui/support/support_screen.dart';
import '../ui/tracktickets/track_ticket_details.dart';
import '../ui/tracktickets/track_tickets.dart';
import '../ui/tripscreen/trip_screen.dart';
import '../ui/update_screen/update_screen.dart';
import '../ui/about/aboutUs_screen.dart';
import '../ui/bottomsheets/right_confirm_bs/right_confirm_bs.dart';
import '../ui/country/country_list_screen.dart';
import '../ui/destination/destination_screen.dart';
import '../ui/history/completed/invoice_screen.dart';
import '../ui/history/completedScreen/completed_screen.dart';
import '../ui/history/history_list_screen.dart';
import '../ui/history/scheduled/scheduled_detail_screen.dart';
import '../ui/introScreen/into_screen.dart';
import '../ui/map/trial_screen.dart';
import '../ui/notification/notification_screen.dart';
import '../ui/referralScreen/referral_screen.dart';
import '../ui/support/complaint/complaint_screen.dart';
import '../ui/waitingScreen/waiting_screen.dart';
import '../ui/wallet/saved_card_list/saved_card_list_screen.dart';
import '../ui/wallet/transacation_list/transacation_list_screen.dart';
import '../ui/wallet/wallet_screen.dart';
import '../ui/web_view/web_view.dart';
import 'custom_navigator_observer.dart';

class CustomRouter {
  static const splashScreen = "splashScreen";
  static const rightConfirmBs = "RightConfirmBs";
  static const testScreen = "testScreen";
  static const introScreen = "introScreen";
  static const loginScreen = "loginScreen";
  static const otpScreen = "otpScreen";
  static const registerScreen = "registerScreen";
  static const waitingScreen = "waitingScreen";
  static const referralScreen = "referralScreen";
  static const notificationScreen = "notificationScreen";
  static const mapScreen = "mapScreen";
  static const destinationScreen = "destinationScreen";
  static const profileScreen = "profileScreen";
  static const cameraAppPreview = "cameraAppPreview";
  static const tripScreen = "tripScreen";
  static const tripCancelScreen = "tripCancelScreen";
  static const invoiceScreen = "invoiceScreen";
  static const historyListScreen = "historyListScreen";
  static const scheduledDetailScreen = "scheduledDetailScreen";
  static const cancelledDetailScreen = "cancelledDetailScreen";
  static const savedCardListScreen = "savedCardListScreen";
  static const transactionListScreen = "transactionListScreen";
  static const walletScreen = "walletScreen";
  static const supportScreen = "supportScreen";
  static const complaintScreen = "complaintScreen";
  static const sosScreen = "sosScreen";
  static const languageScreen = "languageScreen";
  static const applyPromoScreen = "applyPromoScreen";
  static const trialScreen = "trialScreen";
  static const aboutUsScreen = "aboutUsScreen";
  static const countryList = "countryList";
  static const webView = "webView";
  static const noInternetScreen = "noInternetScreen";
  static const mapView = "mapView";
  static const rideConfirm = "rideConfirm";
  static const playGround = "playGround";
  static const completedScreen = "completedScreen";
  static const rentalRideConfirmScreen = "rentalRideConfirmScreen";
  static const demoKey = "demoKey";
  static const updateScreen = "updateScreen";
  static const trackTickets = "trackTickets";
  static const trackTicketsDetails = "trackTicketsDetails";
  static const userBlockScreen = "userBlockScreen";
  static const chatScreen = "chatScreen";
  static const faqScreen = "faqScreen";

  final router = GoRouter(
      initialLocation: "/splash",
      navigatorKey: navigatorKey,
      observers: [
        routeObserver,
        CustomNavigatorObserver()
      ],
      routes: [
        GoRoute(
            path: "/splash",
            name: splashScreen,
            builder: (context, state) => const SplashScreen()),
        GoRoute(
            path: "/completedScreen",
            name: completedScreen,
            builder: (context, state) => const CompletedScreen()),
        GoRoute(
            path: "/rightConfirmBs",
            name: rightConfirmBs,
            builder: (context, state) => const RightConfirmBs()),
        GoRoute(
            path: "/intro",
            name: introScreen,
            builder: (context, state) => const IntroScreen()),
        GoRoute(
            path: "/updatescreen",
            name: updateScreen,
            builder: (context, state) {
              final args = state.extra;
              if (args is TranslationModel) {
                return UpdateScreen(
                  translation: args,
                );
              }
              return Container();
            }),
        GoRoute(
            path: "/language",
            name: languageScreen,
            builder: (context, state) => const LanguageScreen()),
        GoRoute(
            path: "/countryList",
            name: countryList,
            builder: (context, state) => const CountryListScreen()),
        GoRoute(
            path: "/trialScreen",
            name: trialScreen,
            builder: (context, state) => const TrialScreen()),
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
            path: "/waiting",
            name: waitingScreen,
            builder: (context, state) => const WaitingScreen()),
        GoRoute(
            path: "/referral",
            name: referralScreen,
            builder: (context, state) => const ReferralScreen()),
        GoRoute(
            path: "/notification",
            name: notificationScreen,
            builder: (context, state) => const NotificationScreen()),
        GoRoute(
            path: "/map",
            name: mapScreen,
            builder: (context, state) {
              final args = state.extra;
              if (args is Key) {
                return MapScreen(key: args);
              } else {
                return const MapScreen();
              }
            }),
        GoRoute(
            path: "/destinationScreen",
            name: destinationScreen,
            builder: (context, state) {
              final args = state.extra;
              if (args is Map<String, dynamic>) {
                return DestinationScreen(args: args);
              }
              return Container();
            }),
        GoRoute(
            path: "/profile",
            name: profileScreen,
            builder: (c, s) => const ProfileScreen()),
        GoRoute(
            path: "/cameraAppPreview",
            name: cameraAppPreview,
            builder: (c, s) => const AppCameraPreview()),
        GoRoute(
            path: "/tripScreen",
            name: tripScreen,
            builder: (c, s) {
              final args = s.extra;
              if (args is Trip) {
                return TripScreen(
                  trip: args,
                );
              } else {
                return const TripScreen();
              }
            }),
        GoRoute(
            path: "/invoiceScreen",
            name: invoiceScreen,
            builder: (c, s) {
              final args = s.extra;
              if (args is Trip) {
                return InvoiceScreen(
                  trip: args,
                );
              } else {
                return const InvoiceScreen();
              }
            }),
        GoRoute(
            path: "/historyList",
            name: historyListScreen,
            builder: (context, state) => const HistoryListScreen()),
        GoRoute(
            path: "/scheduledDetail",
            name: scheduledDetailScreen,
            builder: (context, state) {
              final args = state.extra;
              if (args is Trip) {
                return ScheduledDetailScreen(trips: args);
              } else {
                return Container();
              }
            }),
        GoRoute(
            path: "/cancelledDetail",
            name: cancelledDetailScreen,
            builder: (context, state) => state.extra is Map<String, dynamic>
                ? CancelledDetailScreen(map: state.extra as Map<String, dynamic>)
                : const CancelledDetailScreen(map: {})),
        GoRoute(
            path: "/wallet",
            name: walletScreen,
            builder: (context, state) => const WalletScreen()),
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
            path: "/complaint",
            name: complaintScreen,
            builder: (context, state) => ComplaintScreen(
                data: state.extra is Map<String, dynamic>
                    ? state.extra as Map<String, dynamic>
                    : {})),
        GoRoute(
            path: "/sos",
            name: sosScreen,
            builder: (context, state) => const SosScreen()),
        GoRoute(
            path: "/support",
            name: supportScreen,
            builder: (context, state) => const SupportScreen()),
        GoRoute(
            path: "/applyPromo",
            name: applyPromoScreen,
            builder: (context, state) {
          final args = state.extra;
          if (args is String) {
            return ApplyPromoScreen(
              vehicleTypeId: args,
            );
          }
          return Container();
        }),
        GoRoute(
            path: "/aboutUs",
            name: aboutUsScreen,
            builder: (context, state) => const AboutUsScreen()),
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
            path: "/noInternetScreen",
            name: noInternetScreen,
            builder: (context, state) => const NoInternetScreen()),
        GoRoute(
            path: "/mapViewScreen",
            name: mapView,
            builder: (context, state) {
              return state.extra is Map<String, dynamic>
                  ? MapViewScreen(
                      map: state.extra as Map<String, dynamic>,
                    )
                  : const MapViewScreen(map: {});
            }),
        GoRoute(
            path: "/rideConfirm",
            name: rideConfirm,
            builder: (context, state) {
              final args = state.extra;
              if (args is Map<String, dynamic>) {
                return RideConfirmationScreen(map: args);
              }
              return Container();
            }),
        GoRoute(
            path: "/rentalRideConfirm",
            name: rentalRideConfirmScreen,
            builder: (context, state) {
              final args = state.extra;
              if (args is Map<String, dynamic>) {
                return RentalScreen(map: args);
              }
              return Container();
            }),
        GoRoute(
            path: "/playGround",
            name: playGround,
            builder: (context, state) => const PlayGround()),
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
          path: "/$trackTicketsDetails",
          name: trackTicketsDetails,
          builder: (c, s) => TrackTicketDetails(
            data: s.extra is Map<String, dynamic>
                ? s.extra as Map<String, dynamic>
                : {},
          ),
        ),
        GoRoute(
            path: "/userBlockScreen",
            name: userBlockScreen,
            builder: (context, state) {
              final args = state.extra;
              if (args is AdvertisementModel) {
                return UserBlockScreen(args: args);
              }
              return Container();
            }),
        GoRoute(
          path: "/chatScreen",
          name: chatScreen,
          builder: (context, state) {
            final args = state.extra;
            if (args is Map<String, dynamic>) {
              return UserChatScreen(
                driverId: args["driverId"] as String?,
                uSerId: args["userId"] as String?,
                userName: args["userName"] as String?,
                tripStartTime: args["tripStartTime"] as String?,
                reqID: args["reqID"] as String?,
          );
            }
            return const UserChatScreen();
          },
        ),
        GoRoute(
            path: "/faq",
            name: faqScreen,
            builder: (context, state) => FaqScreen(
                data: state.extra is Map<String, dynamic>
                    ? state.extra as Map<String, dynamic>
                    : const {})),
      ]);
}
