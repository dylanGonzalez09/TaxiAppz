import 'dart:convert';
import 'package:flutter/cupertino.dart';
import 'package:taxiappzpro/network/response_models/driverHistory_model.dart';
import 'package:taxiappzpro/network/response_models/location_change_model.dart';

class TripModel {
  String? sId;
  String? requestNumber;
  int? requestOtp;
  bool? isLater;
  bool? ifDispatch;
  String? zoneTypeId;
  String? userId;
  String? driverId;
  String? tripStartTime;
  String? arrivedAt;
  String? acceptedAt;
  String? completedAt;
  String? cancelledAt, othersName, othersPhoneNumber;
  bool? isDriverStarted;
  bool? isDriverArrived;
  bool? isTripStart;
  bool? isCompleted;
  bool? isCancelled;
  String? customReason;
  String? cancellationReason;
  String? cancelMethod;
  dynamic totalDistance;
  double? driverCommission;
  int? totalTime;
  bool? isPaid;
  bool? userRated;
  bool? driverRated;
  String? timezone;
  int? attemptForSchedule;
  String? dispatcherId;
  String? driverNotes;
  String? createdBy;
  String? paymentOpt;
  String? rideType;
  String? requestedCurrencyCode;
  String? requestedCurrencySymbol;
  String? promoId;
  bool? locationApprove;
  int? availablesStatus, driverAverageRating, userAverageRating;
  String? tripType;
  String? rentalPackage;
  String? manualTrip;
  String? packageId;
  String? packageItemId;
  String? bookingFor;
  String? othersUserId;
  double? pickLat;
  double? pickLng;
  String? pickAddress, startKm;
  double? dropLat;
  double? dropLng;
  String? dropAddress, unit;
  BillingDetails? billingDetails;
  RatingDetails? ratingDetails;
  User? user;
  DriverDetails? driverDetails;
  VehicleDetails? vehicleDetails;
  VehicleModelDetails? vehicleModelDetails;
  bool isHistory = false;
  LocationChangeModel? locationChangeModel;
  List<PlacesDetails>? placesDetails;
  double? stopLat;
  double? stopLng;
  String? stopAddress;
  String? estimatedAmount;
  int? avgUserRating;
  String? zoneId;

  static String? _parseStringOrList(dynamic val) {
    if (val == null) return null;
    if (val is List) return val.isNotEmpty ? val[0]?.toString() : null;
    return val.toString();
  }

  static double? _parseDoubleOrList(dynamic val) {
    if (val == null) return null;
    if (val is List) {
      if (val.isEmpty) return null;
      final first = val[0];
      if (first is num) return first.toDouble();
      return double.tryParse(first.toString());
    }
    if (val is num) return val.toDouble();
    return double.tryParse(val.toString());
  }

  // ─────────────────────────────────────────────────────────────────────────

  TripModel({
    this.sId,
    this.requestNumber,
    this.requestOtp,
    this.isLater,
    this.ifDispatch,
    this.zoneTypeId,
    this.userId,
    this.driverId,
    this.tripStartTime,
    this.arrivedAt,
    this.acceptedAt,
    this.completedAt,
    this.cancelledAt,
    this.isDriverStarted,
    this.isDriverArrived,
    this.isTripStart,
    this.isCompleted,
    this.isCancelled,
    this.customReason,
    this.cancellationReason,
    this.cancelMethod,
    this.totalDistance,
    this.driverCommission,
    this.totalTime,
    this.isPaid,
    this.userRated,
    this.driverRated,
    this.timezone,
    this.attemptForSchedule,
    this.dispatcherId,
    this.driverNotes,
    this.createdBy,
    this.paymentOpt,
    this.rideType,
    this.requestedCurrencyCode,
    this.requestedCurrencySymbol,
    this.promoId,
    this.locationApprove,
    this.availablesStatus,
    this.tripType,
    this.rentalPackage,
    this.manualTrip,
    this.packageId,
    this.packageItemId,
    this.bookingFor,
    this.othersUserId,
    this.pickLat,
    this.pickLng,
    this.pickAddress,
    this.dropLat,
    this.dropLng,
    this.dropAddress,
    this.billingDetails,
    this.ratingDetails,
    this.user,
    this.isHistory = false,
    this.driverDetails,
    this.vehicleDetails,
    this.vehicleModelDetails,
    this.driverAverageRating,
    this.userAverageRating,
    this.placesDetails,
    this.startKm,
    this.unit,
    this.stopLat,
    this.stopLng,
    this.stopAddress,
    this.locationChangeModel,
    this.othersName,
    this.othersPhoneNumber,
    this.estimatedAmount,
    this.avgUserRating,
    this.zoneId,
  });

  TripModel.fromJson(Map<String, dynamic> json) {
    debugPrint("=== DEBUG: Starting TripModel parsing ===");

    try {
      sId = json['_id'];
      requestNumber = json['requestNumber'];
      requestOtp = json['requestOtp'];
      isLater = json['isLater'];
      ifDispatch = json['ifDispatch'];
      zoneTypeId = json['zoneTypeId'];
      userId = json['userId'];
      driverId = json['driverId'];
      tripStartTime = json['tripStartTime'];
      arrivedAt = json['arrivedAt'];
      acceptedAt = json['acceptedAt'];
      completedAt = json['completedAt'];
      cancelledAt = json['cancelledAt'];
      isDriverStarted = json['isDriverStarted'];
      isDriverArrived = json['isDriverArrived'];
      isTripStart = json['isTripStart'];
      isCompleted = json['isCompleted'];
      isCancelled = json['isCancelled'];
      customReason = json['customReason'];
      cancellationReason = json['cancellationReason'];
      cancelMethod = json['cancelMethod'];
      totalDistance = json['totalDistance'];

      driverCommission = json['driverCommission'] != null
          ? (json['driverCommission'] is int
          ? (json['driverCommission'] as int).toDouble()
          : (json['driverCommission'] as num).toDouble())
          : null;

      debugPrint(
          "DEBUG: totalTime value: ${json['totalTime']}, type: ${json['totalTime']?.runtimeType}");
      if (json['totalTime'] != null) {
        if (json['totalTime'] is int) {
          totalTime = json['totalTime'];
        } else if (json['totalTime'] is double) {
          totalTime = (json['totalTime'] as double).toInt();
        }
      }

      isPaid = json['isPaid'];
      userRated = json['userRated'];
      driverRated = json['driverRated'];
      timezone = json['timezone'];

      debugPrint(
          "DEBUG: attemptForSchedule value: ${json['attemptForSchedule']}, type: ${json['attemptForSchedule']?.runtimeType}");
      if (json['attemptForSchedule'] != null) {
        if (json['attemptForSchedule'] is int) {
          attemptForSchedule = json['attemptForSchedule'];
        } else if (json['attemptForSchedule'] is double) {
          attemptForSchedule = (json['attemptForSchedule'] as double).toInt();
        }
      }

      dispatcherId = json['dispatcherId'];
      driverNotes = json['driverNotes'];
      createdBy = json['createdBy'];
      paymentOpt = json['paymentOpt'];
      rideType = json['rideType'];
      requestedCurrencyCode = json['requestedCurrencyCode'];
      requestedCurrencySymbol = json['requestedCurrencySymbol'];
      promoId = json['promoId'];
      locationApprove = json['locationApprove'];

      debugPrint(
          "DEBUG: availablesStatus value: ${json['availablesStatus']}, type: ${json['availablesStatus']?.runtimeType}");
      if (json['availablesStatus'] != null) {
        if (json['availablesStatus'] is int) {
          availablesStatus = json['availablesStatus'];
        } else if (json['availablesStatus'] is double) {
          availablesStatus = (json['availablesStatus'] as double).toInt();
        }
      }

      tripType = json['tripType'];
      rentalPackage = json['rentalPackage'];
      manualTrip = json['manualTrip'];
      packageId = json['packageId'];
      packageItemId = json['packageItemId'];
      bookingFor = json['bookingFor'];
      othersUserId = json['othersUserId'];
      pickLat = _parseDoubleOrList(json['pickLat']);
      pickLng = _parseDoubleOrList(json['pickLng']);
      pickAddress = _parseStringOrList(json['pickAddress']);
      dropLat = _parseDoubleOrList(json['dropLat']);
      dropLng = _parseDoubleOrList(json['dropLng']);
      dropAddress = _parseStringOrList(json['dropAddress']);
      stopLat = _parseDoubleOrList(json['stopLat']);
      stopLng = _parseDoubleOrList(json['stopLng']);
      stopAddress = _parseStringOrList(json['stopAddress']);

      billingDetails = json['billingDetails'] != null
          ? BillingDetails.fromJson(json['billingDetails'])
          : null;

      ratingDetails = json['ratingDetails'] != null
          ? RatingDetails.fromJson(json['ratingDetails'])
          : null;

      user = json["userDetails"] != null
          ? User.fromJson(json["userDetails"])
          : json["user"] != null
          ? User.fromJson(json["user"])
          : null;

      driverDetails = json['driverDetails'] != null
          ? DriverDetails.fromJson(json['driverDetails'])
          : json['driver'] != null
          ? DriverDetails.fromJson(json['driver'])
          : null;

      vehicleDetails = json['vehicleDetails'] != null
          ? VehicleDetails.fromJson(json['vehicleDetails'])
          : null;

      vehicleModelDetails = json['vehicleModelDetails'] != null
          ? VehicleModelDetails.fromJson(json['vehicleModelDetails'])
          : null;

      debugPrint(
          "DEBUG: driverAverageRating value: ${json['driverAverageRating']}, type: ${json['driverAverageRating']?.runtimeType}");
      if (json['driverAverageRating'] != null) {
        if (json['driverAverageRating'] is int) {
          driverAverageRating = json['driverAverageRating'];
        } else if (json['driverAverageRating'] is double) {
          driverAverageRating =
              (json['driverAverageRating'] as double).toInt();
        }
      }

      debugPrint(
          "DEBUG: userAverageRating value: ${json['userAverageRating']}, type: ${json['userAverageRating']?.runtimeType}");
      if (json['userAverageRating'] != null) {
        if (json['userAverageRating'] is int) {
          userAverageRating = json['userAverageRating'];
        } else if (json['userAverageRating'] is double) {
          userAverageRating = (json['userAverageRating'] as double).toInt();
        }
      }

      if (json['placesDetails'] != null) {
        placesDetails = <PlacesDetails>[];
        json['placesDetails'].forEach((v) {
          placesDetails!.add(PlacesDetails.fromJson(v));
        });
      }

      unit = json['unit'];
      startKm = json['startKm'];

      if (json['locationChangeAddress'] != null) {
        final data = jsonDecode(json['locationChangeAddress']);
        if (data is Map<String, dynamic>) {
          locationChangeModel = LocationChangeModel.fromJson(data);
        }
      }

      othersName = json['othersName'];
      othersPhoneNumber = json['othersPhoneNumber'];
      estimatedAmount = json['estimatedAmount'];
      zoneId = json['zoneId'];

      debugPrint(
          "DEBUG: avgUserRating value: ${json['avgUserRating']}, type: ${json['avgUserRating']?.runtimeType}");
      if (json['avgUserRating'] != null) {
        if (json['avgUserRating'] is int) {
          avgUserRating = json['avgUserRating'];
        } else if (json['avgUserRating'] is double) {
          avgUserRating = (json['avgUserRating'] as double).toInt();
        }
      }

      debugPrint("=== DEBUG: TripModel parsing completed successfully ===");
    } catch (e, stackTrace) {
      debugPrint("=== DEBUG: Error in TripModel.fromJson ===");
      debugPrint("Error: $e");
      debugPrint("Stack trace: $stackTrace");
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = sId;
    data['requestNumber'] = requestNumber;
    data['requestOtp'] = requestOtp;
    data['isLater'] = isLater;
    data['ifDispatch'] = ifDispatch;
    data['zoneTypeId'] = zoneTypeId;
    data['userId'] = userId;
    data['driverId'] = driverId;
    data['tripStartTime'] = tripStartTime;
    data['arrivedAt'] = arrivedAt;
    data['acceptedAt'] = acceptedAt;
    data['completedAt'] = completedAt;
    data['cancelledAt'] = cancelledAt;
    data['isDriverStarted'] = isDriverStarted;
    data['isDriverArrived'] = isDriverArrived;
    data['isTripStart'] = isTripStart;
    data['isCompleted'] = isCompleted;
    data['isCancelled'] = isCancelled;
    data['customReason'] = customReason;
    data['cancellationReason'] = cancellationReason;
    data['cancelMethod'] = cancelMethod;
    data['totalDistance'] = totalDistance;
    data['driverCommission'] = driverCommission;
    data['totalTime'] = totalTime;
    data['isPaid'] = isPaid;
    data['userRated'] = userRated;
    data['driverRated'] = driverRated;
    data['timezone'] = timezone;
    data['attemptForSchedule'] = attemptForSchedule;
    data['dispatcherId'] = dispatcherId;
    data['driverNotes'] = driverNotes;
    data['createdBy'] = createdBy;
    data['paymentOpt'] = paymentOpt;
    data['rideType'] = rideType;
    data['requestedCurrencyCode'] = requestedCurrencyCode;
    data['requestedCurrencySymbol'] = requestedCurrencySymbol;
    data['promoId'] = promoId;
    data['locationApprove'] = locationApprove;
    data['availablesStatus'] = availablesStatus;
    data['tripType'] = tripType;
    data['rentalPackage'] = rentalPackage;
    data['manualTrip'] = manualTrip;
    data['packageId'] = packageId;
    data['packageItemId'] = packageItemId;
    data['bookingFor'] = bookingFor;
    data['othersUserId'] = othersUserId;
    data['pickLat'] = pickLat;
    data['pickLng'] = pickLng;
    data['pickAddress'] = pickAddress;
    data['dropLat'] = dropLat;
    data['dropLng'] = dropLng;
    data['dropAddress'] = dropAddress;
    data['stopLat'] = stopLat;
    data['stopLng'] = stopLng;
    data['stopAddress'] = stopAddress;
    if (billingDetails != null) {
      data['billingDetails'] = billingDetails!.toJson();
    }
    if (ratingDetails != null) {
      data['ratingDetails'] = ratingDetails!.toJson();
    }
    if (user != null) {
      data["userDetails"] = user?.toJson();
    }
    if (driverDetails != null) {
      data['driverDetails'] = driverDetails!.toJson();
    }
    if (vehicleDetails != null) {
      data['vehicleDetails'] = vehicleDetails!.toJson();
    }
    if (vehicleModelDetails != null) {
      data['vehicleModelDetails'] = vehicleModelDetails!.toJson();
    }
    if (placesDetails != null) {
      data['placesDetails'] = placesDetails!.map((v) => v.toJson()).toList();
    }
    data['unit'] = unit;
    if (startKm?.isNotEmpty == true) {
      data['startKm'] = startKm;
    }
    if (locationChangeModel != null) {
      data['locationChangeAddress'] = locationChangeModel?.toJson();
    }
    if (othersName?.isNotEmpty == true) {
      data['othersName'] = othersName;
    }
    if (othersPhoneNumber?.isNotEmpty == true) {
      data['othersPhoneNumber'] = othersPhoneNumber;
    }
    data['estimatedAmount'] = estimatedAmount;
    data['avgUserRating'] = avgUserRating;
    data['zoneId'] = zoneId;
    return data;
  }
}