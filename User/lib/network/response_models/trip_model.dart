import 'dart:convert';

import 'driver_model.dart';
import 'history_list_model.dart';
import 'location_change_model.dart';

class Trip {
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
  String? cancelledAt;
  bool? isDriverStarted;
  bool? isDriverArrived;
  bool? isTripStart;
  bool? isCompleted;
  bool? isCancelled;
  String? customReason;
  String? cancellationReason;
  String? cancelMethod;
  double? totalDistance;
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
  int? availablesStatus;
  String? tripType, startKm;
  String? rentalPackage;
  String? manualTrip;
  String? packageId;
  String? packageItemId;
  String? bookingFor;
  String? othersUserId;
  double? pickLat;
  double? pickLng;
  String? pickAddress;
  double? dropLat;
  double? dropLng;
  String? dropAddress;
  double? stopLat;
  double? stopLng;
  String? stopAddress;

  // Billin? billingDetails;
  Driver? driver;

  BillingDetails? billingDetails;
  List<PlacesDetails>? placesDetails;
  UserDetails? userDetails;
  DriverDetails? driverDetails;
  VehicleDetails? vehicleDetails;
  VehicleModelDetails? vehicleModelDetails;
  String? adminDemoKey;
  String? unit, endKm, startKmImage, endKmImage;
  int? holdStatus;
  String? outstationId;
  String? outstationTypeId;
  String? clientId;
  RatingDetails? ratingDetails;
  bool isHistory = false;
  LocationChangeModel? locationChangeModel;

  double? _toDouble(dynamic value) {
    if (value == null) return null;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }
  Trip(
      {this.sId,
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
      // this.billingDetails,
      this.driver,
      this.billingDetails,
      this.placesDetails,
      this.userDetails,
      this.driverDetails,
      this.vehicleDetails,
      this.vehicleModelDetails,
      this.unit,
      this.holdStatus,
      this.outstationId,
      this.outstationTypeId,
      this.clientId,
      this.ratingDetails,
      this.startKm,
      this.endKm,
      this.startKmImage,
      this.endKmImage,
      this.stopLat,
      this.stopLng,
      this.stopAddress,
      this.locationChangeModel});

  Trip.fromJson(Map<String, dynamic> json) {
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
    totalDistance = (json['totalDistance'] is int)
        ? (json['totalDistance'] as int).toDouble()
        : json['totalDistance'] as double?;
    totalTime = json['totalTime'];
    isPaid = json['isPaid'];
    userRated = json['userRated'];
    driverRated = json['driverRated'];
    timezone = json['timezone'];
    attemptForSchedule = json['attemptForSchedule'];
    dispatcherId = json['dispatcherId'];
    driverNotes = json['driverNotes'];
    createdBy = json['createdBy'];
    paymentOpt = json['paymentOpt'];
    rideType = json['rideType'];
    requestedCurrencyCode = json['requestedCurrencyCode'];
    requestedCurrencySymbol = json['requestedCurrencySymbol'];
    promoId = json['promoId'];
    locationApprove = json['locationApprove'];
    availablesStatus = json['availablesStatus'];
    tripType = json['tripType'];
    rentalPackage = json['rentalPackage'];
    manualTrip = json['manualTrip'];
    packageId = json['packageId'];
    packageItemId = json['packageItemId'];
    bookingFor = json['bookingFor'];
    othersUserId = json['othersUserId'];
    pickLat = _toDouble(json['pickLat']);
    pickLng = _toDouble(json['pickLng']);
    if (json['pickAddress'] is String) {
      pickAddress = json['pickAddress'];
    }
    dropLat = _toDouble(json['dropLat']);
    dropLng = _toDouble(json['dropLng']);
    if (json['dropAddress'] is String) {
      dropAddress = json['dropAddress'];
    }
    // billingDetails = json['billingDetails'];
    driver = json['driver'] != null ? Driver.fromJson(json['driver']) : null;

    billingDetails = json['billingDetails'] != null
        ? BillingDetails.fromJson(json['billingDetails'])
        : null;
    userDetails = json['userDetails'] != null
        ? UserDetails.fromJson(json['userDetails'])
        : null;
    driverDetails = ((json['driverDetails'] ?? json['driver']) != null)
        ? DriverDetails.fromJson(json['driverDetails'] ?? json['driver'])
        : null;
    vehicleDetails = json['vehicleDetails'] != null
        ? VehicleDetails.fromJson(json['vehicleDetails'])
        : null;
    vehicleModelDetails = json['vehicleModelDetails'] != null
        ? VehicleModelDetails.fromJson(json['vehicleModelDetails'])
        : null;
    unit = json['unit'];
    holdStatus = json['holdStatus'];
    outstationId = json['outstationId'];
    outstationTypeId = json['outstationTypeId'];
    clientId = json['clientId'];
    ratingDetails = json['ratingDetails'] != null
        ? RatingDetails.fromJson(json['ratingDetails'.toString()])
        : null;
    if (json['placesDetails'] != null) {
      placesDetails = <PlacesDetails>[];
      json['placesDetails'].forEach((v) {
        placesDetails!.add(PlacesDetails.fromJson(v));
      });
      if (pickLat == null &&
          placesDetails?.isNotEmpty == true &&
          placesDetails?.first.pickLat != null) {
        pickLat = placesDetails?.first.pickLat;
      }
      if (pickLng == null &&
          placesDetails?.isNotEmpty == true &&
          placesDetails?.first.pickLng != null) {
        pickLng = placesDetails?.first.pickLng;
      }

      if ((pickAddress == null || pickAddress?.isEmpty == true) &&
          placesDetails?.isNotEmpty == true &&
          placesDetails?.first.pickAddress?.isNotEmpty == true) {
        pickAddress = placesDetails?.first.pickAddress;
      }

      if (dropLat == null &&
          placesDetails?.isNotEmpty == true &&
          placesDetails?.first.dropLat != null) {
        dropLat = placesDetails?.first.dropLat;
      }
      if (dropLng == null &&
          placesDetails?.isNotEmpty == true &&
          placesDetails?.first.dropLng != null) {
        dropLng = placesDetails?.first.dropLng;
      }
      if ((dropAddress == null || dropAddress?.isEmpty == true) &&
          placesDetails?.isNotEmpty == true &&
          placesDetails?.first.dropAddress?.isNotEmpty == true) {
        dropAddress = placesDetails?.first.dropAddress;
      }
    }
    if (json['startKm'] != null) {
      startKm = json['startKm'];
    }

    if (json['endKm'] != null) {
      endKm = json['endKm'];
    }
    if (json['startKmImage'] != null) {
      startKmImage = json['startKmImage'];
    }
    if (json['endKmImage'] != null) {
      endKmImage = json['endKmImage'];
    }
    stopLat = _toDouble(json['stopLat']);
    stopLng = _toDouble(json['stopLng']);
    if (json['stopAddress'] is String) {
      stopAddress = json['stopAddress'];
    }

    if (driver == null && driverDetails != null) {
      driver = Driver.fromJson(driverDetails!.toJson());
    }
    if (json['locationChangeAddress'] != null) {
      final data = jsonDecode(json['locationChangeAddress']);
      if (data is Map<String, dynamic>) {
        locationChangeModel = LocationChangeModel.fromJson(data);
      }
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
    // data['billingDetails'] = billingDetails;
    if (driver != null) {
      data['driver'] = driver!.toJson();
    }

    if (this.billingDetails != null) {
      data['billingDetails'] = this.billingDetails!.toJson();
    }
    if (this.userDetails != null) {
      data['userDetails'] = this.userDetails!.toJson();
    }
    if (this.driverDetails != null) {
      data['driverDetails'] = this.driverDetails!.toJson();
    }
    if (this.vehicleDetails != null) {
      data['vehicleDetails'] = this.vehicleDetails!.toJson();
    }
    if (this.vehicleModelDetails != null) {
      data['vehicleModelDetails'] = this.vehicleModelDetails!.toJson();
    }
    if (this.ratingDetails != null) {
      data['ratingDetails'] = this.ratingDetails!.toJson();
    }
    data['unit'] = this.unit;
    data['outstationId'] = this.outstationId;
    data['outstationTypeId'] = this.outstationTypeId;
    data['clientId'] = this.clientId;
    if (this.ratingDetails != null) {
      data['ratingDetails'] = this.ratingDetails!.toJson();
    }
    if (this.placesDetails != null) {
      data['placesDetails'] =
          this.placesDetails!.map((v) => v.toJson()).toList();
    }
    if (startKm?.isNotEmpty == true) {
      data['startKm'] = startKm;
    }
    if (endKm?.isNotEmpty == true) {
      data['endKm'] = endKm;
    }

    if (startKmImage?.isNotEmpty == true) {
      data['startKmImage'] = startKmImage;
    }

    if (endKmImage?.isNotEmpty == true) {
      data['endKmImage'] = endKmImage;
    }
    data['stopLat'] = stopLat;
    data['stopLng'] = stopLng;
    data['stopAddress'] = stopAddress;
    if (locationChangeModel != null) {
      data['locationChangeAddress'] = locationChangeModel?.toJson();
    }
    return data;
  }
}
