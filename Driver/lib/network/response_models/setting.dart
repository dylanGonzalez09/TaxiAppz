class Setting {
  // Known fields (optional: only if you still need direct access)
  String? notificationSound;
  String? tripSound;
  String? logo;
  String? defaultLanguage;
  String? primaryColor;
  String? secondaryColor;
  String? distanceApiKey;
  String? s3BucketSecretAccessKey;
  String? iosPlacesApiKey;
  String? directionalApiKey;
  String? firebaseDatabaseUrl;
  String? iosDirectionalApiKey;
  String? placesApiKey;
  String? s3BucketDefaultRegion;
  String? s3BucketName;
  String? geoCoderApiKey;
  String? s3BucketKeyId;
  String? iosGeoCoderApiKey;
  String? iosDistanceApiKey;
  String? referralStatus;
  String? walletBasedTripStatus;
  String? introScreenStatus;
  String? ratingStatus;
  String? walletsStatus;
  String? isSecondaryZoneRegister;
  String? defaultCountry;
  String? serviceType;
  String? isCompanyRegistration;
  String? headOfficeNumber;
  String? adminNumber;
  String? subScription;

  /// This map stores all extra/dynamic fields, such as termsCondition_{langId}, privacyPolicy_{langId}
  Map<String, dynamic> extra = {};

  Setting();

  Setting.fromJson(Map<String, dynamic> json) {
    notificationSound = json['notificationSound'];
    tripSound = json['tripSound'];
    logo = json['logo'];
    defaultLanguage = json['defaultLanguage'];
    primaryColor = json['primaryColor'];
    secondaryColor = json['secondaryColor'];
    distanceApiKey = json['distanceApiKey'];
    s3BucketSecretAccessKey = json['s3BucketSecretAccessKey'];
    iosPlacesApiKey = json['iosPlacesApiKey'];
    directionalApiKey = json['directionalApiKey'];
    firebaseDatabaseUrl = json['firebaseDatabaseUrl'];
    iosDirectionalApiKey = json['iosDirectionalApiKey'];
    placesApiKey = json['placesApiKey'];
    s3BucketDefaultRegion = json['s3BucketDefaultRegion'];
    s3BucketName = json['s3BucketName'];
    geoCoderApiKey = json['geoCoderApiKey'];
    s3BucketKeyId = json['s3BucketKeyId'];
    iosGeoCoderApiKey = json['iosGeoCoderApiKey'];
    iosDistanceApiKey = json['iosDistanceApiKey'];
    referralStatus = json['referralStatus'];
    walletBasedTripStatus = json['walletBasedTripStatus'];
    introScreenStatus = json['introScreenStatus'];
    ratingStatus = json['ratingStatus'];
    walletsStatus = json['walletsStatus'];
    isSecondaryZoneRegister = json['secondaryZone'];
    defaultCountry = json['defaultCountry'];
    serviceType = json['serviceType'];
    isCompanyRegistration = json['companyRegister'];
    headOfficeNumber = json['headOfficeNumber'];
    adminNumber = json['adminNumber'];
    subScription = json['subScription'];

    // Store all unknown keys into extra
    for (final entry in json.entries) {
      // skip known fields
      if (!_knownKeys.contains(entry.key)) {
        extra[entry.key] = entry.value;
      }
    }
  }

  Map<String, dynamic> toJson() {
    final data = <String, dynamic>{};
    data['notificationSound'] = notificationSound;
    data['tripSound'] = tripSound;
    data['logo'] = logo;
    data['defaultLanguage'] = defaultLanguage;
    data['primaryColor'] = primaryColor;
    data['secondaryColor'] = secondaryColor;
    data['distanceApiKey'] = distanceApiKey;
    data['s3BucketSecretAccessKey'] = s3BucketSecretAccessKey;
    data['iosPlacesApiKey'] = iosPlacesApiKey;
    data['directionalApiKey'] = directionalApiKey;
    data['firebaseDatabaseUrl'] = firebaseDatabaseUrl;
    data['iosDirectionalApiKey'] = iosDirectionalApiKey;
    data['placesApiKey'] = placesApiKey;
    data['s3BucketDefaultRegion'] = s3BucketDefaultRegion;
    data['s3BucketName'] = s3BucketName;
    data['geoCoderApiKey'] = geoCoderApiKey;
    data['s3BucketKeyId'] = s3BucketKeyId;
    data['iosGeoCoderApiKey'] = iosGeoCoderApiKey;
    data['iosDistanceApiKey'] = iosDistanceApiKey;
    data['referralStatus'] = referralStatus;
    data['walletBasedTripStatus'] = walletBasedTripStatus;
    data['introScreenStatus'] = introScreenStatus;
    data['ratingStatus'] = ratingStatus;
    data['walletsStatus'] = walletsStatus;
    data['secondaryZone'] = isSecondaryZoneRegister;
    data['defaultCountry'] = defaultCountry;
    data['serviceType'] = serviceType;
    data['companyRegister'] = isCompanyRegistration;
    data['headOfficeNumber'] = headOfficeNumber;
    data['adminNumber'] = adminNumber;
    data['subScription'] = subScription;

    // Add dynamic fields
    data.addAll(extra);
    return data;
  }


  String? termsConditionByLang(String languageId) =>
      extra['termsCondition_$languageId'] as String?;

  String? privacyPolicyByLang(String languageId) =>
      extra['privacyPolicy_$languageId'] as String?;

  static const Set<String> _knownKeys = {
    'notificationSound',
    'tripSound',
    'logo',
    'defaultLanguage',
    'primaryColor',
    'secondaryColor',
    'distanceApiKey',
    's3BucketSecretAccessKey',
    'iosPlacesApiKey',
    'directionalApiKey',
    'firebaseDatabaseUrl',
    'iosDirectionalApiKey',
    'placesApiKey',
    's3BucketDefaultRegion',
    's3BucketName',
    'geoCoderApiKey',
    's3BucketKeyId',
    'iosGeoCoderApiKey',
    'iosDistanceApiKey',
    'referralStatus',
    'walletBasedTripStatus',
    'introScreenStatus',
    'ratingStatus',
    'walletsStatus',
    'secondaryZone',
    'defaultCountry',
    'serviceType',
    'companyRegister',
    'headOfficeNumber',
    'adminNumber',
    'subScription',
  };
}