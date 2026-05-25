import '../../utils/utils.dart';

class TypesModel {
  String? zoneName;
  String? countryName, unit;
  String? currencySymbol;
  List<String>? paymentTypes;
  String? countryId;
  List<ZoneTypePrice>? zoneTypePrice;

  TypesModel(
      {this.zoneName,
      this.countryName,
      this.currencySymbol,
      this.paymentTypes,
      this.countryId,
      this.zoneTypePrice,
      this.unit});

  TypesModel.fromJson(Map<String, dynamic> json) {
    zoneName = json['zone_name'];
    countryName = json['country_name'];
    unit = json['unit'];
    currencySymbol = json['currency_symbol'];
    paymentTypes = json['payment_types'].cast<String>();
    countryId = json['country_id'];
    if (json['zoneTypePrice'] != null) {
      zoneTypePrice = <ZoneTypePrice>[];
      json['zoneTypePrice'].forEach((v) {
        zoneTypePrice!.add(ZoneTypePrice.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['zone_name'] = zoneName;
    data['country_name'] = countryName;
    data['currency_symbol'] = currencySymbol;
    data['payment_types'] = paymentTypes;
    data['country_id'] = countryId;
    data['unit'] = unit;
    if (zoneTypePrice != null) {
      data['zoneTypePrice'] = zoneTypePrice!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class ZoneTypePrice {
  String? typeName;
  String? typeId, unit, currencySymbol;
  int? capacity;
  String? category;
  String? typeImage;
  String? typeImageSelect;
  double? totalAmount;
  double? distance;
  double? bookingFees;
  double? outOfZonePrice;
  bool isSelected = false;
  int? estimatedTime = -1;
  double? basePrice;
  double? waitingCharge;
  double? promoAmount;
  double? ratePerKm;
  double? pricePerDistanceUnit,
      pricePerDistanceCost,
      basePricePerDistance,
      baseDistance;
  List<String?>? note;

  ZoneTypePrice(
      {this.typeName,
      this.typeId,
      this.capacity,
      this.category,
      this.typeImage,
      this.typeImageSelect,
      this.totalAmount,
      this.distance,
      this.bookingFees,
      this.outOfZonePrice,
      this.basePrice,
      this.waitingCharge,
      this.promoAmount,
      this.ratePerKm,
      this.unit,
      this.currencySymbol,
      this.baseDistance,
      this.pricePerDistanceUnit,
      this.basePricePerDistance,
      pricePerDistanceCost,
      this.note});

  ZoneTypePrice.fromJson(Map<String, dynamic> json) {
    typeName = json['type_name'];
    typeId = json['type_id'];
    capacity = json['capacity'];
    category = json['category'];
    typeImage = json['type_image'];
    typeImageSelect = json['type_image_select'];
    totalAmount = json['total_amount']?.toDouble();
    distance = json['distance']?.toDouble();
    bookingFees = json['booking_fees']?.toDouble();
    outOfZonePrice = Utils.convertToDouble(json['out_of_zone_price']);
    basePrice = Utils.convertToDouble(json['base_price']);
    waitingCharge = Utils.convertToDouble(json['waiting_charge']);
    promoAmount = json['promoAmount']?.toDouble();
    ratePerKm = Utils.convertToDouble(json['price_per_distance']);
    unit = json['unit'];
    currencySymbol = json['currency_symbol'];
    baseDistance = Utils.convertToDouble(json['base_distance']);
    basePricePerDistance = Utils.convertToDouble(json['price_per_distance']);

    if (json['note'] != null) {
      note = <String>[];
      json['note'].forEach((v) {
        note!.add(v);
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['type_name'] = typeName;
    data['type_id'] = typeId;
    data['capacity'] = capacity;
    data['category'] = category;
    data['type_image'] = typeImage;
    data['type_image_select'] = typeImageSelect;
    data['total_amount'] = totalAmount;
    data['distance'] = distance;
    data['booking_fees'] = bookingFees;
    data['out_of_zone_price'] = outOfZonePrice;
    data['base_price'] = basePrice;
    data['waiting_charge'] = waitingCharge;
    data['promoAmount'] = promoAmount;
    data['price_per_distance'] = ratePerKm;
    data['unit'] = unit;
    data['currency_symbol'] = currencySymbol;
    data['base_distance'] = baseDistance;
    data['price_per_distance'] = basePricePerDistance;
    data['note'] = note;
    return data;
  }
}
