class CountryModel {
  String? name;
  String? dialCode;
  String? code;
  String? currencyCode;
  String? currencySymbol;
  bool? status;
  String? capital;
  String? citizenship;
  String? countryCode;
  String? currency;
  String? currencySubUnit;
  String? fullName;
  String? iso31663;
  String? regionCode;
  String? subRegionCode;
  String? eea;
  String? currencyDecimals;
  String? flag;
  String? flagBase64;
  String? timeZone;
  String? gmtOffset;
  String? clientId;
  String? id;
  String? phoneNumberLength;

  CountryModel(
      {this.name,
        this.dialCode,
        this.code,
        this.currencyCode,
        this.currencySymbol,
        this.status,
        this.capital,
        this.citizenship,
        this.countryCode,
        this.currency,
        this.currencySubUnit,
        this.fullName,
        this.iso31663,
        this.regionCode,
        this.subRegionCode,
        this.eea,
        this.currencyDecimals,
        this.flag,
        this.flagBase64,
        this.timeZone,
        this.gmtOffset,
        this.clientId,
        this.id,
      this.phoneNumberLength});

  CountryModel.fromJson(Map<String, dynamic> json) {
    name = json['name'];
    dialCode = json['dial_code'];
    code = json['code'];
    currencyCode = json['currency_code'];
    currencySymbol = json['currency_symbol'];
    status = json['status'];
    capital = json['capital'];
    citizenship = json['citizenship'];
    countryCode = json['country_code'];
    currency = json['currency'];
    currencySubUnit = json['currency_sub_unit'];
    fullName = json['full_name'];
    iso31663 = json['iso_3166_3'];
    regionCode = json['region_code'];
    subRegionCode = json['sub_region_code'];
    eea = json['eea'];
    currencyDecimals = json['currency_decimals'];
    flag = json['flag'];
    flagBase64 = json['flag_base_64'];
    timeZone = json['time_zone'];
    gmtOffset = json['gmt_offset'];
    clientId = json['clientId'];
    id = json['id'];
    phoneNumberLength = json['phoneLength'].toString();
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['name'] = name;
    data['dial_code'] = dialCode;
    data['code'] = code;
    data['currency_code'] = currencyCode;
    data['currency_symbol'] = currencySymbol;
    data['status'] = status;
    data['capital'] = capital;
    data['citizenship'] = citizenship;
    data['country_code'] = countryCode;
    data['currency'] = currency;
    data['currency_sub_unit'] = currencySubUnit;
    data['full_name'] = fullName;
    data['iso_3166_3'] = iso31663;
    data['region_code'] = regionCode;
    data['sub_region_code'] = subRegionCode;
    data['eea'] = eea;
    data['currency_decimals'] = currencyDecimals;
    data['flag'] = flag;
    data['flag_base_64'] = flagBase64;
    data['time_zone'] = timeZone;
    data['gmt_offset'] = gmtOffset;
    data['clientId'] = clientId;
    data['id'] = id;
    data['phoneLength'] = phoneNumberLength;
    return data;
  }
}