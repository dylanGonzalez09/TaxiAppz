import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get_state_manager/src/rx_flutter/rx_obx_widget.dart';
import 'package:provider/provider.dart';

import '../../components/common_text_field.dart';
import '../../components/country_code.dart';
import '../../components/proceed_button.dart';
import '../../network/response_models/country_model.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../../utils/custom_router.dart';
import '../../utils/dimensions.dart';
import '../../utils/theme_data.dart';
import '../../utils/utils.dart';
import 'login_vm.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({
    super.key,
  });

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final vm = LoginVm();

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
                        child: Center(
                            child: SvgPicture.asset(
                          CustomImages.logo,
                          width: 60,
                          height: 60,
                        )),
                      ),
                      const SizedBox(
                        height: 60,
                      ),
                      SizedBox(
                        width: MediaQuery.of(context).size.width * 0.8,
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
                              final data = await vm
                                  .moveAndWait(CustomRouter.countryList);
                              if (data is CountryModel) {
                                setState(() {
                                  vm.country = data;
                                  vm.phoneNumberController.clear();
                                });
                                vm.countryCodeController.text =
                                    data.dialCode ?? "";
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
                                  fontSize: 12,
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
                                btnTxt: Utils.isDemoFlow
                                    ? vm.translation.txtNext
                                    : vm.translation.txt_get_otp,
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
                          vm.moveToNamed(CustomRouter.webView,
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
