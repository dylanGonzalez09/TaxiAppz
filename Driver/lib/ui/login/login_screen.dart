import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:provider/provider.dart';
import 'package:taxiappzpro/components/contrycode_textfield.dart';
import 'package:taxiappzpro/components/custom_text_field.dart';
import 'package:taxiappzpro/components/proceed_button.dart';
import 'package:taxiappzpro/network/response_models/country_model.dart';
import 'package:taxiappzpro/utils/custom_colors.dart';
import 'package:taxiappzpro/utils/custom_router_config.dart';
import 'package:taxiappzpro/utils/dimensions.dart';
import 'package:taxiappzpro/utils/theme_data.dart';
import 'package:taxiappzpro/utils/utils.dart';

import '../../components/common_text_field.dart';
import '../../di/di_config.dart';
import '../../utils/app_constants.dart';
import '../../utils/custom_images.dart';
import 'login_vm.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({
    super.key,
  });

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final vm = getIt<LoginVm>();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      vm.notification();
    });
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
        child: Scaffold(
          body: ChangeNotifierProvider<LoginVm>(
            create: (context) => vm,
            child: Consumer<LoginVm>(builder: (key, vm, child) {
              return Padding(
                  padding: const EdgeInsets.all(20),
                  child: SingleChildScrollView(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: const EdgeInsets.only(top: 60),
                            child:
                            Center(child:
                            SvgPicture.asset(CustomImages.logoLoginOtpSvg,height: 80,width: 120,)),
                          ),
                          const SizedBox(
                            height: 60,
                          ),
                          SizedBox(
                            width: MediaQuery.of(context).size.width * 0.7,
                            child: Text(
                              vm.translation.txt_Enter_your_phone_desc,
                              style:
                              Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Colors.black,
                                fontSize: 16,
                              ),
                              maxLines: 2,
                            ),
                          ),
                          const SizedBox(
                            height: 16,
                          ),
                          Row(
                            children: [
                              CountryCodeTextField(
                                controller: vm.countryCodeController,
                                hint: vm.translation.txt_Code,
                                onTap: () async {
                                  final data = await vm.moveAndWait(CustomRouterConfig.countryList);
                                  if (data is CountryModel) {
                                    setState(() {
                                      vm.country = data;
                                      vm.phoneNumberController.clear();
                                    });
                                    vm.countryCodeController.text = data.dialCode ?? "";
                                  }
                                },
                              ),
                              const SizedBox(
                                width: 15,
                              ),
                              Expanded(
                                child: CommonTextField(
                                  onChanged: vm.onTextChanged,
                                  showHint: false,
                                  autoFocus: true,
                                  maxCount: vm.getPhoneMaxLength(vm.country?.dialCode),
                                  controller: vm.phoneNumberController,
                                  hint: vm.translation.txt_Phone_Number,
                                  keyboardType: TextInputType.phone,
                                  inputFormatters: [
                                    FilteringTextInputFormatter.digitsOnly
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(
                            height: 10,
                          ),
                          vm.errorTxt.isNotEmpty
                              ? Text(vm.errorTxt,
                              style: themeData.textTheme.bodySmall?.copyWith(
                                  fontSize: 14,
                                  color: CustomColors.clr_FF0000,
                                  fontWeight: FontWeight.w600))
                              : const SizedBox(),
                          vm.errorTxt.isNotEmpty
                              ? const SizedBox(
                            height: 28,
                          )
                              : const SizedBox(
                            height: 44,
                          ),
                          Center(
                              child: Obx(() => ProceedButton(
                                btnTxt: Utils.isDemoKey
                                    ? vm.translation.txtNext
                                    : vm.translation.txt_Get_OTP,
                                onPressed: vm.onProceed,
                                maxCount:
                                vm.getPhoneMaxLength(vm.country?.dialCode),
                                isLoading: vm.isLoading.value,
                                isAvailable: vm.isAvailable,
                              ))),
                          const SizedBox(
                            height: 25,
                          ),
                          Center(
                              child: Text(
                                  "${vm.translation.txt_By_signing_up}, "
                                      "${vm.translation.txt_agree_to_our}",
                                  style: themeData.textTheme.bodySmall?.copyWith(
                                      fontSize: 12,
                                      color: CustomColors.clr_AAAAAA))),
                          InkWell(
                            onTap: () {
                              vm.moveToNamed(CustomRouterConfig.webView,
                                  args: vm.termsAndCondition);
                            },
                            child: Padding(
                              padding:
                              const EdgeInsets.only(top: Dimensions.padding_5),
                              child: Center(
                                  child: Text(vm.translation.txt_Terms_of_Service,
                                      style: themeData.textTheme.bodySmall
                                          ?.copyWith(
                                          fontSize: 12,
                                          color: CustomColors.titleColor,
                                          fontWeight: FontWeight.w600))),
                            ),
                          ),
                        ]),
                  ));
            }),
          ),
        ));
  }
}
