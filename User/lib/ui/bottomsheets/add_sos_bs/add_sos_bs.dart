import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../components/common_text_field.dart';
import '../../../components/country_code.dart';
import '../../../network/response_models/country_model.dart';
import '../../../utils/app_constants.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/custom_router.dart';
import '../../login/login_vm.dart';
import '../../splash/splash_vm.dart';
import 'add_sos_vm.dart';

class AddSosBs extends StatefulWidget {
  const AddSosBs({super.key});

  @override
  _AddSosBsState createState() => _AddSosBsState();
}

class _AddSosBsState extends State<AddSosBs> {
  final vm = AddSosVm();

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final themeData = Theme.of(context);
    return PopScope(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Center(
                child: Text(
                  vm.translation.txt_add_emergency_contact,
                  style: themeData.textTheme.bodyMedium?.copyWith(
                    color: Colors.black,
                    fontSize: 18,
                  ),
                ),
              ),
              const SizedBox(height: 45),
              CommonTextField(
                controller: vm.sosNameController,
                errorTxt: vm.sosNameError,
                hint: vm.translation.txt_name,
                caps: true,
                keyboardType: TextInputType.text,
                inputFormatters: [
                  FilteringTextInputFormatter.allow(
                    RegExp(r'[a-zA-Z\s]'),
                  ),
                  LengthLimitingTextInputFormatter(50),
                ],
              ),
              const SizedBox(height: 35),
              Row(
                children: [
                  CountryCodeTextField(
                    controller: vm.countryCodeController,
                    hint: vm.translation.txt_Code,
                    onTap: () async {
                      final data =
                          await vm.moveAndWait(CustomRouter.countryList);
                      if (data is CountryModel) {
                        setState(() {
                          vm.country = data;
                          print('frefefefe${vm.country?.toJson()}');
                          vm.sosPhoneController.clear();
                        });
                        vm.countryCodeController.text = data.dialCode ?? "";
                      }
                    },
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: CommonTextField(
                      onChanged: vm.sosPhoneChanged,
                      showHint: false,
                      autoFocus: true,
                      maxCount: int.parse(vm.country?.phoneNumberLength ?? ''),
                      controller: vm.sosPhoneController,
                      hint: vm.translation.txt_Phone_Number,
                      keyboardType: TextInputType.phone,
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 5),
              ...[
                Text(
                  vm.sosPhoneError,
                  style: themeData.textTheme.bodySmall?.copyWith(
                    fontSize: 14,
                    color: CustomColors.clr_FF0000,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  InkWell(
                    onTap: () async {
                      if (!mounted) return;
                      final isValid = await vm.sosValidate();
                      if (!isValid) {
                        setState(() {
                          vm.sosValidate();
                        });
                        return;
                      }
                      final map = {
                        AppConstants.title: vm.sosNameController.text.trim(),
                        AppConstants.phoneNumber:
                            vm.sosPhoneController.text.trim(),
                        AppConstants.countryCode: vm.country?.id ??
                            vm.countryCodeController.text.trim(),
                      };

                      if (!mounted) return;
                      Navigator.pop(context, map);
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 60,
                        vertical: 10,
                      ),
                      decoration: BoxDecoration(
                        color: vm.country?.phoneNumberLength ==
                                vm.sosPhoneController.text
                            ? CustomColors.primaryColor
                            : CustomColors.clr_268800,
                        borderRadius: BorderRadius.circular(25),
                      ),
                      child: Center(
                        child: Text(
                          vm.translation.txt_save,
                          style: themeData.textTheme.titleLarge?.copyWith(
                            color: Colors.white,
                            fontSize: 18,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
