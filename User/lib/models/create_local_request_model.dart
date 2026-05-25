import '../models/enums.dart';

class CreateLocalRequestModel {
  double? pickLat;
  double? pickLng;
  String? pickAddress;
  double? dropLat;
  double? dropLng;
  String? dropAddress;
  String? bookingFor, riderName, riderPhoneNumber;
  String? paymentOpt;
  String? rideType;
  String? tripType;
  String? vehicleType;
  bool? isLater;
  String? tripTime;
  String? promoCode;
  List<Map<String, dynamic>>? stops;

  CreateLocalRequestModel(
      {this.pickLat,
      this.pickLng,
      this.pickAddress,
      this.dropLat,
      this.dropLng,
      this.dropAddress,
      this.bookingFor,
      this.paymentOpt,
      this.rideType,
      this.tripType,
      this.vehicleType,
      this.isLater,
      this.tripTime,
      this.promoCode,
      this.riderName,
      this.riderPhoneNumber,
      this.stops});

  CreateLocalRequestModel.fromJson(Map<String, dynamic> json) {
    pickLat = json['pick_lat'];
    pickLng = json['pick_lng'];
    pickAddress = json['pick_address'];
    dropLat = json['drop_lat'];
    dropLng = json['drop_lng'];
    dropAddress = json['drop_address'];
    bookingFor = json['booking_for'];
    paymentOpt = json['payment_opt'];
    rideType = json['ride_type'];
    tripType = json['trip_type'];
    vehicleType = json['vehicle_type'];
    isLater = json['isLater'];
    tripTime = json['tripTime'];
    promoCode = json['promo_code'];
    riderName = json['others_name'];
    riderPhoneNumber = json['others_number'];
    if (json['stops'] != null) {
      stops = List<Map<String, dynamic>>.from(json['stops']);
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = Map<String, dynamic>();
    data['pick_lat'] = pickLat;
    data['pick_lng'] = pickLng;
    data['pick_address'] = pickAddress;
    data['drop_lat'] = dropLat;
    data['drop_lng'] = dropLng;
    data['drop_address'] = dropAddress;
    data['booking_for'] = bookingFor;
    data['payment_opt'] = paymentOpt;
    data['ride_type'] = rideType;
    data['trip_type'] = tripType;
    data['vehicle_type'] = vehicleType;
    data['isLater'] = isLater;
    if (tripTime != null) {
      data['tripTime'] = tripTime;
    }
    if (promoCode?.isNotEmpty == true) {
      data['promo_code'] = promoCode;
    }
    if (stops != null && stops!.isNotEmpty) {
      data['stops'] = stops;
    }
    if (bookingFor?.toUpperCase() == BookingFor.OTHERS.name.toUpperCase()) {
      data['others_number'] = riderPhoneNumber;
      data['others_name'] = riderName;
    }
    return data;
  }
}
