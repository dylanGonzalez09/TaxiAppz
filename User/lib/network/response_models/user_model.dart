class UserModel {
  String? firstName;
  String? lastName;
  String? eMail;
  String? phoneNumber;
  List<String>? roleIds;
  String? country, countryCode;
  String? deviceInfoHash;
  String? deviceType;

  String? mobileApplicationType;

  String? referralCode;
  int? onlineBy;

  int? tripsCount;

  int? rating;

  bool? isEmailVerified;
  String? clientId;

  String? id;
  String? profileImage;
  String? adminPhoneNumber;
  String? headOfficeNumber;
  String? zoneId;
  String? regDate;
  String? regTime;

  UserModel(
      {this.firstName,
      this.lastName,
      this.phoneNumber,
      this.roleIds,
      this.country,
      this.deviceInfoHash,
      this.deviceType,
      this.mobileApplicationType,
      this.referralCode,
      this.onlineBy,
      this.tripsCount,
      this.rating,
      this.isEmailVerified,
      this.clientId,
      this.id,
      this.eMail,
      this.countryCode,
      this.profileImage,
      this.adminPhoneNumber,
      this.headOfficeNumber,
      this.regDate,
      this.regTime,
        this.zoneId});

  UserModel.fromJson(Map<String, dynamic> json) {
    firstName = json['firstName'];
    lastName = json['lastName'];
    phoneNumber = json['phoneNumber'];
    countryCode = json['countryCode'];
    country = json['country'];
    deviceInfoHash = json['deviceInfoHash'];
    deviceType = json['deviceType'];

    mobileApplicationType = json['mobileApplicationType'];

    referralCode = json['referralCode'];
    onlineBy = json['onlineBy'];

    tripsCount = json['tripsCount'];

    rating = json['rating'];

    isEmailVerified = json['isEmailVerified'];
    clientId = json['clientId'];

    id = json['id'];
    eMail = json['email'];
    profileImage = json['profilePic'];
    adminPhoneNumber = json['adminPhoneNumber'];
    headOfficeNumber = json['headofficeNumber'];
    zoneId = json["zoneId"];
    regDate = json["regDate"];
    regTime = json["regTime"];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};

    data['firstName'] = firstName;
    data['lastName'] = lastName;
    data['phoneNumber'] = phoneNumber;

    data['roleIds'] = roleIds;
    data['country'] = country;
    data['deviceInfoHash'] = deviceInfoHash;
    data['deviceType'] = deviceType;

    data['mobileApplicationType'] = mobileApplicationType;

    data['referralCode'] = referralCode;
    data['onlineBy'] = onlineBy;

    data['tripsCount'] = tripsCount;

    data['rating'] = rating;

    data['isEmailVerified'] = isEmailVerified;
    data['clientId'] = clientId;
    data['countryCode'] = countryCode;
    data['id'] = id;
    data['email'] = eMail;
    data['profilePic'] = profileImage;
    data['adminPhoneNumber'] = adminPhoneNumber;
    data['headofficeNumber'] = headOfficeNumber;
    data["zoneId"] = zoneId;
    data["regDate"] = regDate;
    data["regTime"] = regTime;
    return data;
  }
}
