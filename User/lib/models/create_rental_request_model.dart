import 'enums.dart';

class CreateRentalRequestModel {
  double? pickLat;
  double? pickLng;
  String? pickAddress;
  String? bookingFor, riderName, riderPhoneNumber;
  String? paymentOpt;
  String? rideType;
  String? tripType;
  String? vehicleType;
  bool? isLater;
  String? tripTime;
  String? vehicle_type;
  String? packageId;
  String? promoCode;

  CreateRentalRequestModel(
      {this.pickLat,
      this.pickLng,
      this.pickAddress,
      this.bookingFor,
      this.paymentOpt,
      this.rideType,
      this.tripType,
      this.vehicleType,
      this.isLater,
      this.tripTime,
      this.vehicle_type,
      this.packageId,
      this.riderName,
      this.riderPhoneNumber,
      this.promoCode});

  CreateRentalRequestModel.fromJson(Map<String, dynamic> json) {
    pickLat = json['pick_lat'];
    pickLng = json['pick_lng'];
    pickAddress = json['pick_address'];
    bookingFor = json['booking_for'];
    paymentOpt = json['payment_opt'];
    rideType = json['ride_type'];
    tripType = json['trip_type'];
    vehicleType = json['vehicle_type'];
    isLater = json['isLater'];
    tripTime = json['tripTime'];
    vehicle_type = json['vehicle_type'];
    packageId = json['packageId'];
    promoCode = json['promo_code'];
    riderName = json['others_name'];
    riderPhoneNumber = json['others_number'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['pick_lat'] = pickLat;
    data['pick_lng'] = pickLng;
    data['pick_address'] = pickAddress;
    data['booking_for'] = bookingFor;
    data['payment_opt'] = paymentOpt;
    data['ride_type'] = rideType;
    data['trip_type'] = tripType;
    data['vehicle_type'] = vehicleType;
    data['isLater'] = isLater;
    if (tripTime != null) {
      data['tripTime'] = tripTime;
    }
    if (vehicle_type != null) {
      data['vehicle_type'] = vehicle_type;
    }
    if (vehicle_type != null) {
      data['vehicle_type'] = vehicle_type;
    }
    if (promoCode?.isNotEmpty == true) {
      data['promo_code'] = promoCode;
    }
    data['packageId'] = packageId;
    if (bookingFor?.toUpperCase() == BookingFor.OTHERS.name.toUpperCase()) {
      data['others_number'] = riderPhoneNumber;
      data['others_name'] = riderName;
    }
    return data;
  }
}
