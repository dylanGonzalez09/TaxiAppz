import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:provider/provider.dart';
import '../../components/page_slider.dart';
import '../../components/submit_button.dart';
import '../../utils/app_constants.dart';
import '../../utils/custom_images.dart';
import '../../utils/custom_router.dart';
import '../../utils/preference_helper.dart';
import 'intro_vm.dart';

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
                            vm.popAndMove(CustomRouter.loginScreen);
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
                            children: [
                              Expanded(
                                child: CachedNetworkImage(
                                  imageUrl:
                                  "${AppConstants.imageBaseUrl}${item.image ?? ""}",
                                  placeholder: (_, __) =>
                                      SvgPicture.asset(
                                        CustomImages.dummyImage,
                                        fit: BoxFit.cover,
                                      ),
                                  errorWidget: (_, __, ___) =>
                                      SvgPicture.asset(
                                        CustomImages.dummyImage,
                                        fit: BoxFit.cover,
                                      ),
                                  fit: BoxFit.fitWidth,
                                  width: double.infinity,
                                ),
                              ),

                              const SizedBox(height: 24),
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 20),
                                child: Text(
                                  item.tittle ?? "",
                                  style: Theme.of(context)
                                      .textTheme
                                      .titleLarge
                                      ?.copyWith(color: Colors.black),
                                  textAlign: TextAlign.center,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),

                              const SizedBox(height: 10),
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
                          vm.popAndMove(CustomRouter.loginScreen);
                        },
                      ),
                    ),
                    Visibility(
                      visible: !vm.isLastPage.value,
                      child: const SizedBox(height: 49),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}