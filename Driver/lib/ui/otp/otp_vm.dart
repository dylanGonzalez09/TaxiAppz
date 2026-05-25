import 'dart:async';
import 'dart:io';
import 'package:get/get_rx/src/rx_types/rx_types.dart';
import 'package:taxiappzpro/base/base_vm.dart';
import 'package:taxiappzpro/main.dart';
import 'package:taxiappzpro/network/response_models/country_model.dart';
import 'package:taxiappzpro/network/response_models/verify_model.dart';
import 'package:taxiappzpro/utils/app_constants.dart';
import 'package:taxiappzpro/utils/custom_router_config.dart';

import '../../utils/app_urls.dart';
import '../../utils/preference_helper.dart';

class OtpVm extends BaseVm {
  Timer? _timer;
  RxInt seconds = 60.obs;
  RxString otpTimer = "".obs;
  bool requestResend = false;
  RxString otpTimeDesc = "".obs;
  String otp = "";
  String otpError = "";
  CountryModel? country;
  String phoneNumber = "";

  bool isAvailable = false;

  void startTimer() {
    _timer ??= Timer.periodic(const Duration(seconds: 1), (timer) {
      seconds.value -= 1;
      otpTimeDesc.value = "${translation.txtGetAnotherCodeIn} ";
      otpTimer.value = _formatTimer(seconds.value);
      requestResend = false;
      if (seconds.value == 0) {
        requestResend = true;
        seconds.value = 60;
        otpTimer.value = "Resend?";
        otpTimeDesc.value = "";
        _timer?.cancel();
        _timer = null;
      }
    });
  }

  String _formatTimer(int timerValue) {
    int minutes = timerValue ~/ 60;
    int seconds = timerValue % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  void validateOtp() {
    if (otp.isEmpty || otp.length < 4) {
      otpError = translation.txt_Invalid_otp;
    } else {
      otpError = "";
    }
    notifyListeners();
    if (otpError.isEmpty) {
      verifyOTP();
    }
  }

  void onOtpChange(String value) {
    if (value.length < 4) {
      otpError = translation.txt_Enter_OTP;
      isAvailable = false;
    } else {
      otpError = "";
      isAvailable = true;
    }
    notifyListeners();
    otp = value;
  }

  void setData(Map<String, dynamic> data) {
    if (data[AppConstants.country] is CountryModel) {
      country = data[AppConstants.country];
    }

    if (data[AppConstants.phoneNumber] is String) {
      phoneNumber = data[AppConstants.phoneNumber];
    }
  }

  void resendOtp() async {
    if (requestResend) {
      isLoading.value = true;
      final map = {
        AppConstants.countryCode: country?.id ?? "",
        AppConstants.phoneNumber: phoneNumber,
        AppConstants.authenticationType: AppConstants.OTP
      };
      final response = await apiHelper.post(AppUrls.login, params: map);
      isLoading.value = false;
      response.fold((e) {
        showErrorDialog(errorModel: e);
      }, (r) {
        startTimer();
        showErrorDialog(message: translation.txt_SMS_resent_success);
      });
    }
  }

  void verifyOTP() async {
    if (!isLoading.value) {
      isLoading.value = true;
      final map = {
        AppConstants.phoneNumber: phoneNumber,
        AppConstants.countryCode: country?.id,
        AppConstants.otp: otp,
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
              AppConstants.phoneNumber: phoneNumber
            };
            if (Platform.isIOS) {
              moveToNamed(CustomRouterConfig.registerScreen, args: map);
            }else {
              popAndMove(CustomRouterConfig.registerScreen, args: map);
            }
          } else {
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
}
