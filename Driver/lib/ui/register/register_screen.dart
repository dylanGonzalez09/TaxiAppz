import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/svg.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:provider/provider.dart';
import 'package:taxiappzpro/ui/register/register_vm.dart';
import '../../components/contrycode_textfield.dart';
import '../../components/custom_text_field.dart';
import '../../components/drawer_scaffold.dart';
import '../../components/header_view.dart';
import '../../components/proceed_button.dart';
import '../../di/di_config.dart';
import '../../models/enums.dart';
import '../../network/response_models/custom_name_model.dart';
import '../../utils/app_constants.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../../utils/custom_router_config.dart';
import '../../utils/dimensions.dart';
import '../dialogs/select_dialog.dart';

class RegisterScreen extends StatefulWidget {
  final Map<String, dynamic> args;

  const RegisterScreen({
    super.key,
    required this.args,
  });

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final vm = getIt<RegisterVm>();
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    vm.setInitialData(widget.args);
    vm.setConfigModel();
    Future.delayed(Duration.zero, () {
      vm.getServiceLocation();
    });
    super.initState();
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: DrawerScaffold(
        body: Padding(
            padding: const EdgeInsets.only(
              left: Dimensions.padding_20,
              right: Dimensions.padding_20,
            ),
            child: ChangeNotifierProvider<RegisterVm>(
              create: (_) => vm,
              child: Consumer<RegisterVm>(builder: (key, vm, child) {
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    HeaderView(
                      title: vm.translation.txt_Register,
                      onBackPressed: () =>
                          vm.popAndMove(CustomRouterConfig.loginScreen),
                    ),
                    Expanded(
                      child: SingleChildScrollView(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: Dimensions.padding_20),
                            Align(
                                alignment: Alignment.center,
                                child: SvgPicture.asset(
                                  CustomImages.logoLoginOtpSvg,
                                  height: 80,
                                  width: 120,
                                )),
                            const SizedBox(height: Dimensions.padding_40),
                            CustomTextField(
                              controller: vm.nameController,
                              hint: vm.translation.txt_Name,
                              caps: true,
                              errorTxt: vm.nameError,
                              inputFormatters: [
                                FilteringTextInputFormatter.allow(
                                  RegExp(r'[a-zA-Z\s]'),
                                ),
                                LengthLimitingTextInputFormatter(50),
                              ],
                              onChanged: (value) {
                                setState(() {
                                  vm.isError = value.isEmpty;
                                });
                              },
                            ),
                            const SizedBox(height: Dimensions.padding_15),
                            CustomTextField(
                              controller: vm.emailController,
                              hint: vm.translation.txt_Email_optional,
                              keyboardType: TextInputType.text,
                              errorTxt: vm.emailError,
                            ),
                            const SizedBox(height: Dimensions.padding_15),
                            CustomTextField(
                              controller: vm.referralController,
                              hint: vm.translation.txt_referral_optional,
                              keyboardType: TextInputType.text,
                            ),
                            const SizedBox(height: Dimensions.padding_15),
                            Row(
                              children: [
                                CountryCodeTextField(
                                  onTap: () {},
                                  hint: vm.translation.txt_Code,
                                  controller: vm.countryCodeController,
                                ),
                                const SizedBox(width: Dimensions.padding_15),
                                Expanded(
                                  child: CustomTextField(
                                    controller: vm.phoneNumberController,
                                    hint: vm.translation.txt_Phone_Number,
                                    keyboardType: TextInputType.phone,
                                    readOnly: true,
                                    showHint: false,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: Dimensions.padding_15),
                            CustomTextField(
                              controller: vm.serviceLocationController,
                              hint: vm.translation.txt_Service_location,
                              readOnly: true,
                              errorTxt: vm.serviceLocationError,
                              suffixIcon: Icon(Icons.arrow_drop_down_outlined),
                              onTap: () async {
                                vm.preMark(
                                    vm.primaryZonesUi, vm.selectedPrimaryZone);

                                final result = await showDialog(
                                  context: context,
                                  builder: (BuildContext context) {
                                    return SelectDialog(
                                      title: vm.translation
                                          .txt_select_service_location,
                                      customModel: vm.primaryZonesUi,
                                    );
                                  },
                                );

                                if (result != null &&
                                    result is CustomNameModel) {
                                  vm.serviceLocationController.text =
                                      result.name ?? "";
                                  vm.selectedPrimaryZone = result;
                                  vm.serviceLocationError = "";
                                  vm.secondaryZone.clear();
                                  vm.secondaryZonesUi.clear();
                                  vm.selectedSecondaryZone = null;
                                  vm.secondaryLocationController.text = "";
                                  vm.secondaryLocationError = "";
                                  for (var i in vm.allZones) {
                                    if (i.zoneLevel == AppConstants.SECONDARY) {
                                      if (vm.selectedPrimaryZone?.id ==
                                          i.primaryZoneId) {
                                        vm.secondaryZone.add(i);
                                        final customModel = CustomNameModel(
                                            name: i.zoneName ?? "",
                                            id: i.sId ?? "");
                                        vm.secondaryZonesUi.add(customModel);
                                      }
                                    }
                                  }
                                  setState(() {});
                                }
                              },
                            ),
                            if (vm.isSecondaryZone)
                              const SizedBox(height: Dimensions.padding_15),
                            if (vm.isSecondaryZone)
                              CustomTextField(
                                controller: vm.secondaryLocationController,
                                hint: vm.translation.txt_Secondary_location,
                                readOnly: true,
                                errorTxt: vm.secondaryLocationError,
                                suffixIcon:
                                    Icon(Icons.arrow_drop_down_outlined),
                                onTap: () async {
                                  if (vm.selectedPrimaryZone == null) {
                                    setState(() {
                                      vm.serviceLocationError = vm.translation
                                          .txt_Service_location_is_required;
                                    });
                                  } else {
                                    vm.preMarkMulti(vm.secondaryZonesUi,
                                        vm.selectedSecondaryZone);

                                    final result = await showDialog(
                                      context: context,
                                      builder: (BuildContext context) {
                                        return SelectDialog(
                                          errorText: vm.translation
                                              .txt_Select_secondary_location,
                                          showErrorDialog: vm.showErrorDialog,
                                          btnText: vm.translation.txt_Ok,
                                          isMultipleSelect: true,
                                          title: vm.translation
                                              .txt_Select_secondary_location,
                                          customModel: vm.secondaryZonesUi,
                                        );
                                      },
                                    );

                                    if (result != null &&
                                        result is List<CustomNameModel>) {
                                      vm.secondaryLocationController.text =
                                          result
                                              .where((i) => i.isSelected)
                                              .map((m) => m.name as String)
                                              .toList()
                                              .join(", ");
                                      vm.selectedSecondaryZone = result;
                                      vm.secondaryLocationError = "";
                                      setState(() {});
                                    }
                                  }
                                },
                              ),
                            if (vm.isCompanyRegistration)
                              const SizedBox(height: Dimensions.padding_15),
                            if (vm.isCompanyRegistration)
                              Text(
                                vm.translation.txt_Category,
                                style: Theme.of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(
                                      color: Colors.black,
                                      fontSize: 15,
                                    ),
                              ),
                            if (vm.isCompanyRegistration)
                              Row(
                                mainAxisAlignment: MainAxisAlignment.start,
                                children: [
                                  Radio<RegistrationType>(
                                    value: RegistrationType.individual,
                                    groupValue: vm.selectedRegistrationType,
                                    onChanged: (value) {
                                      setState(() {
                                        vm.selectedRegistrationType = value!;
                                      });
                                    },
                                    activeColor: CustomColors.primaryColor,
                                  ),
                                  Text(
                                    vm.translation.txt_Individual,
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodySmall
                                        ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 15,
                                        ),
                                  ),
                                  const SizedBox(width: Dimensions.padding_10),
                                  Radio<RegistrationType>(
                                    value: RegistrationType.company,
                                    groupValue: vm.selectedRegistrationType,
                                    onChanged: (value) {
                                      vm.getCompanyList();
                                      setState(() {
                                        vm.selectedRegistrationType = value!;
                                      });
                                    },
                                    activeColor: CustomColors.primaryColor,
                                  ),
                                  Text(
                                    vm.translation.txt_Company,
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodySmall
                                        ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 15,
                                        ),
                                  ),
                                ],
                              ),
                            if (vm.selectedRegistrationType ==
                                RegistrationType.company)
                              CustomTextField(
                                controller: vm.companyController,
                                hint: vm.translation.txt_Company,
                                errorTxt: vm.companyError,
                                suffixIcon:
                                    Icon(Icons.arrow_drop_down_outlined),
                                readOnly: true,
                                onTap: () async {
                                  vm.preMark(
                                      vm.companyListUi, vm.selectedCompany);

                                  final result = await showDialog(
                                    context: context,
                                    builder: (BuildContext context) {
                                      return SelectDialog(
                                        title:
                                            vm.translation.txt_Select_company,
                                        customModel: vm.companyListUi,
                                      );
                                    },
                                  );

                                  if (result != null &&
                                      result is CustomNameModel) {
                                    vm.selectedCompany = result;
                                    vm.companyController.text =
                                        result.name ?? "";
                                    setState(() {
                                      vm.companyError = "";
                                    });
                                  }
                                },
                              ),
                            const SizedBox(height: Dimensions.padding_15),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: Dimensions.padding_20),
                    Obx(() => Center(
                          child: ProceedButton(
                            btnTxt: vm.translation.txtNext,
                            isLoading: vm.isLoading.value,
                            onPressed: vm.validate,
                          ),
                        )),
                    const SizedBox(height: Dimensions.padding_20),
                  ],
                );
              }),
            )),
        scaffoldKey: scaffoldKey,
      ),
    );
  }
}
