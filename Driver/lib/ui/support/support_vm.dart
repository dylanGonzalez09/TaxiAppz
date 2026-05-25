import 'dart:convert';
import 'package:flutter/cupertino.dart';
import 'package:taxiappzpro/base/base_vm.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../models/enums.dart';
import '../../network/response_models/config_model.dart';
import '../../network/response_models/req_in_pro_model.dart';
import '../../utils/app_urls.dart';
import '../../utils/preference_helper.dart';

class SupportVm extends BaseVm {
  RequestInProModel? requestInProModel;
  String headOfficeNumber = "00000000";
  String adminNumber = "000000";


  void getReqInProgress() async {
    showLoader();
    final reModel = await apiHelper.get(AppUrls.reqInProgress);
    hideLoader();
    reModel.fold((e) => showErrorDialog(errorModel: e), (r) {
      final data = parseData(r.data, RequestInProModel.fromJson);
      if (data != null) {
        requestInProModel = data;
        debugPrint("CheckArrive vehicleId ${data.driver?.vehicleId}");
      }
    });
  }

  String? getAdminPhoneNumber() {
    setHeadOfficeNumber();
    return adminNumber.isNotEmpty ? adminNumber : null;
  }

  String? getHeadOfficeNumber() {
    setHeadOfficeNumber();
    return headOfficeNumber.isNotEmpty ? headOfficeNumber : null;
  }

  void setHeadOfficeNumber() {
    final data = preference.getString(PreferenceHelper.config);
    if (data != null && data.isNotEmpty) {
      final config = ConfigModel.fromJson(jsonDecode(data));
      if (config.settings != null) {
        for (var i in config.settings!) {
          if (i.name == SettingsEnum.general.name) {
            headOfficeNumber = i.settings?.headOfficeNumber ?? "";
            adminNumber = i.settings?.adminNumber ?? "";
            break;
          }
        }
      }
    }
  }

  void makePhoneCall(String phoneNumber) async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: phoneNumber,
    );
    await launchUrl(launchUri);
  }
}