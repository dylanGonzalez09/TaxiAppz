import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';

import '../../components/header_view.dart';
import '../../components/submit_button.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../../utils/dimensions.dart';
import 'language_vm.dart';

class LanguageScreen extends StatefulWidget {
  const LanguageScreen({super.key});

  @override
  State<LanguageScreen> createState() => _LanguageScreenState();
}

class _LanguageScreenState extends State<LanguageScreen> {
  final vm = LanguageVm();
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
          padding: const EdgeInsets.symmetric(horizontal: Dimensions.padding_20),
          child: Column(
            children: [
              HeaderView(title: vm.translation.txt_Choose_Your_Language),
              const SizedBox(height: Dimensions.padding_10),
              Expanded(
                child: ListView.builder(
                    itemCount: vm.languages.length,
                    itemBuilder: (cContext,index) {
                      final language = vm.languages[index];
                      return
                        InkWell(
                          onTap: (){
                            for(var i in vm.languages){
                              i.isSelected = false;
                            }
                            setState(() {
                              language.isSelected = true;
                            });
                          },
                          child: Padding(
                            padding:  const EdgeInsets.only(left: Dimensions.padding_20
                                ,right: Dimensions.padding_20,top: Dimensions.padding_15,bottom: Dimensions.padding_15),
                            child: Column(
                              children: [
                                Row(
                                  children: [
                                    Text(language.name ??"",
                                        style: Theme
                                            .of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                          color: CustomColors.clr_000000,
                                          fontSize: 16,)),
                                    const Spacer(),
                                    language.isSelected?  SvgPicture.asset(CustomImages.languageSelected):const SizedBox()
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                    }),
              ),
              Padding(
                padding:  const EdgeInsets.symmetric(horizontal: Dimensions.padding_20),
                child: Obx(()=>SubmitButton(
                    buttonText: vm.translation.txt_Set_Language,
                    onclick:vm.proceed,isLoading: vm.isLoading.value
                )),
              ),
              const SizedBox(height: Dimensions.padding_20,)
            ],
          ),
        ),
      ),
    ) ;
  }
}
