import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:taxiappzpro/components/header_view.dart';
import 'package:taxiappzpro/components/submit_button.dart';
import 'package:taxiappzpro/di/di_config.dart';
import 'package:taxiappzpro/ui/language/language_vm.dart';
import 'package:taxiappzpro/utils/custom_images.dart';

import '../../utils/dimensions.dart';

class LanguageScreen extends StatefulWidget {
  const LanguageScreen({super.key});

  @override
  State<LanguageScreen> createState() => _LanguageScreenState();
}

class _LanguageScreenState extends State<LanguageScreen> {
  final vm = getIt<LanguageVm>();

  @override
  void initState() {
    vm.setLanguages();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        body: Padding(
          padding:
              const EdgeInsets.symmetric(horizontal: Dimensions.padding_20),
          child: Column(
            children: [
              HeaderView(
                title: "Choose your language",
                showBackButton: vm.showBackButton,
              ),
              const SizedBox(height: Dimensions.padding_10),
              Expanded(
                child: ListView.builder(
                    itemCount: vm.languages.length,
                    itemBuilder: (cContext, index) {
                      final language = vm.languages[index];
                      return InkWell(
                        onTap: () {
                          for (var i in vm.languages) {
                            i.isSelected = false;
                          }
                          setState(() {
                            language.isSelected = true;
                          });
                        },
                        child: Padding(
                          padding: const EdgeInsets.only(
                              left: Dimensions.padding_20,
                              right: Dimensions.padding_20,
                              top: Dimensions.padding_15,
                              bottom: Dimensions.padding_15),
                          child: Column(
                            children: [
                              Row(
                                children: [
                                  Text(language.name ?? "",
                                      style: Theme.of(context)
                                          .textTheme
                                          .labelSmall),
                                  const Spacer(),
                                  language.isSelected
                                      ? SvgPicture.asset(
                                          CustomImages.languageSelected)
                                      : const SizedBox()
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    }),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(
                    horizontal: Dimensions.padding_40),
                child: Obx(() => SubmitButton(
                    buttonText: "Set Language",
                    //vm.translation.txt_Set_Language,
                    onclick: vm.proceed,
                    isLoading: vm.isLoading.value)),
              ),
              const SizedBox(
                height: Dimensions.padding_20,
              )
            ],
          ),
        ),
      ),
    );
  }
}
