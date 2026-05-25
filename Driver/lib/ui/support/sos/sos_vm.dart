import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:taxiappzpro/base/base_vm.dart';
import 'package:taxiappzpro/bottom_sheets/add_sos_bs/add_sos_bs.dart';

import '../../../bottom_sheets/confirmation_bs/confirmation_bs.dart';
import '../../../main.dart';
import '../../../network/response_models/sos_model.dart';
import '../../../utils/app_constants.dart';
import '../../../utils/app_urls.dart';

class SosVm extends BaseVm {
  List<SOSModel>? sosList = [];

  void showAddSOS() async {
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
          builder: (context) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
              ),
              child: const AddSosBs(),
            );
          });
      if (response != null) {
        debugPrint('add sos data: $response');
        await addSOSContact(response);
      }
    }
  }

  void showConfirmation(id) async {
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
            return ConfirmationBs(
              title: translation.txt_delete_sos,
              subTitle:
                  translation.txt_are_you_sure_want_to_delete_this_contact,
              primaryBtnTitle: translation.txt_yes,
              secondaryBtnTitle: translation.txt_no,
            );
          });
      if (response == true) {
        deleteSOSContact(id);
      }
    }
  }

  Future<void> getSOSList() async {
    showLoader();
    final response = await apiHelper.get(AppUrls.getSosList);
    hideLoader();
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      if (r.data != null) {
        var jsonString = jsonDecode(json.encode(r.data));
        final data = List<SOSModel>.from(
            jsonString.map((model) => SOSModel.fromJson(model)));
        sosList?.clear();
        sosList?.addAll(data);
        final Map<String, SOSModel> uniqueMap = {};
        for (var item in data) {
          final name = (item.title ?? '').trim().toLowerCase();
          final phone = (item.phoneNumber ?? '').replaceAll(RegExp(r'\D'), '');
          uniqueMap["$name-$phone"] = item;
        }
        sosList = uniqueMap.values.take(8).toList(); // max 8
      }
      notifyListeners();
    });
  }

  Future<void> addSOSContact(Map<String, dynamic> data) async {
    if (isLoading.value) return;
    isLoading.value = true;
    // Take values from the input data
    final countryCode = (data[AppConstants.countryCode] ?? '').trim();
    final name = (data[AppConstants.title] ?? '').trim();
    final phone = (data[AppConstants.phoneNumber] ?? '').trim();
    final status = data["status"] ?? 1;
    final map = {
      "countryCode": countryCode,
      "title": name,
      "phoneNumber": phone,
      "status": status,
    };
    // Normalize helper functions
    String normalizePhone(String phone) => phone.replaceAll(RegExp(r'\D'), '');
    String normalizeName(String name) => name.trim().toLowerCase();
    String normalizeCountry(String code) => code.trim();
    // Duplicate check using countryCode + name + phone
    final isDuplicate = sosList?.any((e) {
          final existingName = normalizeName(e.title ?? '');
          final existingPhone = normalizePhone(e.phoneNumber ?? '');
          final existingCountry = normalizeCountry(e.dialCode ?? '');
          return existingName == normalizeName(name) &&
              existingPhone == normalizePhone(phone) &&
              existingCountry == normalizeCountry(countryCode);
        }) ??
        false;
    if (isDuplicate) {
      isLoading.value = false;
      showErrorDialog(
          message: translation.txt_Contact_with_this_name_phone_and_country_already_exists);
      return;
    }
    if ((sosList?.length ?? 0) >= 8) {
      final successMessage = translation.txt_maximum_emergency_contacts_limit_reached;
      showErrorDialog(message: successMessage);
      return;
    }
    // API call to save
    final response = await apiHelper.post(AppUrls.sosAdd, params: map);
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      if (r.data != null) {
        getSOSList(); // refresh the list after adding
        final successMessage = r.data['msg'] ?? translation.txt_contact_added_successfully;
        showErrorDialog(message: successMessage);
      } else {
        showErrorDialog();
      }
    });

    isLoading.value = false;
  }

  Future<void> deleteSOSContact(id) async {
    if (!isLoading.value) {
      isLoading.value = true;
      final response = await apiHelper.delete("${AppUrls.sosDelete}/$id");
      print('response object$response');
      response.fold((e) {
        showErrorDialog(errorModel: e);
      }, (r) {
        if (r.data != null) {
          getSOSList();
          final successMessage = r.data['msg'] ?? "Operation Successful";
          showErrorDialog(message: successMessage);
        } else {
          showErrorDialog();
        }
      });
      isLoading.value = false;
    }
  }
}
