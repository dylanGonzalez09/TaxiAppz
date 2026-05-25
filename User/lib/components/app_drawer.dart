import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:go_router/go_router.dart';
import 'package:user/ui/bottomsheets/logout_bs/logout_vm.dart';
import '../main.dart';
import '../utils/custom_router.dart';
import '../ui/about/aboutUs_screen.dart';
import '../ui/bottomsheets/confirmation_bs/confirmation_bs.dart';
import '../utils/app_constants.dart';
import '../utils/custom_colors.dart';
import '../utils/custom_images.dart';
import '../utils/dimensions.dart';
import '../utils/preference_helper.dart';

// class AppDrawer extends StatelessWidget {
//   final GlobalKey<ScaffoldState> scaffoldKey;
//
//   AppDrawer({super.key, required this.scaffoldKey});
//
//   final logoutVm = LogoutVm();
//
//   @override
//   Widget build(BuildContext context) {
//     Widget singleMenuWidget(
//       String icon,
//       String menuName,
//       Function() onTap, {
//       bool isLast = false,
//       isPng = false,
//     }) {
//       return Padding(
//         padding:
//             isLast
//                 ? EdgeInsets.zero
//                 : const EdgeInsets.symmetric(vertical: Dimensions.padding_13),
//         child: InkWell(
//           onTap: () {
//             scaffoldKey.currentState?.closeDrawer();
//             onTap();
//           },
//           child: Row(
//             children: [
//               isPng
//                   ? Image.asset(icon, color: CustomColors.primaryColor)
//                   : SvgPicture.asset(icon),
//               const SizedBox(width: Dimensions.padding_10),
//               Text(menuName, style: Theme.of(context).textTheme.labelSmall),
//             ],
//           ),
//         ),
//       );
//     }
//
//     return Drawer(
//       width: MediaQuery.sizeOf(context).width * 0.75,
//       child: Padding(
//         padding: const EdgeInsets.symmetric(
//           horizontal: Dimensions.padding_20,
//           vertical: Dimensions.padding_30,
//         ),
//         child: Column(
//           crossAxisAlignment: CrossAxisAlignment.start,
//           children: [
//             Row(
//               children: [
//                 ClipRRect(
//                   borderRadius: BorderRadius.circular(Dimensions.padding_5),
//                   child: CachedNetworkImage(
//                     imageUrl: AppConstants.userProfileImage,
//                     imageBuilder: (context, image) {
//                       return Container(
//                         height: 60,
//                         width: 60,
//                         decoration: BoxDecoration(
//                           border: Border.all(color: Colors.grey, width: 0.5),
//                           borderRadius: BorderRadius.circular(
//                             Dimensions.padding_5,
//                           ),
//                           image: DecorationImage(
//                             image: image,
//                             fit: BoxFit.cover,
//                           ),
//                         ),
//                       );
//                     },
//                     placeholder:
//                         (context, url) => Container(
//                           height: 60,
//                           width: 60,
//                           decoration: BoxDecoration(
//                             border: Border.all(color: Colors.grey, width: 0.5),
//                             borderRadius: BorderRadius.circular(
//                               Dimensions.padding_5,
//                             ),
//                             color: CustomColors.clr_E6ECFF,
//                           ),
//                           child: const Padding(
//                             padding: EdgeInsets.all(16),
//                             child: CircularProgressIndicator(
//                               color: CustomColors.primaryColor,
//                             ),
//                           ),
//                         ),
//                     errorWidget:
//                         (context, url, error) => ClipRRect(
//                           borderRadius: BorderRadius.circular(
//                             Dimensions.padding_5,
//                           ),
//                           child: Container(
//                             color: CustomColors.clr_E6ECFF,
//                             height: 60,
//                             width: 60,
//                             padding: const EdgeInsets.all(Dimensions.padding_5),
//                             child: SvgPicture.asset(CustomImages.dummyProfile),
//                           ),
//                         ),
//                   ),
//                 ),
//                 const SizedBox(width: Dimensions.padding_10),
//                 Expanded(
//                   child: Column(
//                     crossAxisAlignment: CrossAxisAlignment.start,
//                     children: [
//                       Text(
//                         AppConstants.userFirstName,
//                         style: Theme.of(context).textTheme.titleSmall,
//                         overflow: TextOverflow.ellipsis,
//                       ),
//                       const SizedBox(height: Dimensions.padding_5),
//                       InkWell(
//                         onTap: () {
//                           moveToNamed(CustomRouter.profileScreen);
//                         },
//                         child: Text(
//                           logoutVm.translation.txt_myProfile,
//                           style: Theme.of(
//                             context,
//                           ).textTheme.labelSmall?.copyWith(fontSize: 15),
//                         ),
//                       ),
//                     ],
//                   ),
//                 ),
//               ],
//             ),
//             const SizedBox(height: Dimensions.padding_15),
//             Expanded(
//               child: SingleChildScrollView(
//                 child: Column(
//                   children: [
//                     singleMenuWidget(
//                       CustomImages.menuHome,
//                       logoutVm.translation.txt_home,
//                       () {
//                         moveToNamed(CustomRouter.mapScreen);
//                       },
//                     ),
//                     singleMenuWidget(
//                       CustomImages.menuHistory,
//                       logoutVm.translation.txt_my_rides,
//                       () {
//                         moveToNamed(CustomRouter.historyListScreen);
//                       },
//                       isPng: true,
//                     ),
//                     singleMenuWidget(
//                       CustomImages.menuWallet,
//                       logoutVm.translation.txt_wallet,
//                       () {
//                         moveToNamed(CustomRouter.walletScreen);
//                       },
//                     ),
//                     singleMenuWidget(
//                       CustomImages.menuNotification,
//                       logoutVm.translation.txt_notification,
//                       () {
//                         moveToNamed(CustomRouter.notificationScreen);
//                       },
//                     ),
//                     singleMenuWidget(
//                       CustomImages.menuSupport,
//                       logoutVm.translation.txt_support,
//                       () {
//                         moveToNamed(CustomRouter.supportScreen);
//                       },
//                     ),
//                     singleMenuWidget(
//                       CustomImages.menuTicketDetails,
//                       logoutVm.translation.txtTrackTickets,
//                       () => logoutVm.moveToNamed(CustomRouter.trackTickets),
//                     ),
//                     singleMenuWidget(
//                       CustomImages.menuReferral,
//                       logoutVm.translation.txt_referral,
//                       () {
//                         moveToNamed(CustomRouter.referralScreen);
//                       },
//                     ),
//                     singleMenuWidget(
//                       CustomImages.language,
//                       logoutVm.translation.txt_language,
//                       () {
//                         GoRouter.of(
//                           context,
//                         ).pushNamed(CustomRouter.languageScreen);
//                       },
//                     ),
//                     singleMenuWidget(
//                       CustomImages.menuAboutUs,
//                       logoutVm.translation.txt_about_us,
//                       () {
//                         moveToNamed(CustomRouter.aboutUsScreen);
//                       },
//                     ),
//                   ],
//                 ),
//               ),
//             ),
//             // Logout at the bottom
//             singleMenuWidget(
//               CustomImages.menuLogout,
//               logoutVm.translation.txt_logout,
//               () async {
//                 final response = await showModalBottomSheet(
//                   context: navigatorKey.currentState!.context,
//                   backgroundColor: Colors.white,
//                   isDismissible: true,
//                   isScrollControlled: true,
//                   enableDrag: false,
//                   shape: const RoundedRectangleBorder(
//                     borderRadius: BorderRadius.only(
//                       topLeft: Radius.circular(20),
//                       topRight: Radius.circular(20),
//                     ),
//                   ),
//                   builder: (_) {
//                     return ConfirmationBs(
//                       title: logoutVm.translation.txt_logout,
//                       subTitle: logoutVm.translation.txt_are_you_sure_to_logout,
//                       primaryBtnTitle: logoutVm.translation.txt_logout,
//                       secondaryBtnTitle: logoutVm.translation.txt_cancel,
//                     );
//                   },
//                 );
//                 if (response == true) {
//                   logoutVmlogoutUser();
//                 }
//               },
//               isLast: true,
//             ),
//           ],
//         ),
//       ),
//     );
//   }
//
//   void moveToNamed(String name, {dynamic args}) {
//     if (navigatorKey.currentState != null) {
//       GoRouter.of(
//         navigatorKey.currentState!.context,
//       ).pushNamed(name, extra: args);
//     }
//   }
// }

class AppDrawer extends StatelessWidget {
  final GlobalKey<ScaffoldState> scaffoldKey;

  AppDrawer({super.key, required this.scaffoldKey});

  final logoutVm = LogoutVm();

  @override
  Widget build(BuildContext context) {
    final isEnable =
        logoutVm.preference.getBool(PreferenceHelper.isEnableRefferal) ?? false;
    print('esggrer$isEnable');
    Widget singleMenuWidget(
      String icon,
      String menuName,
      Function() onTap, {
      bool isLast = false,
      isPng = false,
    }) {
      return Padding(
        padding: isLast
            ? EdgeInsets.zero
            : const EdgeInsets.symmetric(vertical: Dimensions.padding_13),
        child: InkWell(
          onTap: () {
            scaffoldKey.currentState?.closeDrawer();
            onTap();
          },
          child: Row(
            children: [
              isPng
                  ? Image.asset(icon, color: CustomColors.primaryColor)
                  : SvgPicture.asset(icon),
              const SizedBox(width: Dimensions.padding_10),
              Text(menuName, style: Theme.of(context).textTheme.labelSmall),
            ],
          ),
        ),
      );
    }

    return Drawer(
      width: MediaQuery.sizeOf(context).width * 0.75,
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: Dimensions.padding_20,
          vertical: Dimensions.padding_30,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(Dimensions.padding_5),
                  child: CachedNetworkImage(
                    imageUrl: AppConstants.userProfileImage,
                    imageBuilder: (context, image) {
                      return Container(
                        height: 60,
                        width: 60,
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey, width: 0.5),
                          borderRadius: BorderRadius.circular(
                            Dimensions.padding_5,
                          ),
                          image: DecorationImage(
                            image: image,
                            fit: BoxFit.cover,
                          ),
                        ),
                      );
                    },
                    placeholder: (context, url) => Container(
                      height: 60,
                      width: 60,
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey, width: 0.5),
                        borderRadius: BorderRadius.circular(
                          Dimensions.padding_5,
                        ),
                        color: CustomColors.clr_E6ECFF,
                      ),
                      child: const Padding(
                        padding: EdgeInsets.all(16),
                        child: CircularProgressIndicator(
                          color: CustomColors.primaryColor,
                        ),
                      ),
                    ),
                    errorWidget: (context, url, error) => ClipRRect(
                      borderRadius: BorderRadius.circular(
                        Dimensions.padding_5,
                      ),
                      child: Container(
                        color: CustomColors.clr_E6ECFF,
                        height: 60,
                        width: 60,
                        padding: const EdgeInsets.all(Dimensions.padding_5),
                        child: SvgPicture.asset(CustomImages.dummyProfile),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: Dimensions.padding_10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        AppConstants.userFirstName,
                        style: Theme.of(context).textTheme.titleSmall,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: Dimensions.padding_5),
                      InkWell(
                        onTap: () {
                          moveToNamed(CustomRouter.profileScreen);
                        },
                        child: Text(
                          logoutVm.translation.txt_myProfile,
                          style: Theme.of(
                            context,
                          ).textTheme.labelSmall?.copyWith(fontSize: 15),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: Dimensions.padding_15),
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    singleMenuWidget(
                      CustomImages.menuHome,
                      logoutVm.translation.txt_home,
                      () {
                        moveToNamed(CustomRouter.mapScreen);
                      },
                    ),
                    singleMenuWidget(
                      CustomImages.menuHistory,
                      logoutVm.translation.txt_my_rides,
                      () {
                        moveToNamed(CustomRouter.historyListScreen);
                      },
                      isPng: true,
                    ),
                    singleMenuWidget(
                      CustomImages.menuWallet,
                      logoutVm.translation.txt_wallet,
                      () {
                        moveToNamed(CustomRouter.walletScreen);
                      },
                    ),
                    singleMenuWidget(
                      CustomImages.menuNotification,
                      logoutVm.translation.txt_notification,
                      () {
                        moveToNamed(CustomRouter.notificationScreen);
                      },
                    ),
                    singleMenuWidget(
                      CustomImages.menuSupport,
                      logoutVm.translation.txt_support,
                      () {
                        moveToNamed(CustomRouter.supportScreen);
                      },
                    ),
                    singleMenuWidget(
                      CustomImages.menuTicketDetails,
                      logoutVm.translation.txtTrackTickets,
                      () => logoutVm.moveToNamed(CustomRouter.trackTickets),
                    ),
                    Visibility(
                      visible: isEnable,
                      child: singleMenuWidget(
                        CustomImages.menuReferral,
                        logoutVm.translation.txt_referral,
                        () {
                          moveToNamed(CustomRouter.referralScreen);
                        },
                      ),
                    ),
                    singleMenuWidget(
                      CustomImages.language,
                      logoutVm.translation.txt_language,
                      () {
                        GoRouter.of(
                          context,
                        ).pushNamed(CustomRouter.languageScreen);
                      },
                    ),
                    singleMenuWidget(
                      CustomImages.menuAboutUs,
                      logoutVm.translation.txt_about_us,
                      () {
                        moveToNamed(CustomRouter.aboutUsScreen);
                      },
                    ),
                    singleMenuWidget(
                      CustomImages.language,
                      logoutVm.translation.txt_language,
                          () {
                        GoRouter.of(
                          context,
                        ).pushNamed(CustomRouter.invoiceScreen);
                      },
                    ),
                  ],
                ),
              ),
            ),
            // Logout at the bottom
            singleMenuWidget(
              CustomImages.menuLogout,
              logoutVm.translation.txt_logout,
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
                      topRight: Radius.circular(20),
                    ),
                  ),
                  builder: (_) {
                    return ConfirmationBs(
                      title: logoutVm.translation.txt_logout,
                      subTitle: logoutVm.translation.txt_are_you_sure_to_logout,
                      primaryBtnTitle: logoutVm.translation.txt_logout,
                      secondaryBtnTitle: logoutVm.translation.txt_cancel,
                    );
                  },
                );
                if (response == true) {
                  logoutVm.logoutUser();
                }
              },
              isLast: true,
            ),
          ],
        ),
      ),
    );
  }

  void moveToNamed(String name, {dynamic args}) {
    if (navigatorKey.currentState != null) {
      GoRouter.of(
        navigatorKey.currentState!.context,
      ).pushNamed(name, extra: args);
    }
  }
}
