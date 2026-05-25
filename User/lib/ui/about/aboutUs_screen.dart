import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../components/normal_custom_bar.dart';
import '../../utils/app_constants.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../../utils/theme_data.dart';
import 'aboutUs_vm.dart';

class AboutUsScreen extends StatefulWidget {
  const AboutUsScreen({super.key});

  @override
  State<AboutUsScreen> createState() => _AboutUsScreenState();
}

final vm = AboutUsVm();

class _AboutUsScreenState extends State<AboutUsScreen> {
  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        body: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          NormalCustomBar(
            title: vm.translation.txt_about_us,
          ),
          const SizedBox(
            height: 20,
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "${vm.translation.txtAppVersion} v${vm.packageInfo.version}",
                  style: themeData.textTheme.bodySmall?.copyWith(
                    color: CustomColors.clr_000000,
                    fontSize: 15,
                  ),
                ),
                const SizedBox(
                  height: 34,
                ),
                Row(
                  children: [
                    SvgPicture.asset(
                      CustomImages.sosCar,
                      colorFilter: const ColorFilter.mode(
                          CustomColors.primaryColor, BlendMode.srcIn),
                    ),
                    const SizedBox(
                      width: 12,
                    ),
                    InkWell(
                      onTap: () {
                        vm.openPlayStore();
                      },
                      child: Text(
                        vm.translation.txtRateTheApp,
                        style: themeData.textTheme.bodySmall?.copyWith(
                          color: CustomColors.clr_000000,
                          fontSize: 15,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(
                  height: 26,
                ),
                Row(
                  children: [
                    SvgPicture.asset(
                      CustomImages.sosCar,
                      colorFilter: const ColorFilter.mode(
                          CustomColors.primaryColor, BlendMode.srcIn),
                    ),
                    const SizedBox(
                      width: 12,
                    ),
                    Text(
                      vm.translation.txtFacebook,
                      style: themeData.textTheme.bodySmall?.copyWith(
                        color: CustomColors.clr_000000,
                        fontSize: 15,
                      ),
                    ),
                  ],
                ),
                const SizedBox(
                  height: 26,
                ),
                Row(
                  children: [
                    SvgPicture.asset(
                      CustomImages.sosCar,
                      colorFilter: const ColorFilter.mode(
                          CustomColors.primaryColor, BlendMode.srcIn),
                    ),
                    const SizedBox(
                      width: 12,
                    ),
                    Text(
                      vm.translation.txt_legal,
                      style: themeData.textTheme.bodySmall?.copyWith(
                        color: CustomColors.clr_000000,
                        fontSize: 15,
                      ),
                    ),
                  ],
                ),
                const SizedBox(
                  height: 33,
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 15,
                    vertical: 15,
                  ),
                  decoration: const BoxDecoration(
                    borderRadius: BorderRadius.all(Radius.circular(10)),
                    color: CustomColors.selectedColor,
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              vm.translation.txt_join_driver,
                              style: themeData.textTheme.bodyLarge?.copyWith(
                                color: CustomColors.clr_000000,
                                fontSize: 18,
                              ),
                            ),
                            const SizedBox(
                              height: 8,
                            ),
                            Text(
                              vm.translation.txt_dwn_application,
                              style: themeData.textTheme.bodySmall?.copyWith(
                                color: CustomColors.clr_000000,
                                fontSize: 15,
                              ),
                              maxLines: 2,
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          InkWell(
                            onTap: () {
                              Navigator.of(context).pop();
                            },
                            child: Padding(
                              padding: const EdgeInsets.only(left: 15),
                              child: Container(
                                padding: const EdgeInsets.only(
                                    left: 15, right: 15, top: 10, bottom: 10),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(20),
                                  color: CustomColors.primaryColor,
                                ),
                                child: Text(
                                  vm.translation.txt_download,
                                  style: const TextStyle(
                                    fontSize: 15,
                                    color: Colors.white,
                                    fontFamily: AppConstants.latoFont,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                )
              ],
            ),
          ),
        ]),
      ),
    );
  }
}
