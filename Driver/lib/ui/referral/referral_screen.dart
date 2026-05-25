import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:taxiappzpro/ui/referral/referral_vm.dart';
import '../../components/drawer_scaffold.dart';
import '../../components/header_view.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../../utils/dimensions.dart';

class ReferralScreen extends StatefulWidget {
  const ReferralScreen({super.key});

  @override
  State<ReferralScreen> createState() => _ReferralScreenState();
}

class _ReferralScreenState extends State<ReferralScreen> {
  late ReferralVm vm;
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    vm = ReferralVm();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      vm.getReferralCodeDetails();
    });
  }

  void _shareReferralCode(BuildContext context) async {
    FocusScope.of(context).unfocus();
    final box = context.findRenderObject() as RenderBox?;
    final referralCode = vm.referralDetail?.referralCode ?? "Unknown";
    try {
      final referralMessage =
          "Hey! Use my referral code $referralCode to join the app and enjoy rewards!";
      await Share.share(
        referralMessage,
        subject: "Join with my referral code!",
        sharePositionOrigin: box!.localToGlobal(Offset.zero) & box.size,
      );
    } catch (e) {
      debugPrint("$e");
    }
  }

  void showCustomSnackBar(BuildContext context, String message) {
    final overlay = Overlay.of(context);
    final overlayEntry = OverlayEntry(
      builder: (context) => Positioned(
        top: MediaQuery.of(context).size.height * 0.8,
        left: 55,
        right: 55,
        child: Material(
          color: Colors.transparent,
          child: Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.grey,
                borderRadius: BorderRadius.circular(50),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.check_circle_outline, color: Colors.white),
                  SizedBox(width: 20),
                  Expanded(
                    child: Text(
                      "Copied to clipboard",
                      style: TextStyle(color: Colors.white, fontSize: 18),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
    overlay.insert(overlayEntry);
    Future.delayed(const Duration(seconds: 2), () {
      overlayEntry.remove();
    });
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<ReferralVm>(
        create: (context) => vm,
        child: Consumer<ReferralVm>(
          builder: (_, vm, child) {
            return SafeArea(
              child: DrawerScaffold(
                body: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        child: HeaderView(
                          title: vm.translation.txtReferralCode,
                        ),
                      ),
                      const SizedBox(height: Dimensions.padding_15),
                      Text(
                        vm.translation.txtInviteFriends,
                        style: Theme.of(context).textTheme.labelLarge,
                      ),
                      const SizedBox(height: Dimensions.padding_10),
                      Text(
                        "${vm.translation.txtInviteFriendsAndFamiliesToEarn} ${vm.referralDetail?.currencySymbol ?? ""} ${vm.referralDetail?.referByUserAmount ?? ""}",
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                            color: CustomColors.clr_303030, fontSize: 14),
                      ),
                      const SizedBox(height: Dimensions.padding_20),
                      Text(
                        "${vm.translation.txtTotalReferralAmount} : ${vm.referralDetail?.currencySymbol ?? ""} ${vm.referralDetail?.referralAmount ?? ""}",
                        style: Theme.of(context).textTheme.titleSmall,
                      ),
                      const SizedBox(height: Dimensions.padding_10),
                      GestureDetector(
                        onTap: () {
                          if (vm.isClaimAmount) {
                            vm.isLoading.value = true;
                            setState(() {});
                            vm.claimReferral();
                          }
                        },
                        child: Container(
                          width: MediaQuery.sizeOf(context).width * 0.38,
                          alignment: Alignment.center,
                          padding: const EdgeInsets.symmetric(
                            vertical: Dimensions.padding_6,
                          ),
                          decoration: BoxDecoration(
                            color: !vm.isClaimAmount
                                ? CustomColors.clr_D9D9D9
                                : CustomColors.svgImageColorDarkBlue,
                            borderRadius: BorderRadius.circular(5),
                          ),
                          child: vm.isLoading.value
                              ? const CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: CustomColors.buttonTxtColor,
                                )
                              : Text(
                                  vm.translation.txtClaim,
                                  style: Theme.of(context)
                                      .textTheme
                                      .titleMedium
                                      ?.copyWith(
                                        color: !vm.isClaimAmount
                                            ? Colors.black
                                            : Colors.white,
                                      ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                        ),
                      ),
                      const SizedBox(height: Dimensions.padding_30),
                      SvgPicture.asset(CustomImages.referralImage),
                      const SizedBox(height: Dimensions.padding_15),
                      Text(
                        vm.translation.txtYourReferralCode,
                        style: Theme.of(context)
                            .textTheme
                            .labelMedium
                            ?.copyWith(fontSize: 18),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 75.0),
                        child: Container(
                          margin:
                              const EdgeInsets.only(top: Dimensions.padding_15),
                          padding: const EdgeInsets.symmetric(
                              horizontal: Dimensions.padding_20),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                                width: 1, color: CustomColors.primaryColor),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                vm.referralDetail?.referralCode ?? "...",
                                style: Theme.of(context).textTheme.titleLarge,
                              ),
                              IconButton(
                                icon: const Icon(Icons.copy),
                                color: CustomColors.clr_000000,
                                onPressed: () {
                                  final referralCode =
                                      vm.referralDetail?.referralCode ?? '';
                                  Clipboard.setData(
                                    ClipboardData(text: referralCode),
                                  );
                                  showCustomSnackBar(context, referralCode);
                                },
                              ),
                            ],
                          ),
                        ),
                      ),
                      // const Spacer(),
                     const SizedBox(height: Dimensions.padding_20),
                      GestureDetector(
                        onTap: () {
                          _shareReferralCode(context);
                        },
                        child: Container(
                          width: MediaQuery.sizeOf(context).width * 0.75,
                          alignment: Alignment.center,
                          padding: const EdgeInsets.symmetric(
                              vertical: Dimensions.padding_12,
                              horizontal: Dimensions.padding_5),
                          decoration: BoxDecoration(
                            color: CustomColors.primaryColor,
                            borderRadius: BorderRadius.circular(26),
                          ),
                          child: Text(
                            vm.translation.txtShare,
                            style: Theme.of(context)
                                .textTheme
                                .titleLarge
                                ?.copyWith(color: Colors.white),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ),
                     // const SizedBox(height: Dimensions.padding_20),
                    ],
                  ),
                ),
                scaffoldKey: scaffoldKey,
              ),
            );
          },
        ));
  }
}
