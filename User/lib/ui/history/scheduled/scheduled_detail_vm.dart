import 'dart:convert';

import 'package:flutter/material.dart';
import '../../../main.dart';
import '../../../network/response_models/cancelReason_model.dart';
import '../../../network/response_models/trip_model.dart';
import '../../../utils/app_constants.dart';
import '../../../utils/app_url.dart';
import '../../../utils/base_vm.dart';
import '../../../utils/custom_router.dart';
import '../../../utils/dimensions.dart';
import '../../about/aboutUs_screen.dart';
import '../../bottomsheets/confirmation_bs/confirmation_bs.dart';
import '../../tripscreen/tripcancelbottomsheet/trip_cancel_bottom_sheet.dart';
import '../../tripscreen/tripcancelbottomsheet/trip_cancel_scheduled_bottom_sheet.dart';

class ScheduledDetailVm extends BaseVm{

   Trip? tripsData;
  bool isAssigned = false;
  List<CancelReasonModel>? cancelReasonList = [];

  void showConfirmation() async {
    if (navigatorKey.currentState != null) {
      final response = await showModalBottomSheet(
          context: navigatorKey.currentState!.context,
          backgroundColor: Colors.white,
          isDismissible: true,
          isScrollControlled: true,
          enableDrag: false,
          shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(20), topRight: Radius.circular(20))),
          builder: (_) {
            return ConfirmationBs(title: vm.translation.txt_cancel_ride,
              subTitle: vm.translation.txt_cancel_ride_desc,
              primaryBtnTitle: vm.translation.txt_yes,
              secondaryBtnTitle: vm.translation.txt_no,);
          });
    }
  }
void setArgs(Trip trips) {
  tripsData = trips;
  print("jerfepfefe${tripsData?.toJson()}");
  notifyListeners();
}
  void changeButtonView(){
    isAssigned = true;
    notifyListeners();
  }

  void showTripCancelRequestList() async {
    if (navigatorKey.currentState != null) {
      final reason = await showModalBottomSheet(
          context: navigatorKey.currentState!.context,
          backgroundColor: Colors.white,
          isDismissible: true,
          isScrollControlled: true,
          enableDrag: true,
          shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(Dimensions.padding_20),
                  topRight: Radius.circular(Dimensions.padding_20))),
          builder: (context) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
              ),
              child: TripCancelScheduledBottomSheet(vm: this),
            );
          });
      if (reason is CancelReasonModel) {
        onTripCancel(reason);
      }
    }
  }

  Future<void> getCancelReasonList() async {
    final response = await apiHelper.get(AppUrls.cancellationReason);
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      if (r.data != null) {
        var jsonString = jsonDecode(json.encode(r.data));
        cancelReasonList = List<CancelReasonModel>.from(
            jsonString.map((model) => CancelReasonModel.fromJson(model)));
        notifyListeners();
      }
    });
  }

  void onTripCancel(CancelReasonModel model) async {
    showLoader();
    final map = {
      AppConstants.requestId: tripsData?.sId,
      AppConstants.latitude: getSavedCurrentLocation().latitude,
      AppConstants.longitude: getSavedCurrentLocation().longitude,
      AppConstants.reasonId: model.id,
      AppConstants.role: "User"
    };
    final response = await apiHelper.post(AppUrls.tripCancel, params: map);
    hideLoader();
    response.fold((e) => showErrorDialog(errorModel: e), (r) {
      moveToNamed(CustomRouter.mapScreen);
      notifyListeners();
    });
  }

}