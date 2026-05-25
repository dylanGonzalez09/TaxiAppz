import 'dart:convert';
import 'package:flutter/cupertino.dart';
import 'package:taxiappzpro/base/base_vm.dart';
import 'package:taxiappzpro/network/response_models/complaint_model.dart';
import '../../../network/response_models/req_in_pro_model.dart';
import '../../../network/response_models/trips_model.dart';
import '../../../utils/app_constants.dart';
import '../../../utils/app_urls.dart';

class ComplaintVm extends BaseVm {
  TextEditingController complaintController = TextEditingController();
  List<ComplaintModel>? complaintList = [];
  ComplaintModel? selectedComplaint;
  bool isDispute = false;
  String requestId = "";
  RequestInProModel? requestInProModel;
  TripModel? tripData;
  String errorTxt = "";
  bool isAvailable = false;

  void setArgs(Map<String, dynamic> request) {
    requestInProModel = request["request"];
    tripData = request["trip"];
    debugPrint("zoneId: ${requestInProModel?.zoneId ?? tripData?.zoneId}");
  }

  Future<void> getComplaintList() async {
    showLoader();
    final map = {
      "type": "driver",
      "zoneId": requestInProModel?.zoneId ?? tripData?.zoneId,
    };
    final response =
        await apiHelper.post(AppUrls.getComplaintList, params: map);
    hideLoader();
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      if (r.data != null) {
        var jsonString = jsonDecode(json.encode(r.data));
        final data = List<ComplaintModel>.from(
            jsonString.map((model) => ComplaintModel.fromJson(model)));
        complaintList?.clear();
        complaintList?.addAll(data);
      }
      notifyListeners();
    });
  }

  Future<void> userSubmitComplaint() async {
    if (!isLoading.value) {
      showLoader();
      isLoading.value = true;
      try {
        var map = {
          AppConstants.title:
              selectedComplaint?.title ?? complaintController.text.trim(),
          AppConstants.description: complaintController.text.trim(),
        };
        if (requestId.isNotEmpty) {
          map[AppConstants.requestId] = requestId;
        }
        final response =
            await apiHelper.post(AppUrls.createTickets, params: map);
        response.fold(
          (error) {
            debugPrint("error: $error");
            showErrorDialog(errorModel: error);
          },
          (result) {
            getComplaintList();
            complaintController.clear();
            errorTxt = '';
            selectedComplaint = null;
            showSuccessDialog(
              message: translation.txt_complaint_submitted_successfully,
            );
          },
        );
      } catch (e) {
        debugPrint("Error: $e");
        showErrorDialog();
      } finally {
        isLoading.value = false;
        hideLoader();
      }
    }
  }

  String? complaintValidator(String? value) {
    if (value == null || value.trim().isEmpty) {
      return translation.txt_please_enter_your_complaint;
    }

    final text = value.trim().toLowerCase();

    if (!RegExp(r'^[a-z\s]+$').hasMatch(text)) {
      return translation.txt_please_avoid_meaningless_symbols;
    }

    final words = text.split(RegExp(r'\s+'));

    // Need at least 3 words
    if (words.length < 3) {
      return translation.txt_please_enter_meaningful_text;
    }

    // Optional: Cap at 100 words max
    if (words.length > 100) {
      return translation.txt_maximum_100_characters_allowed;
    }

    // Count junk words (same logic as before)
    int junkWords = 0;
    for (String word in words) {
      if (word.isEmpty) continue;
      if (word.length <= 2 ||
          !RegExp(r'[aeiou]').hasMatch(word) ||
          RegExp(r'(.)\1{2,}').hasMatch(word)) {
        junkWords++;
      }
    }
    if (junkWords > words.length ~/ 2) {
      return translation.txt_please_enter_meaningful_text;
    }
    return null;
  }
}
