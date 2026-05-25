import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:taxiappzpro/utils/utils.dart';
import '../../base/base_vm.dart';
import '../../main.dart';
import '../../utils/app_constants.dart';
import '../../utils/app_urls.dart';
import '../../utils/custom_router_config.dart';
import '../../utils/preference_helper.dart';

class LogoutVm extends BaseVm {
  void logoutDriver() async {
    if (!isLoading.value) {
      isLoading.value = true;

      final map = {
        PreferenceHelper.refreshToken:
        preference.getString(PreferenceHelper.refreshToken),
      };

      final response = await apiHelper.post(AppUrls.logoutDriver, params: map);
      response.fold((e) {
        showErrorDialog(errorModel: e);
      }, (r) async {
        AppConstants.driverFirstName = "";
        AppConstants.driverPhoneNumber = "";
        AppConstants.driverServiceType = "";
        AppConstants.driverProfilePicture = "";

        Utils.showToast(r.message ?? translation.txtLogout);

        await preference.remove(PreferenceHelper.primaryZone);
        await preference.remove(PreferenceHelper.secondaryZone);
        await preference.remove(PreferenceHelper.demoKey);
        await preference.remove(PreferenceHelper.authToken);
        await preference.remove(PreferenceHelper.refreshToken);
        await preference.remove(PreferenceHelper.vehicleId);
        await preference.remove(PreferenceHelper.vehicleType);

        final existingServiceType =
        preference.getString(PreferenceHelper.serviceType)?.toUpperCase();
        await preference.setString(PreferenceHelper.serviceType, existingServiceType ?? "");
        // if (existingServiceType == "LOCAL") {
        //   await preference.setString(PreferenceHelper.serviceType, AppConstants.local.toUpperCase());
        // } else {
        //   await preference.setString(PreferenceHelper.serviceType, existingServiceType ?? "");
        // }

        FlutterForegroundTask.sendDataToTask({AppConstants.secondaryZone: ""});
        if (await FlutterForegroundTask.isRunningService) {
          FlutterForegroundTask.stopService();
        }

        MyApp.of(navigatorKey.currentContext!)?.disposeOverlayOtherAppWindows();
        for (var topic in mqtt.subscribedTopics) {
          if (topic.isNotEmpty) mqtt.unSubscribe(topic);
        }
        mqtt.disconnect();

        popAndMove(CustomRouterConfig.loginScreen);
      });

      isLoading.value = false;
    }
  }
}
