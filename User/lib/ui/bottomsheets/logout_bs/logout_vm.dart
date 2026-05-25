import 'package:user/utils/app_constants.dart';
import 'package:user/utils/utils.dart';

import '../../../utils/app_url.dart';
import '../../../utils/base_vm.dart';
import '../../../utils/custom_router.dart';
import '../../../utils/preference_helper.dart';

class LogoutVm extends BaseVm {
  void logoutUser() async {
    if (!isLoading.value) {
      isLoading.value = true;

      final map = {
        PreferenceHelper.refreshToken:
            preference.getString(PreferenceHelper.refreshToken),
      };

      final response = await apiHelper.post(AppUrls.logoutUser, params: map);
      response.fold((e) {
        showErrorDialog(errorModel: e);
      }, (r) {
        AppConstants.userFirstName = "";
        AppConstants.userPhoneNumber = "";
        AppConstants.userProfileImage = "";
        AppConstants.isBookingForOthersChanged = false;
        AppConstants.bookingForOthersRiderName = "";
        AppConstants.bookingForOthersRiderPhoneNumber = "";
        Utils.showToast(r.message ?? translation.txt_logout);
        preference.setString(PreferenceHelper.demoKey, "");
        preference.remove(PreferenceHelper.demoKey);
        preference.setString(PreferenceHelper.authToken, "");
        preference.setString(PreferenceHelper.refreshToken, "");
        preference.remove(PreferenceHelper.authToken);
        preference.remove(PreferenceHelper.refreshToken);
        for (var i in mqtt.subscribedTopics) {
          if (i.isNotEmpty) {
            mqtt.unSubscribe(i);
          }
        }
        mqtt.disconnect();
        popAndMove(CustomRouter.loginScreen);
      });
      isLoading.value = false;
    }
  }
}
