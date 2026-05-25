import 'package:user/network/response_models/rental_package_model.dart';
import 'package:user/network/response_models/trip_model.dart';
import 'package:user/network/response_models/user_model.dart';

class ReqInProgressModel {
  String? sId, countryCode;
  UserModel? user;
  Trip? trip;
  bool? isDemoValid;
  double? walletBalance;
  bool? enableReferral;
  ReqInProgressModel(
      {this.sId, this.user, this.trip, this.isDemoValid, this.countryCode,this.walletBalance,this.enableReferral});

  ReqInProgressModel.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    user = json['user'] != null ? UserModel.fromJson(json['user']) : null;
    trip = json['trip'] != null ? Trip.fromJson(json['trip']) : null;
    isDemoValid = json['isDemoValid'];
    countryCode = json['countryCode'];
    enableReferral = json['enableReferral'];
    walletBalance = json['walletBalance'] != null
        ? convertToDouble(json['walletBalance'])
        : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = sId;
    if (user != null) {
      data['user'] = user!.toJson();
    }
    if (trip != null) {
      data['trip'] = trip!.toJson();
    }
    if (isDemoValid != null) {
      data['isDemoValid'] = isDemoValid;
    }
    data['countryCode'] = countryCode;
    if (walletBalance != null) {
      data["walletBalance"] = walletBalance;
    }
    data['enableReferral'] = this.enableReferral;

    return data;
  }
}
