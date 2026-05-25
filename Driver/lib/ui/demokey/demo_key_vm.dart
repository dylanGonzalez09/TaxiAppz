import 'dart:async';

import 'package:flutter/cupertino.dart';
import 'package:taxiappzpro/utils/custom_router_config.dart';

import '../../base/base_vm.dart';
import '../../main.dart';
import '../../network/response_models/country_model.dart';
import '../../network/response_models/verify_model.dart';
import '../../utils/app_constants.dart';

import '../../utils/app_urls.dart';
import '../../utils/preference_helper.dart';

class DemoKeyVm extends BaseVm {
  bool requestResend = false;
  String demoKey = "";
  String demoKeyError = "";
  CountryModel? country;
  String phoneNumber = "";
  bool isAvailable = false;
  TextEditingController controller = TextEditingController();

  void setData(Map<String, dynamic> data) {
    if (data[AppConstants.country] is CountryModel) {
      country = data[AppConstants.country] as CountryModel;
    }
    if (data[AppConstants.phoneNumber] is String) {
      phoneNumber = data[AppConstants.phoneNumber];
    }
  }

  void verifyDemoKey() async {
    if (!isLoading.value) {
      isLoading.value = true;
      final map = {
        AppConstants.phoneNumber: phoneNumber,
        AppConstants.countryCode: country?.id,
        AppConstants.demoKey: demoKey,
        AppConstants.deviceInfoHash: await getFcmToken(),
        AppConstants.deviceType: getDevicePlatform()
      };

      final response = await apiHelper.post(AppUrls.otpVerify, params: map);
      response.fold((e) {
        showErrorDialog(errorModel: e);
      }, (r) async {
        final data = parseData(r.data, VerifyModel.fromJson);
        if (data != null) {
          if (data.usertype == AppConstants.NewUser) {
            final map = {
              AppConstants.country: country,
              AppConstants.phoneNumber: phoneNumber,
              AppConstants.demoKey: demoKey
            };
            preference.setString(PreferenceHelper.demoKey, demoKey);
            moveToNamed(CustomRouterConfig.registerScreen, args: map);
          } else {
            preference.setString(PreferenceHelper.demoKey, demoKey);
            preference.setString(
                PreferenceHelper.driverId, data.driver?.sId ?? "");
            preference.setString(
                PreferenceHelper.authToken, data.tokens?.access?.token ?? "");
            preference.setString(PreferenceHelper.refreshToken,
                data.tokens?.refresh?.token ?? "");
            await MyApp.of(navigatorKey.currentState!.context)?.connectToMqtt();
            await MyApp.of(navigatorKey.currentState!.context)
                ?.subscribeTODriverDetails();
            popAndMove(CustomRouterConfig.permissionScreen,
                args: CustomRouterConfig.mapScreen);
          }
        } else {
          showErrorDialog();
        }
      });
      isLoading.value = false;
    }
  }

  void onOtpChange(String value) {
    demoKeyError = "";
    if (value.length < 2) {
      //  demoKeyError = translation.txtInvalidDemoKey;
      isAvailable = false;
    } else {
      // demoKeyError = "";
      isAvailable = true;
    }
    notifyListeners();
    demoKey = value;
  }
}
