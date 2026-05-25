import '../../network/response_models/referral_model.dart';
import '../../utils/base_vm.dart';
import '../../utils/app_constants.dart';
import '../../utils/app_url.dart';

class ReferralVm extends BaseVm {
  ReferralModel? referralDetail;
  bool isClaimAmount = false;
  Future<void> getReferralCodeDetails() async {
    showLoader();
    final response = await apiHelper.get(AppUrls.getReferralCode);
    hideLoader();
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      referralDetail = parseData(r.data, ReferralModel.fromJson);
      if (referralDetail != null) {
        isClaimAmount = referralDetail?.referralAmount != null
            ? referralDetail!.referralAmount! > 0
            : false;
        notifyListeners();
      } else {
        showErrorDialog(message: AppConstants.someThingWentWrong);
      }
    });
  }

  Future<void> claimReferral() async {
    final response = await apiHelper.get(AppUrls.referralClaim);
    response.fold((e) => showErrorDialog(errorModel: e), (r) {
      getReferralCodeDetails();
    });
    isLoading.value = false;
    notifyListeners();
  }

}
