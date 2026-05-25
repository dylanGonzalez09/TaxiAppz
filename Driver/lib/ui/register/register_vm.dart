import 'dart:convert';

import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';

import '../../base/base_vm.dart';
import '../../models/enums.dart';
import '../../network/response_models/company_model.dart';
import '../../network/response_models/config_model.dart';
import '../../network/response_models/country_model.dart';
import '../../network/response_models/custom_name_model.dart';
import '../../network/response_models/zone_model.dart';
import '../../utils/app_constants.dart';
import '../../utils/app_urls.dart';
import '../../utils/custom_router_config.dart';
import '../../utils/preference_helper.dart';

class RegisterVm extends BaseVm {
  final TextEditingController nameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController referralController = TextEditingController();
  final TextEditingController countryCodeController = TextEditingController();
  final TextEditingController phoneNumberController = TextEditingController();
  final TextEditingController serviceLocationController =
      TextEditingController();

  final TextEditingController secondaryLocationController =
      TextEditingController();

  final TextEditingController companyServiceLocationController =
      TextEditingController();

  final TextEditingController companyController = TextEditingController();
  CountryModel? countryModel;
  bool isSecondaryZone = false;
  bool isCompanyRegistration = false;
  bool isAvailable = false;
  bool isError = false;
  CustomNameModel? selectedPrimaryZone;
  List<CustomNameModel>? selectedSecondaryZone;
  List<CustomNameModel> primaryZonesUi = [];
  List<CustomNameModel> secondaryZonesUi = [];
  String nameError = "";
  String emailError = "", demoKey = "";
  String serviceLocationError = "";
  String secondaryLocationError = "";
  String companyError = "";
  RegistrationType selectedRegistrationType = RegistrationType.individual;
  CustomNameModel? selectedCompany;
  List<CompanyModel> companyList = [];
  List<CustomNameModel> companyListUi = [];
  List<ZoneModel> primaryZone = [];
  List<ZoneModel> secondaryZone = [];
  List<ZoneModel> allZones = [];

  void setInitialData(Map<String, dynamic> map) {
    phoneNumberController.text = map[AppConstants.phoneNumber];
    countryModel = map[AppConstants.country];
    countryCodeController.text = countryModel?.dialCode ?? "";
    if (map.containsKey(AppConstants.demoKey)) {
      demoKey = map[AppConstants.demoKey];
    }
  }

  void preMark(List<CustomNameModel> list, CustomNameModel? selected) {
    for (var item in list) {
      item.isSelected = item.id == selected?.id;
    }
  }

  void preMarkMulti(
      List<CustomNameModel> list, List<CustomNameModel>? selected) {
    final selectedIds = selected?.map((e) => e.id).toSet() ?? {};
    for (var item in list) {
      item.isSelected = selectedIds.contains(item.id);
    }
  }

  void setConfigModel() {
    final data = preference.getString(PreferenceHelper.config);
    if (data != null && data.isNotEmpty == true) {
      final config = ConfigModel.fromJson(jsonDecode(data));
      config.settings?.forEach((settings) {
        if (settings.name == SettingsEnum.modules.name) {
          isSecondaryZone = settings.settings?.isSecondaryZoneRegister == "yes";
          isCompanyRegistration =
              settings.settings?.isCompanyRegistration == "yes";
        }
      });
    }
  }

  void getServiceLocation() async {
    showLoader();
    final response = await apiHelper.get(AppUrls.zoneList);
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      if (r.data != null) {
        var jsonString = jsonDecode(json.encode(r.data));
        final zones = List<ZoneModel>.from(
            jsonString.map((model) => ZoneModel.fromJson(model)));
        allZones.clear();
        for (var zone in zones) {
          allZones.add(zone);
          if (zone.zoneLevel == AppConstants.PRIMARY) {
            primaryZone.add(zone);
            final model =
                CustomNameModel(name: zone.zoneName ?? "", id: zone.sId ?? "");
            primaryZonesUi.add(model);
          }
        }
      }
      hideLoader();
      notifyListeners();
    });
  }

  void validate() {
    if (nameController.text.length < 3) {
      nameError = translation.txt_Name_is_invalid;
      notifyListeners();
    } else if (!isValidEmail(emailController.text)) {
      print('divjdfijdfi');
      nameError = "";
      emailError = translation.txt_Email_invalid;
      notifyListeners();
    }
    // else if (emailController.text.isEmpty) {
    //   print('divjdfijdfi');
    //   nameError = "";
    //   emailError = "Email required";
    //   notifyListeners();
    // }
    else if (selectedPrimaryZone == null) {
      nameError = "";
      emailError = "";
      serviceLocationError = translation.txt_Service_location_is_required;
      notifyListeners();
    } else if (isSecondaryZone && selectedSecondaryZone == null) {
      nameError = "";
      emailError = "";
      serviceLocationError = "";
      secondaryLocationError = translation.txt_Secondary_location_required;
      notifyListeners();
    } else if (selectedRegistrationType == RegistrationType.company &&
        selectedCompany == null) {
      nameError = "";
      emailError = "";
      serviceLocationError = "";
      secondaryLocationError = "";
      companyError = translation.txt_Company_required;
      notifyListeners();
    } else {
      nameError = "";
      emailError = "";
      serviceLocationError = "";
      companyError = "";
      secondaryLocationError = "";
      notifyListeners();
      final map = {
        AppConstants.name: nameController.text,
        if (emailController.text.isNotEmpty)
          AppConstants.email: emailController.text,
        if (referralController.text.isNotEmpty)
          AppConstants.referralCode: referralController.text,
        AppConstants.country: countryModel,
        AppConstants.phoneNumber: phoneNumberController.text,
        AppConstants.serviceLocation: selectedPrimaryZone,
        AppConstants.isSecondaryZone: isSecondaryZone,
        if (isSecondaryZone)
          AppConstants.secondaryLocation: selectedSecondaryZone,
        AppConstants.registrationType: selectedRegistrationType,
        if (selectedRegistrationType == RegistrationType.company)
          AppConstants.company: selectedCompany,
        if (demoKey.isNotEmpty) AppConstants.demoKey: demoKey
      };
      checkEmailAndProceed(map);
      // moveToNamed(CustomRouterConfig.vehicleInformationScreen, args: map);
    }
  }

  Future<void> checkEmailAndProceed(Map<String, dynamic> map) async {  // Add type
    isLoading.value = true;
    final email = emailController.text.trim();
    if (!isValidEmail(email)) {  // Double-check (defensive)
      isLoading.value = false;
      emailError = translation.txt_Email_invalid;
      notifyListeners();
      return;
    }
    final response = AppConstants.email;
    isLoading.value = false;
    if (response.isEmail == true) {
      showErrorDialog(message: translation.txt_email_taken);
      emailError = translation.txt_email_taken;  // Show in field too
      notifyListeners();
      return;
    }
    moveToNamed(CustomRouterConfig.vehicleInformationScreen, args: map);
  }
  void getCompanyList() async {
    showLoader();
    final response = await apiHelper.get(AppUrls.getCompanyList);
    hideLoader();
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      if (r.data != null) {
        var jsonString = jsonDecode(json.encode(r.data));
        final apiCompany = List<CompanyModel>.from(
            jsonString.map((model) => CompanyModel.fromJson(model)));
        if (apiCompany.isNotEmpty) {
          for (var singleItem in apiCompany) {
            companyList.add(singleItem);
            final companyUser = CustomNameModel(
                name: singleItem.companyName ?? "", id: singleItem.sId ?? "");
            companyListUi.add(companyUser);
          }
        }
      }
      notifyListeners();
    });
  }
}
