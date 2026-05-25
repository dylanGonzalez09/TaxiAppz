import 'package:taxiappzpro/network/response_models/req_in_pro_model.dart';
import 'package:taxiappzpro/network/response_models/user_model.dart';

class DriverDetailsModel {
  User? user;
  String? sId;
  String? blockReason, isDisableReason;
  bool? onlineBy;
  bool? active, isDisable;
  String? documentStatus;
  Driver? driver;

  DriverDetailsModel(
      {this.user,
      this.sId,
      this.blockReason,
      this.isDisableReason,
      this.isDisable,
      this.onlineBy,
      this.active,
      this.documentStatus,
      this.driver});

  DriverDetailsModel.fromJson(Map<String, dynamic> json) {
    user = json['user'] != null ? User.fromJson(json['user']) : null;
    sId = json['_id'];
    blockReason = json['blockReason'];
    isDisableReason = json['isDisableReason'];
    isDisable = json['isDisable'];
    onlineBy = json['onlineBy'];
    active = json['active'];
    documentStatus = json['documentStatus'];
    driver = json['driver'] != null ? Driver.fromJson(json['driver']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (user != null) {
      data['user'] = user!.toJson();
    }
    data['_id'] = sId;
    data['blockReason'] = blockReason;
    data['isDisableReason'] = isDisableReason;
    data['isDisable'] = isDisable;
    data['onlineBy'] = onlineBy;
    data['active'] = active;
    data['documentStatus'] = documentStatus;
    if (driver != null) {
      data['driver'] = driver!.toJson();
    }
    return data;
  }
}
