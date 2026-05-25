import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:taxiappzpro/base/base_vm.dart';
import 'package:taxiappzpro/main.dart';
import 'package:taxiappzpro/models/enums.dart';
import 'package:taxiappzpro/utils/app_constants.dart';

import '../../network/response_models/config_model.dart';
import '../../network/response_models/driver_details_model.dart';
import '../../network/response_models/req_in_pro_model.dart';
import '../../utils/app_urls.dart';
import '../../utils/custom_router_config.dart';
import '../../utils/preference_helper.dart';
import '../dialogs/admin_contact_dialog.dart';

class DriverBlockedVm extends BaseVm {
  DriverBlockedReason blockReason = DriverBlockedReason.DOCUMENT_NOT_UPLOADED;
  String title = "";
  String description = "";
  String buttonTxt = "";
  String headOfficeNumber = "00000000";
  String adminNumber = "000000";
  RequestInProModel? requestInProModel;
  bool? isCompanyDriver;
  StreamSubscription? driverDetailsSubscription;

  void setArgs(String reason,RequestInProModel requestData) {
    requestInProModel = requestData;
    if (requestInProModel?.driver?.isCompanyDriver != null) {
      isCompanyDriver = requestInProModel?.driver?.isCompanyDriver;
    }else {
      isCompanyDriver = false;
    }
    blockReason = DriverBlockedReason.values.firstWhere(
      (e) => e.name == reason,
      orElse: () => DriverBlockedReason
          .DOCUMENT_NOT_UPLOADED, // Handle case where no match is found
    );
    print('blockReason:$blockReason');
    if (isCompanyDriver == false) {
      if (blockReason == DriverBlockedReason.DOCUMENT_NOT_UPLOADED) {
        title = translation.txt_document_not_uploaded_title;
        description = translation.txt_document_not_uploaded_description;
        buttonTxt = translation.txt_Upload_documents;
      } else if (blockReason == DriverBlockedReason.WAITINGFORAPPROVAL) {
        title = translation.txt_Waiting_for_approval;
        description = translation.txt_waiting_for_approval_desc;
        buttonTxt = translation.txt_Call_admin;
        setHeadOfficeNumber();
      } else if (blockReason == DriverBlockedReason.DENIED) {
        title = translation.txt_Document_denied_title;
        description = translation.txt_Document_denied_description;
        buttonTxt = translation.txt_Upload_documents;
        setHeadOfficeNumber();
      }else if (blockReason == DriverBlockedReason.AdminBlocked) {
        title = translation.txt_admin_blocked_title;
        description = translation.txt_admin_blocked_desc;
        buttonTxt = translation.txt_Call_admin;
        setHeadOfficeNumber();
      } else if (blockReason == DriverBlockedReason.EXPIRED) {
        title = translation.txt_Document_expired_title;
        description = translation.txt_Document_expired_description;
        buttonTxt = translation.txt_expired;
        setHeadOfficeNumber();
      }else if (blockReason == DriverBlockedReason.VEHICLE_DISABLED) {
        title = translation.txt_vehicle_type_disable_title;
        description = translation.txt_vehicle_type_disable_desc;
        buttonTxt = translation.txt_Call_admin;
        setHeadOfficeNumber();
      }else if (blockReason == DriverBlockedReason.ZONE_DISABLED) {
        title = translation.txt_zone_disable_title;
        description = translation.txt_zone_disable_desc;
        buttonTxt = translation.txt_Call_admin;
        setHeadOfficeNumber();
      }
    }else {
      title = translation.txt_Waiting_for_approval;
      description = translation.txt_waiting_for_approval_desc;
      buttonTxt = "";
    }
  }

  void listenForDetailsChanges() {
    driverDetailsSubscription?.cancel();
    driverDetailsSubscription = mqtt.messageController.stream.listen((data) {
      if (data[AppConstants.topic] == "${AppConstants.driverDetailsTopic}${mqtt.clientId}") {
        print("AppConstants.driverDetailsTopic ${AppConstants.driverDetailsTopic}");
        final jsonString = jsonDecode(data[AppConstants.response]);
        print("refre;f${jsonString}");
        final driverDetails = DriverDetailsModel.fromJson(jsonString);
        if (navigatorKey.currentState != null) {
          if (driverDetails.isDisableReason == DriverBlockedReason.ZONE_DISABLED.name) {
            title = translation.txt_zone_disable_title;
            description = translation.txt_zone_disable_desc;
            buttonTxt = translation.txt_Call_admin;
            notifyListeners();
          }else if (driverDetails.isDisableReason == DriverBlockedReason.VEHICLE_DISABLED.name) {
            title = translation.txt_vehicle_type_disable_title;
            description = translation.txt_vehicle_type_disable_desc;
            buttonTxt = translation.txt_Call_admin;
            notifyListeners();
          }else {}
        }
      }
    });
  }



  void setHeadOfficeNumber() {
    final data = preference.getString(PreferenceHelper.config);
    if (data != null && data.isNotEmpty == true) {
      final config = ConfigModel.fromJson(jsonDecode(data));
      if (config.settings != null) {
        outerLoop:
        for (var i in config.settings!) {
          if (i.name == SettingsEnum.general.name) {
            headOfficeNumber = i.settings?.headOfficeNumber ?? "00000000";
            adminNumber = i.settings?.adminNumber ?? "0000000";
            break outerLoop;
          }
        }
      }
    }
  }

  void handleButtonClick() {
    if (isCompanyDriver == false) {
      if (blockReason == DriverBlockedReason.DOCUMENT_NOT_UPLOADED ||
          blockReason == DriverBlockedReason.EXPIRED ||
          blockReason == DriverBlockedReason.DENIED) {
        moveToNamed(CustomRouterConfig.documentsScreen);
      } else if (blockReason == DriverBlockedReason.WAITINGFORAPPROVAL
          || blockReason == DriverBlockedReason.VEHICLE_DISABLED
          || blockReason == DriverBlockedReason.ZONE_DISABLED
          || blockReason == DriverBlockedReason.AdminBlocked) {
        if (navigatorKey.currentState != null) {
          showDialog(
              context: navigatorKey.currentState!.context,
              builder: (_) {
                return AdminContactDialog(
                    headOfficeNumber: headOfficeNumber,
                    adminNumber: adminNumber);
              });
        }
      }
    }else {
      if (navigatorKey.currentState != null) {
        showDialog(
            context: navigatorKey.currentState!.context,
            builder: (_) {
              return AdminContactDialog(
                  headOfficeNumber: headOfficeNumber,
                  adminNumber: requestInProModel?.driver?.companyPhoneNumber ?? "00000000000");
            });
      }
    }
  }

  Future<void> getRequestInProgress() async {
    final response = await apiHelper.get(AppUrls.reqInProgress);
    hideLoader();
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      final response = parseData(r.data, RequestInProModel.fromJson);
      if (response != null) {
        preference.setString(
            PreferenceHelper.primaryZone, response.zoneId ?? "");
        if (response.secondaryZone?.isNotEmpty == true) {
          preference.setString(PreferenceHelper.secondaryZone,
              jsonEncode(response.secondaryZone));
          FlutterForegroundTask.sendDataToTask(
              {AppConstants.secondaryZone: jsonEncode(response.secondaryZone)});
        }
        preference.setString(PreferenceHelper.driverId, response.sId ?? "");
        preference.setString(
            PreferenceHelper.driverUserId, response.user?.userId ?? "");
        preference.setString(PreferenceHelper.driverDetailsString,
            jsonEncode(response.driver?.toJson()));
        AppConstants.driverFirstName = response.user?.firstName ?? "";
        AppConstants.driverPhoneNumber =
            "${response.user?.countryCode ?? response.countryCode} ${response.user?.phoneNumber ?? ""}";
        if (response.user?.profilePic?.isNotEmpty == true) {
          AppConstants.driverProfilePicture =
              "${AppConstants.imageBaseUrl}${response.user?.profilePic}";
          AppConstants.appCurrencySymbol = response.currencySymbol ?? "";
        }
        if (response.active == false) {
          setArgs(response.blockReason ?? "",requestInProModel ?? RequestInProModel());
        }
      } else {
        showErrorDialog(message: AppConstants.someThingWentWrong);
      }
      notifyListeners();
    });
  }
}
