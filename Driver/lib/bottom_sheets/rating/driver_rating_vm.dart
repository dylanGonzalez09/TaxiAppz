import 'dart:convert';

import 'package:flutter/cupertino.dart';
import 'package:taxiappzpro/utils/custom_router_config.dart';

import '../../base/base_vm.dart';
import '../../network/response_models/driver_feedback_model.dart';
import '../../network/response_models/trips_model.dart';
import '../../utils/app_urls.dart';
import '../../utils/preference_helper.dart';

class DriverRatingVm extends BaseVm {
  List<DriverFeedbackModel>? driverFeedbackList = [];
  List<bool> feedbackStatusList = [];
  int selectedRating = 0;

  TripModel? tripModel;

  Future<void> getDriverFeedbackList() async {
    final map = {
      "zoneId": preference.getString(PreferenceHelper.primaryZone)
    };
    final response = await apiHelper.post(AppUrls.driverFeedbackList,params: map);
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      if (r.data != null) {
        var jsonString = jsonDecode(json.encode(r.data));
        final data = List<DriverFeedbackModel>.from(
            jsonString.map((model) => DriverFeedbackModel.fromJson(model)));
        driverFeedbackList?.clear();
        driverFeedbackList?.addAll(data);
        feedbackStatusList =
            List<bool>.filled(driverFeedbackList?.length ?? 0, true);
        debugPrint('complaintList length: ${driverFeedbackList?.length ?? 0}');
      }
      notifyListeners();
    });
  }

  void submitDriverFeedback() async {
    showLoader();
    final feedbackList = driverFeedbackList?.asMap().entries.map((entry) {
      int index = entry.key;
      DriverFeedbackModel feedback = entry.value;
      return {
        'status': feedbackStatusList[index] ? true : false,
        'id': feedback.id,
        'question': feedback.question
      };
    }).toList();
    final map = {
      'requestId': tripModel?.sId.toString(),
      'rating': selectedRating,
      'feedback': feedbackList
    };
    print('derfefefref${map}');
    final response =
        await apiHelper.post(AppUrls.driverFeedbackSubmit, params: map);

    hideLoader();
    response.fold((e) => showErrorDialog(errorModel: e), (r) {
      moveToNamed(CustomRouterConfig.mapScreen);
      notifyListeners();
    });
  }
}
