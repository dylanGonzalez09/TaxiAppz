import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:go_router/go_router.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';
import '../../../utils/custom_router.dart';
import '../../../utils/dimensions.dart';
import '../../../utils/preference_helper.dart';
import '../../login/login_vm.dart';

class TermsAndPrivacyBs extends StatefulWidget {
  final LoginVm vm;

  const TermsAndPrivacyBs({super.key, required this.vm});

  @override
  _TermsAndPrivacyBs createState() => _TermsAndPrivacyBs();
}

class _TermsAndPrivacyBs extends State<TermsAndPrivacyBs> {
  final int maxStars = 5;
  int selectedRating = 0;
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

  final Color activeColor = CustomColors.primaryColor;
  final Color defaultColor = CustomColors.clr_E2E2E2;

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(Dimensions.padding_20),
        decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.horizontal(
                left: Radius.circular(Dimensions.padding_20),
                right: Radius.circular(Dimensions.padding_20))),
        child: Stack(
          children: [
            Positioned(
                right: 0,
                child: InkWell(
                    onTap: () {
                      Navigator.pop(context);
                    },
                    child: SizedBox(
                        child: InkWell(
                            onTap: () {
                              GoRouter.of(context).pop();
                            },
                            child: const Icon(Icons.close_rounded))))),
            Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                Center(
                    child: SvgPicture.asset(
                  CustomImages.termsAndPrivacy,
                )),
                Padding(
                  padding: const EdgeInsets.only(
                      left: Dimensions.padding_40,
                      right: Dimensions.padding_40,
                      top: Dimensions.padding_20,
                      bottom: Dimensions.padding_10),
                  child: Center(
                    child: Text(
                      widget.vm.translation.txt_agree_to_terms_conditions,
                      style: Theme.of(context).textTheme.bodyMedium,
                      maxLines: 2,
                    ),
                  ),
                ),
                Text.rich(
                  TextSpan(
                    style: Theme.of(context)
                        .textTheme
                        .bodyMedium
                        ?.copyWith(color: CustomColors.clr_3F3F3F),
                    children: [
                      TextSpan(
                          text: "${widget.vm.translation.txt_Read_the} ",
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(fontSize: 16)),
                      TextSpan(
                          text:
                              "${widget.vm.translation.txt_Terms_of_Service} ",
                          style: Theme.of(context).textTheme.bodyMedium,
                          recognizer: TapGestureRecognizer()
                            ..onTap = () async {
                              widget.vm.moveToNamed(CustomRouter.webView,
                                  args: widget.vm.termsAndCondition);
                            }),
                      TextSpan(
                          text: "${widget.vm.translation.txt_and} ",
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(fontSize: 16)),
                      TextSpan(
                          text: widget.vm.translation.txt_Privacy_policy,
                          style: Theme.of(context).textTheme.bodyMedium,
                          recognizer: TapGestureRecognizer()
                            ..onTap = () async {
                              widget.vm.moveToNamed(CustomRouter.webView,
                                  args: widget.vm.privacyPolicy);
                            }),
                    ],
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 2, // Center aligns the text
                ),
                InkWell(
                  onTap: () {
                    GoRouter.of(context).pop();
                    widget.vm.preference.setBool(
                        PreferenceHelper.isPrivacyPolicyAcceptedBool, true);
                    widget.vm.onProceed();
                  },
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(
                        vertical: Dimensions.padding_10),
                    decoration: BoxDecoration(
                      borderRadius:
                          BorderRadius.circular(Dimensions.padding_25),
                      color: CustomColors.primaryColor,
                    ),
                    margin: const EdgeInsets.only(
                        left: Dimensions.padding_40,
                        right: Dimensions.padding_40,
                        top: Dimensions.padding_20),
                    child: Center(
                        child: Text(
                      widget.vm.translation.txt_I_agree,
                      style: const TextStyle(color: Colors.white),
                    )),
                  ),
                )
              ],
            )
          ],
        ));
  }
}
