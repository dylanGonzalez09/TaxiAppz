import 'dart:convert';
import 'dart:io';

import 'package:device_info_plus/device_info_plus.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:taxiappzpro/bottom_sheets/accept_privacy_policy_bs.dart';
import 'package:taxiappzpro/di/di_config.dart';
import 'package:taxiappzpro/main.dart';
import 'package:taxiappzpro/models/enums.dart';
import 'package:taxiappzpro/network/response_models/config_model.dart';
import 'package:taxiappzpro/network/response_models/country_model.dart';
import 'package:taxiappzpro/utils/app_urls.dart';
import 'package:taxiappzpro/utils/custom_router_config.dart';
import 'package:taxiappzpro/utils/utils.dart';

import '../../base/base_vm.dart';
import '../../utils/app_constants.dart';
import '../../utils/preference_helper.dart';

class LoginVm extends BaseVm {
  CountryModel? country;
  String termsAndCondition = "";
  String privacyPolicy = "";
  final TextEditingController phoneNumberController = TextEditingController();
  final TextEditingController countryCodeController = TextEditingController();
  bool isAvailable = false;
  String errorTxt = "";

  CountryModel? selectedCountry;

  String? get selectedCountryCode => selectedCountry?.dialCode;

  LoginVm() {
    final data = preference.getString(PreferenceHelper.countryList) ?? "";
    if (data.isNotEmpty) {
      print('svjdfijijfijbfj');
      final response = jsonDecode(data);
      var jsonString = jsonDecode(json.encode(response));
      final countryList = List<CountryModel>.from(
          jsonString.map((model) => CountryModel.fromJson(model)));
      final rawConfig = preference.getString(PreferenceHelper.config);
      if (rawConfig != null && rawConfig.isNotEmpty == true) {
        final config = ConfigModel.fromJson(jsonDecode(rawConfig));

        String countryCode = "";
        config.settings?.forEach((settings) {
          if (settings.name == SettingsEnum.general.name) {
            print('oospsofefope');
            countryCode = settings.settings?.defaultCountry ?? "";
          }
        });
        for (var country in countryList) {
          if (country.id == countryCode) {
            print('poerietutiroetu');
            this.country = country;
            countryCodeController.text = country.dialCode ?? "";
          }
        }
      }
    }
    final configData = preference.getString(PreferenceHelper.config);
    if (configData != null && configData.isNotEmpty == true) {
      final String languageId =
          preference.getString(PreferenceHelper.languageId) ?? "";
      final config = ConfigModel.fromJson(jsonDecode(configData));
      print("fk[efkergla${languageId}");
      if (config.settings != null) {
        outerloop:
        for (var i in config.settings!) {
          if (i.name == SettingsEnum.terms.name) {
            termsAndCondition =
                i.settings?.termsConditionByLang(languageId) ?? "";
            privacyPolicy = i.settings?.privacyPolicyByLang(languageId) ?? "";
            break outerloop;
          }
        }
      }
    }
  }

  void login() async {
    if (country == null) {
      showErrorDialog(message: translation.txt_country_is_required);
    } else {
      if (!isLoading.value) {
        isLoading.value = true;
        var map = {
          AppConstants.countryCode: country?.id ?? "",
          AppConstants.phoneNumber: phoneNumberController.text,
          AppConstants.authenticationType: AppConstants.OTP
        };
        final response = await apiHelper.post(AppUrls.login, params: map);
        isLoading.value = false;
        response.fold((e) {
          showErrorDialog(errorModel: e);
        }, (r) {
          final map = {
            AppConstants.country: country,
            AppConstants.phoneNumber: phoneNumberController.text
          };
          if (Utils.isDemoKey) {
            moveToNamed(CustomRouterConfig.demoKey, args: map);
          } else {
            moveToNamed(CustomRouterConfig.otpScreen, args: map);
          }
        });
      }
    }
  }

  void onTextChanged(String number) {
    if (number.isEmpty) {
      errorTxt = translation.txt_Phone_number_required;
      isAvailable = false;
    } else if (!RegExp(r'^[0-9]+$').hasMatch(number)) {
      errorTxt = translation.txt_Phone_number_invalid;
      isAvailable = false;
    } else if (!validatePhoneNumberLength(number)) {
      errorTxt = translation.txt_Phone_number_invalid;
      isAvailable = false;
    } else {
      isAvailable = true;
      errorTxt = "";
      if (number.length == int.parse(country!.phoneNumberLength.toString())) {
        FocusScope.of(navigatorKey.currentState!.context).unfocus();
      }
    }
    notifyListeners();
  }

  void onProceed() {
    final dialCode = selectedCountryCode;

    if (validate(dialCode)) {
      final isPrivacyPolicyAccepted =
          preference.getBool(PreferenceHelper.isPrivacyPolicyAcceptedBool) ??
              false;
      if (!isPrivacyPolicyAccepted) {
        if (navigatorKey.currentState != null) {
          showModalBottomSheet(
            context: navigatorKey.currentState!.context,
            builder: (_) {
              return TermsAndPrivacyBs(vm: this);
            },
          );
        }
      } else {
        FocusScope.of(navigatorKey.currentState!.context).unfocus();
        login();
      }
    }
  }

  // bool validate() {
  //   bool isValidated = false;
  //   if (phoneNumberController.text.isEmpty) {
  //     errorTxt = translation.txt_Phone_number_required;
  //     isValidated = false;
  //   } else if (!RegExp(r'^[0-9]+$').hasMatch()) {
  //     errorTxt = translation.txt_Phone_number_invalid;
  //     isAvailable = false;
  //
  //   }else if (!validatePhoneNumberLength(phoneNumberController.text)) {
  //     errorTxt = translation.txt_Phone_number_invalid;
  //     isValidated = false;
  //   } else {
  //     errorTxt = "";
  //     isValidated = true;
  //   }
  //   notifyListeners();
  //   return isValidated;
  // }
  bool validate(String? dialCode) {
    final number = phoneNumberController.text.trim();
    bool isValidated = false;
    if (number.isEmpty) {
      errorTxt = translation.txt_Phone_number_required;
      isValidated = false;
    } else if (!RegExp(r'^[0-9]+$').hasMatch(number)) {
      errorTxt = translation.txt_Phone_number_invalid;
      isValidated = false;
    } else if (!validatePhoneNumberLength(number)) {
      errorTxt = translation.txt_Phone_number_invalid;
      isValidated = false;
    } else if (_isValidByCountry(number, dialCode)) {
      errorTxt = translation.txt_Phone_number_required;
      isValidated = false;
    } else if (_isRepeated(number)) {
      errorTxt = translation.txt_Phone_number_required;
      isValidated = false;
    } else {
      errorTxt = "";
      isValidated = true;
    }

    notifyListeners();
    return isValidated;
  }

  bool _isValidByCountry(String number, String? dialCode) {
    switch (dialCode) {
      case "IN":
        return RegExp(r'^[6-9]\d{9}$').hasMatch(number);
      case "US":
        return RegExp(r'^\d{10}$').hasMatch(number);
      case "GB":
        return RegExp(r'^7\d{9}$').hasMatch(number);
      case "NG":
        return RegExp(r'^[789]\d{9}$').hasMatch(number);
      case "GH":
        return RegExp(r'^[235]\d{8}$').hasMatch(number);
      case "AF":
        return RegExp(r'^[7]\d{8}$').hasMatch(number);
      case "MX":
        return RegExp(r'^\d{10}$').hasMatch(number);
      default:
        return false;
    }
  }

  bool _isRepeated(String number) {
    // All digits same (1111111111)
    if (RegExp(r'^(\d)\1+$').hasMatch(number)) return true;
    // Too many consecutive repeats (7777)
    if (RegExp(r'(\d)\1{3,}').hasMatch(number)) return true;
    // Sequential numbers (1234567890 / 9876543210)
    if (_isSequential(number)) return true;
    return false;
  }

  bool _isSequential(String number) {
    const asc = "0123456789";
    const desc = "9876543210";
    return asc.contains(number) || desc.contains(number);
  }

  void notification() async {
    if (Platform.isAndroid) {
      final deviceInfo = getIt<AndroidDeviceInfo>();
      if (deviceInfo.version.sdkInt >= 33) {
        final notificationStatus = await Permission.notification.status;
        if (!notificationStatus.isGranted) {
          final response = await Permission.notification.request();
          if (response.isGranted) {
          } else {
            showNotificationDisabledDialog();
          }
        } else {}
      } else {
        final notificationStatus = await Permission.notification.status;
        if (!notificationStatus.isGranted) {
          final response = await Permission.notification.request();
          if (response.isGranted) {
          } else {
            showNotificationDisabledDialog();
          }
        } else {}
      }
    } else if (Platform.isIOS) {
      final flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();

      final isGranted = await flutterLocalNotificationsPlugin
          .resolvePlatformSpecificImplementation<
              IOSFlutterLocalNotificationsPlugin>()
          ?.requestPermissions(alert: true, badge: true, sound: true);

      if (isGranted == null || !isGranted) {
        showNotificationDisabledDialog();
      }
    }
  }

  bool validatePhoneNumberLength(String number) {
    if (country != null) {
      return number.length == int.parse(country!.phoneNumberLength.toString());
    }
    // Remove spaces
    number = number.replaceAll(" ", "").trim();
    // Only numbers allowed
    if (!RegExp(r'^[0-9]+$').hasMatch(number)) {
      return false;
    }
    // Country length check
    int requiredLength = int.parse(country!.phoneNumberLength.toString());
    if (number.length != requiredLength) {
      return false;
    }
    if (RegExp(r'^(\d)\1+$').hasMatch(number)) {
      return false;
    }

    /// REJECT REPEATING PATTERNS
    /// 1212121212
    /// 5656565656
    if (RegExp(r'^(\d{2,5})\1+$').hasMatch(number)) {
      return false;
    }

    /// REJECT STRICT SEQUENTIAL
    /// 1234567890
    /// 0987654321
    const sequentialNumbers = [
      "0123456789",
      "1234567890",
      "0987654321",
      "9876543210",
    ];

    if (sequentialNumbers.contains(number)) {
      return false;
    }

    /// REJECT TOO MANY SAME DIGITS CONTINUOUSLY
    /// 9999000011
    /// 7777888899
    if (RegExp(r'(\d)\1{4,}').hasMatch(number)) {
      return false;
    }
    return true;
  }

  int getPhoneMaxLength(String? dialCode) {
    switch (dialCode) {
      case "+91": // India
        return 10;
      case "+1": // USA
        return 10;
      case "+233": // Ghana
        return 9;
      case "+93": // Afghanistan
        return 9;
      case "+52": // Mexico
        return 10;
      case "+44": // UK
        return 10;
      case "+234": // Nigeria
        return 8;
      default:
        return 12;
    }
  }

  void showNotificationDisabledDialog() {
    showDialog(
      context: navigatorKey.currentState!.context,
      builder: (BuildContext context) {
        return AlertDialog(
          insetPadding: const EdgeInsets.symmetric(horizontal: 30),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          title: Center(
            child: Text(
              "Notifications Disabled",
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.black,
                    fontSize: 18,
                  ),
            ),
          ),
          content: Text(
            "Notifications are currently disabled. To stay updated on important updates, please enable notifications from the settings.",
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.black,
                  fontSize: 16,
                ),
            maxLines: 5,
          ),
          actions: [
            TextButton(
              child: const Text("OK"),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }
}
