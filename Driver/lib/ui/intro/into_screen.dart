import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:provider/provider.dart';
import 'package:taxiappzpro/components/submit_button.dart';
import 'package:taxiappzpro/ui/intro/intro_vm.dart';
import 'package:taxiappzpro/utils/app_constants.dart';
import 'package:taxiappzpro/utils/custom_images.dart';
import 'package:taxiappzpro/utils/custom_router_config.dart';
import '../../components/page_slider.dart';
import '../../utils/preference_helper.dart';

class IntroScreen extends StatefulWidget {
  const IntroScreen({super.key});

  @override
  State<IntroScreen> createState() => _IntroScreenState();
}

class _IntroScreenState extends State<IntroScreen> {
  final vm = IntroVm();

  @override
  void initState() {
    vm.setContent();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
        child: Scaffold(
          body: ChangeNotifierProvider<IntroVm>(
            create: (context) => vm,
            child: Consumer<IntroVm>(
              builder: (context, vm, child) {
                return Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        Visibility(
                          visible: !vm.isLastPage.value,
                          child: Align(
                            alignment: Alignment.topRight,
                            child: InkWell(
                              onTap: () {
                                vm.preference.setString(
                                    PreferenceHelper.introContent, "");
                                vm.popAndMove(CustomRouterConfig.loginScreen);
                              },
                              child: Text(
                                vm.translation.txt_Skip,
                                style: Theme.of(context)
                                    .textTheme
                                    .titleMedium
                                    ?.copyWith(fontSize: 16),
                              ),
                            ),
                          ),
                        ),

                        Expanded(
                          flex: 1,
                          child: vm.introContent.isNotEmpty
                              ? PageView.builder(
                            itemCount: vm.introContent.length,
                            onPageChanged: (index) {
                              vm.checkForLastPage(index);
                              vm.selectedIndex.value = index;
                            },
                            itemBuilder: (context, index) {
                              final item = vm.introContent[index];
                              return Column(
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: [
                                  SizedBox(
                                    height: MediaQuery.sizeOf(context)
                                        .height *
                                        0.45,
                                    width: double.infinity,
                                    child: CachedNetworkImage(
                                      imageUrl:
                                      "${AppConstants.imageBaseUrl}${item.image ?? ""}",
                                      placeholder: (_, data) {
                                        return SvgPicture.asset(
                                          CustomImages.dummyImage,
                                          fit: BoxFit.cover,
                                        );
                                      },
                                      errorWidget: (_, data, error) {
                                        return SvgPicture.asset(
                                          CustomImages.dummyImage,
                                          fit: BoxFit.cover,
                                        );
                                      },
                                      fit: BoxFit.fitWidth,
                                      width: double.infinity,
                                    ),
                                  ),

                                  Padding(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 20),
                                    child: Text(
                                      item.tittle ?? "",
                                      style: Theme.of(context)
                                          .textTheme
                                          .titleLarge
                                          ?.copyWith(
                                          color: Colors.black),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  const SizedBox(height: 10),

                                  // ── Description ────────────
                                  Padding(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 20),
                                    child: Text(
                                      item.description ?? "",
                                      textAlign: TextAlign.center,
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodySmall,
                                      maxLines: 7,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  const SizedBox(height: 40),
                                ],
                              );
                            },
                          )
                              : const SizedBox(),
                        ),

                        PageSlider(
                          currentPage: vm.selectedIndex.value,
                          length: vm.introContent.length,
                        ),
                        const SizedBox(height: 20),

                        Visibility(
                          visible: vm.isLastPage.value,
                          child: SubmitButton(
                              buttonText: vm.translation.Txt_Continue,
                              onclick: () {
                                vm.preference.setString(
                                    PreferenceHelper.introContent, "");
                                vm.popAndMove(CustomRouterConfig.loginScreen);
                              }),
                        ),
                        Visibility(
                          visible: !vm.isLastPage.value,
                          child: const SizedBox(height: 49),
                        ),
                      ],
                    ));
              },
            ),
          ),
        ));
  }
}