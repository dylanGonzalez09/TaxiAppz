import 'package:taxiappzpro/utils/preference_helper.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:go_router/go_router.dart';
import 'package:taxiappzpro/bottom_sheets/confirmation_bs/confirmation_bs.dart';
import 'package:taxiappzpro/utils/custom_colors.dart';
import 'package:taxiappzpro/utils/custom_images.dart';
import 'package:taxiappzpro/utils/custom_router_config.dart';
import 'package:taxiappzpro/utils/dimensions.dart';

import '../bottom_sheets/logout_bs/logout_vm.dart';
import '../main.dart';
import '../ui/map/map_screen.dart';
import '../utils/app_constants.dart';

class AppDrawer extends StatelessWidget {
  final GlobalKey<ScaffoldState> scaffoldKey;

  AppDrawer({super.key, required this.scaffoldKey});

  final logoutVm = LogoutVm();

  @override
  Widget build(BuildContext context) {
    final isEnable = logoutVm.preference.getBool(PreferenceHelper.isEnableRefferal) ?? false;
    Widget singleMenuWidget(String icon, String menuName, Function() onTap,
        {bool isLast = false}) {
      return Padding(
        padding: isLast
            ? EdgeInsets.zero
            : const EdgeInsets.only(bottom: Dimensions.padding_20),
        child: InkWell(
          onTap: () {
            scaffoldKey.currentState?.closeDrawer();
            onTap();
          },
          child: Row(
            children: [
              SvgPicture.asset(icon),
              const SizedBox(width: Dimensions.padding_10),
              Text(
                menuName,
                style: Theme.of(context).textTheme.labelSmall,
              )
            ],
          ),
        ),
      );
    }

    return Drawer(
      width: MediaQuery.sizeOf(context).width * 0.75,
      child: LayoutBuilder(builder: (cContext, constraints) {
        return Padding(
          padding: const EdgeInsets.symmetric(
              horizontal: Dimensions.padding_20,
              vertical: Dimensions.padding_30),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(Dimensions.padding_5),
                    child: CachedNetworkImage(
                      imageUrl: AppConstants.driverProfilePicture,
                      placeholder: (context, url) => Container(
                        height: 60,
                        width: 60,
                        color: CustomColors.clr_E6ECFF,
                        child: const Center(
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: CustomColors.primaryColor,
                          ),
                        ),
                      ),
                      imageBuilder: (context, image) {
                        return Container(
                          height: 60,
                          width: 60,
                          decoration: BoxDecoration(
                            borderRadius:
                                BorderRadius.circular(Dimensions.padding_5),
                            image: DecorationImage(
                              image: image,
                              fit: BoxFit.cover,
                            ),
                          ),
                        );
                      },
                      errorWidget: (context, url, error) => ClipRRect(
                        borderRadius:
                            BorderRadius.circular(Dimensions.padding_5),
                        child: Container(
                          color: CustomColors.clr_E6ECFF,
                          height: 60,
                          width: 60,
                          padding: const EdgeInsets.all(Dimensions.padding_5),
                          child:
                              SvgPicture.asset(CustomImages.dummyProfileImage),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: Dimensions.padding_10),
                  Expanded(
                      child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(AppConstants.driverFirstName,
                          style: Theme.of(context).textTheme.titleSmall,
                          overflow: TextOverflow.ellipsis),
                      const SizedBox(height: Dimensions.padding_5),
                      Text(AppConstants.driverPhoneNumber,
                          style: Theme.of(context)
                              .textTheme
                              .labelSmall
                              ?.copyWith(fontSize: 12))
                    ],
                  ))
                ],
              ),
              const SizedBox(
                height: Dimensions.padding_25,
              ),
              Expanded(
                  child: SingleChildScrollView(
                child: Column(
                  children: [
                    singleMenuWidget(
                        CustomImages.home, logoutVm.translation.txtHome, () {
                      GoRouter.of(context).pushReplacementNamed(
                          CustomRouterConfig.mapScreen,
                          extra: GlobalKey());
                    }),
                    singleMenuWidget(CustomImages.myProfile,
                        logoutVm.translation.txtMyProfile, () {
                      GoRouter.of(context)
                          .pushNamed(CustomRouterConfig.profileScreen);
                    }),
                    singleMenuWidget(CustomImages.dashboard,
                        logoutVm.translation.txtDashboard, () {
                      GoRouter.of(context)
                          .pushNamed(CustomRouterConfig.dashBoardScreen);
                    }),
                    singleMenuWidget(
                        CustomImages.wallet, logoutVm.translation.txtWallet,
                        () {
                      GoRouter.of(context)
                          .pushNamed(CustomRouterConfig.walletScreen);
                    }),
                    singleMenuWidget(
                        CustomImages.myRides, logoutVm.translation.txtMyRides,
                        () {
                      GoRouter.of(context).pushNamed(
                        CustomRouterConfig.historyListScreen,
                      );
                    }),
                    /*singleMenuWidget(
                          CustomImages.managevehicle,
                          logoutVm.translation.txtManageRides,
                              () {
                            GoRouter.of(context)
                                .pushNamed(CustomRouterConfig.manageVehicle)
                                .then((result) {
                              if (result is Map && result["refresh"] == true) {
                                // 🔥 THIS WILL FINALLY RUN
                                MapScreen.of(context)?.vm.getRequestInProgress(context);
                              }
                            });
                          }
                      ),*/

                    Visibility(
                      visible: isEnable,
                      child: singleMenuWidget(
                        CustomImages.referral,
                        logoutVm.translation.txtReferral,
                        () {
                          GoRouter.of(context)
                              .pushNamed(CustomRouterConfig.referralScreen);
                        },
                      ),
                    ),
                    ...(logoutVm.preference
                                .getBool(PreferenceHelper.isCompanyDriver) ??
                            false
                        ? []
                        : [
                            singleMenuWidget(CustomImages.documents,
                                logoutVm.translation.txt_Documents, () {
                              GoRouter.of(context).pushNamed(
                                  CustomRouterConfig.documentsScreen);
                            })
                          ]),
                    singleMenuWidget(CustomImages.notification,
                        logoutVm.translation.txtNotification, () {
                      GoRouter.of(context)
                          .pushNamed(CustomRouterConfig.notificationScreen);
                    }),
                    singleMenuWidget(
                        CustomImages.support, logoutVm.translation.txtSupport,
                        () {
                      GoRouter.of(context)
                          .pushNamed(CustomRouterConfig.supportScreen);
                    }),
                    singleMenuWidget(
                        CustomImages.menuTicketDetails,
                        logoutVm.translation.txtTrackTickets,
                        () => logoutVm
                            .moveToNamed(CustomRouterConfig.trackTickets)),
                    singleMenuWidget(
                        CustomImages.language, logoutVm.translation.txtLanguage,
                        () {
                      GoRouter.of(context)
                          .pushNamed(CustomRouterConfig.languageScreen);
                    }),
                    singleMenuWidget(CustomImages.appStatus,
                        logoutVm.translation.txt_app_status, () {
                      GoRouter.of(context)
                          .pushNamed(CustomRouterConfig.appStatusScreen);
                    }),
                  ],
                ),
              )),
              singleMenuWidget(
                  CustomImages.logout, logoutVm.translation.txtLogout,
                  () async {
                final response = await showModalBottomSheet(
                    context: navigatorKey.currentState!.context,
                    backgroundColor: Colors.white,
                    isDismissible: true,
                    isScrollControlled: true,
                    enableDrag: false,
                    shape: const RoundedRectangleBorder(
                        borderRadius: BorderRadius.only(
                            topLeft: Radius.circular(20),
                            topRight: Radius.circular(20))),
                    builder: (_) {
                      return ConfirmationBs(
                        title: logoutVm.translation.txtLogout,
                        subTitle: logoutVm.translation.txtAreYouSureToLogout,
                        primaryBtnTitle: logoutVm.translation.txtLogout,
                        secondaryBtnTitle: logoutVm.translation.txt_cancel,
                      );
                    });
                if (response == true) {
                  logoutVm.logoutDriver();
                }
              }, isLast: true),
            ],
          ),
        );
      }),
    );
  }
}
