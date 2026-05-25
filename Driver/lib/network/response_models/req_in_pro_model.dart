import 'package:taxiappzpro/network/response_models/trips_model.dart';
import 'package:taxiappzpro/network/response_models/user_model.dart';
import 'package:taxiappzpro/utils/utils.dart';

class RequestInProModel {
  User? user;
  String? sId;
  String? blockReason, isDisableReason, zoneId, subscriptionName, remainingDays;
  bool? onlineBy;
  bool? isDisable;
  bool? active, isDemoValid;
  Driver? driver;
  TripModel? trip;
  TodayStatus? todayStatus;
  String? currencySymbol, countryCode;
  List<String>? secondaryZone;
  bool? isCompanyVehicleUpdated, isDriverSubScriptionValid;
  String? carColor;
  String? driverBlockWalletBalance;
  bool? enableReferral;

  RequestInProModel(
      {this.user,
      this.sId,
      this.blockReason,
      this.onlineBy,
      this.active,
      this.isDisable,
      this.isDisableReason,
      this.driver,
      this.trip,
      this.todayStatus,
      this.currencySymbol,
      this.countryCode,
      this.isDemoValid,
      this.secondaryZone,
      this.isCompanyVehicleUpdated,
      this.isDriverSubScriptionValid,
      this.carColor,
      this.zoneId,
      this.driverBlockWalletBalance,
      this.subscriptionName,
        this.enableReferral,
      this.remainingDays});

  RequestInProModel.fromJson(Map<String, dynamic> json) {
    user = json['user'] != null ? User.fromJson(json['user']) : null;
    sId = json['_id'];
    blockReason = json['blockReason'];
    onlineBy = json['onlineBy'];
    isDisable = json['isDisable'];
    isDisableReason = json['isDisableReason'];
    enableReferral = json['enableReferral'];
    isCompanyVehicleUpdated = json['isCompanyVehicleUpdated'];
    isDriverSubScriptionValid = json['isDriverSubScriptionValid'];
    driverBlockWalletBalance =
        Utils.convertToStringData(json['driverBlockWalletBalance']);
    active = json['active'];
    carColor = json['carColor'];
    driver = json['driver'] != null ? Driver.fromJson(json['driver']) : null;
    trip = json['trip'] != null ? TripModel.fromJson(json['trip']) : null;
    if (json['todayStatus'] != null) {
      todayStatus = TodayStatus.fromJson(json['todayStatus']);
    }
    if (json['currencySymbol'] != null) {
      currencySymbol = json['currencySymbol'];
    }
    if (json['isDemoValid'] != null) {
      isDemoValid = json['isDemoValid'];
    }

    if (json['countryCode'] != null) {
      countryCode = json['countryCode'];
    }
    if (json['zoneId'] != null) {
      zoneId = json['zoneId'];
    }
    if (json['secondaryZone'] != null) {
      secondaryZone = List<String>.from(json['secondaryZone']);
    }
    if (json['subscriptionName'] != null) {
      subscriptionName = json['subscriptionName'];
    }
    if (json['remainingDays'] != null) {
      remainingDays = "${json['remainingDays']}";
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (user != null) {
      data['user'] = user!.toJson();
    }
    data['_id'] = sId;
    data['blockReason'] = blockReason;
    data['onlineBy'] = onlineBy;
    data['active'] = active;
    data['isDisable'] = isDisable;
    data['isDisableReason'] = isDisableReason;
    data['isDriverSubScriptionValid'] = isDriverSubScriptionValid;
    data['isCompanyVehicleUpdated'] = isCompanyVehicleUpdated;
    data['driverBlockWalletBalance'] = driverBlockWalletBalance;
    data['enableReferral'] = this.enableReferral;
    data['carColor'] = carColor;
    if (driver != null) {
      data['driver'] = driver!.toJson();
    }
    if (trip != null) {
      data['trip'] = trip!.toJson();
    }
    if (todayStatus != null) {
      data['todayStatus'] = todayStatus?.toJson();
    }
    if (currencySymbol?.isNotEmpty == true) {
      data['currencySymbol'] = currencySymbol;
    }
    if (countryCode?.isNotEmpty == true) {
      data['countryCode'] = countryCode;
    }
    if (isDemoValid != null) {
      data['isDemoValid'] = isDemoValid;
    }
    if (zoneId?.isNotEmpty == true) {
      data['zoneId'] = zoneId;
    }
    if (secondaryZone?.isNotEmpty == true) {
      data['secondaryZone'] = secondaryZone;
    }
    if (subscriptionName?.isNotEmpty == true) {
      data['subscriptionName'] = subscriptionName;
    }
    if (remainingDays?.isNotEmpty == true) {
      data['remainingDays'] = remainingDays;
    }
    return data;
  }
}

class TodayStatus {
  int? todayCompleted;
  int? todayCancelled;
  String? totalAmount;
  int? totalAssigned;
  String? driverId;

  TodayStatus(
      {this.todayCompleted,
      this.todayCancelled,
      this.totalAmount,
      this.totalAssigned,
      this.driverId});

  TodayStatus.fromJson(Map<String, dynamic> json) {
    todayCompleted = json['todayCompleted'];
    todayCancelled = json['todayCancelled'];
    totalAmount = Utils.convertToStringData(json['totalAmount']);
    totalAssigned = json['totalAssigned'];
    driverId = json['driverId'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['todayCompleted'] = todayCompleted;
    data['todayCancelled'] = todayCancelled;
    data['totalAmount'] = totalAmount;
    data['totalAssigned'] = totalAssigned;
    data['driverId'] = driverId;
    return data;
  }
}

class Driver {
  String? id;
  String? carNumber;
  List<String>? serviceType;
  String? vehicleId;
  int? totalVehicles;
  int? approvedVehicles;
  String? vehicleName;
  String? vehicleImage;
  int? capacity;
  int? activeVehicles;
  String? highlightImage;
  String? modelname;
  String? driverVehicleId;
  bool? isCompanyDriver;
  bool? isCompanyVehicleUpdated;
  String? companyPhoneNumber;
  bool? blockWallet;
  int? minimumWalletBalance;

  Driver(
      {this.id,
      this.carNumber,
      this.serviceType,
      this.vehicleId,
      this.vehicleName,
      this.totalVehicles,
      this.vehicleImage,
      this.capacity,
      this.activeVehicles,
      this.approvedVehicles,
      this.highlightImage,
      this.modelname,
      this.driverVehicleId,
      this.isCompanyVehicleUpdated,
      this.isCompanyDriver,
      this.blockWallet,
      this.minimumWalletBalance,
      this.companyPhoneNumber});

  Driver.fromJson(Map<String, dynamic> json) {
    id = json['id'];
    carNumber = json['carNumber'];
    serviceType = json['serviceType'].cast<String>();
    vehicleId = json['vehicleId'];
    vehicleName = json['vehicleName'];
    vehicleImage = json['vehicleImage'];
    approvedVehicles = json['approvedVehicles'];
    capacity = json['capacity'];
    activeVehicles = json['activeVehicles'];
    totalVehicles = json['totalVehicles'];
    highlightImage = json['highlightImage'];
    modelname = json['modelname'];
    driverVehicleId = json['driverVehicleId'];
    isCompanyDriver = json['isCompanyDriver'];
    isCompanyVehicleUpdated = json['isCompanyVehicleUpdated'];
    companyPhoneNumber = json['companyPhoneNumber'];
    blockWallet = json['blockWallet'];
    minimumWalletBalance = json['minimumWalletBalance'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['id'] = id;
    data['carNumber'] = carNumber;
    data['serviceType'] = serviceType;
    data['vehicleId'] = vehicleId;
    data['totalVehicles'] = totalVehicles;
    data['vehicleName'] = vehicleName;
    data['vehicleImage'] = vehicleImage;
    data['activeVehicles'] = activeVehicles;
    data['capacity'] = capacity;
    data['approvedVehicles'] = approvedVehicles;
    data['highlightImage'] = highlightImage;
    data['modelname'] = modelname;
    data['driverVehicleId'] = driverVehicleId;
    data['isCompanyDriver'] = isCompanyDriver;
    data['isCompanyVehicleUpdated'] = isCompanyVehicleUpdated;
    data['companyPhoneNumber'] = companyPhoneNumber;
    data['blockWallet'] = blockWallet;
    data['minimumWalletBalance'] = minimumWalletBalance;

    return data;
  }
}
