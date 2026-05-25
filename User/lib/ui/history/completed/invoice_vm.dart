import 'package:flutter/material.dart';
import 'package:user/ui/bottomsheets/add_tips/Add_Bottom_sheet.dart';

import '../../../main.dart';
import '../../../network/response_models/reqin_progress_model.dart';
import '../../../network/response_models/trip_model.dart';
import '../../../utils/app_constants.dart';
import '../../../utils/app_url.dart';
import '../../../utils/base_vm.dart';
import '../../../utils/utils.dart';
import '../../bottomsheets/rating/user_rating_bs.dart';

class InvoiceVm extends BaseVm {
  ReqInProgressModel? requestInProModel;
  Trip? trip;
  bool isDisposed = false;
  bool isHistoryInvoice = false, enableMoveToCashPayment = false;
  bool isProcessingPayment = false;
  int selectedTip = 0;

  @override
  void notifyListeners() {
    if (!isDisposed) {
      super.notifyListeners();
    }
  }

  void getReqInProgress() async {
    showLoader();
    final reModel = await apiHelper.get(AppUrls.reqInProgress);
    hideLoader();
    reModel.fold((e) => showErrorDialog(errorModel: e), (r) {
      final data = parseData(r.data, ReqInProgressModel.fromJson);
      print(
          "CheckArrivevehicleId ${data?.trip?.vehicleModelDetails?.vehicleId}");
      if (data != null && data.trip != null) {
        print(
            "CheckArrive vehicleId ${data.trip?.vehicleModelDetails?.vehicleId}");
        requestInProModel = data;
        trip = data.trip;
        if (trip?.paymentOpt?.toUpperCase() ==
                AppConstants.wallet.toUpperCase() &&
            !(trip?.isPaid == true)) {
          enableMoveToCashPayment = true;
          //Utils.showToast(msg: translation.txtWalletPaymentFailedDesc);
        }
        notifyListeners();
      }
    });
  }

  void showRatingDetails(tripModel) async {
    final response = await showModalBottomSheet<int>(
      context: navigatorKey.currentState!.context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      builder: (BuildContext context) {
        return FractionallySizedBox(
            heightFactor: 0.7,
            child: UserRatingBs(
              tripModel: tripModel,
            ));
      },
    );

    if (response != null) {
      print("Selected Rating: $response");
    }
  }

  void showPaymentDetails(tripModel) async {
    final response = await showModalBottomSheet<int>(
      context: navigatorKey.currentState!.context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      builder: (_) {
        return const AddTipBottomSheet();
      },
    );

    if (response != null) {
      print("Selected Rating: $response");
    }
  }

  Future<void> makePayment() async {
    if (isProcessingPayment) return; // Prevent multiple taps

    isProcessingPayment = true;
    notifyListeners();
    final map = {
      "amount": Utils.formatDecimalPointValue(
          trip?.billingDetails?.totalAmount ?? '', 2),
      "description": "Trip",
      "currency": trip?.requestedCurrencySymbol
    };
    // moveAndWait(CustomRouter.paymentScreen,args: map).then((onValue) {
    //   if (onValue != null && onValue["status"] == "success") {
    //     trip?.isPaid = true;
    //     print("jkegegtr${trip?.isPaid}");
    //     isProcessingPayment = false;
    //     paymentSuccess();
    //   }else {
    //     enableMoveToCashPayment = true;
    //     isProcessingPayment = false;
    //   }
    // });

    // isProcessingPayment = false;
    notifyListeners();
  }

  // void moveToCashTypePayment() async {
  //   showLoader();
  //   final response = await apiHelper.post(AppUrls.moveToCashPaymentType,
  //       params: {AppConstants.requestId: trip?.sId});
  //   response.fold((e) => showErrorDialog(errorModel: e), (r) {
  //     if (r.data != null) {
  //       final dataTrip = Trip.fromJson(r.data);
  //       trip?.paymentOpt = dataTrip.paymentOpt;
  //       trip?.isPaid = dataTrip.isPaid;
  //       notifyListeners();
  //     }
  //   });
  //   hideLoader();
  // }

  // void paymentSuccess() {
  //
  //   mqtt.publish(
  //       "${AppConstants.paymentStatus}${trip?.sId}",
  //       jsonEncode({
  //         AppConstants.requestId: trip?.sId ?? "",
  //         "status": "PAYMENT_SUCCESS"
  //       }));
  //
  // }

  @override
  void onPaymentLoading({data}) {
    showLoader();
  }
}
