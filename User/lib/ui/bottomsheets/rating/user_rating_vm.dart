import 'dart:convert';


import '../../../network/response_models/trip_model.dart';
import '../../../network/response_models/user_feedback_model.dart';
import '../../../utils/app_url.dart';
import '../../../utils/base_vm.dart';
import '../../../utils/custom_router.dart';
import '../../../utils/preference_helper.dart';


class UserRatingVm extends BaseVm {
  List<UserFeedbackModel>? userFeedbackList = [];
  List<bool> feedbackStatusList = [];
  int selectedRating = 0;

  Trip? tripModel;

  Future<void> getUserFeedbackList() async {
    final map = {
      "zoneId": preference.getString(PreferenceHelper.zoneId)
    };
    final response = await apiHelper.post(AppUrls.userFeedbackList,params: map);
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      if (r.data != null) {
        var jsonString = jsonDecode(json.encode(r.data));
        final data = List<UserFeedbackModel>.from(
            jsonString.map((model) => UserFeedbackModel.fromJson(model)));
        userFeedbackList?.clear();
        userFeedbackList?.addAll(data);
        feedbackStatusList = List<bool>.filled(userFeedbackList?.length ?? 0, true);
        print('complaintList length: ${userFeedbackList?.length ?? 0}');
      }
      notifyListeners();
    });
  }

  void submitUserFeedback() async {
    showLoader();
    final feedbackList = userFeedbackList?.asMap().entries.map((entry) {
      int index = entry.key;
      UserFeedbackModel feedback = entry.value;
      return {
        'status': feedbackStatusList[index] ? true : false,
        'id': feedback.id,
        'question': feedback.question
      };
    }).toList();
    final map = {
      'requestId': tripModel?.sId ,
      'rating': selectedRating,
      'feedback': feedbackList
    };
    print('erferferferf${map}');
    final response = await apiHelper.post(AppUrls.userFeedbackSubmit, params: map);

    hideLoader();
    response.fold((e) => showErrorDialog(errorModel: e), (r) {
      moveToNamed(CustomRouter.mapScreen);
      notifyListeners();
    });
  }
}