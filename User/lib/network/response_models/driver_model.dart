class Driver {
  String? userId;
  String? carNumber;
  String? sId;
  String? firstName;
  String? carColor;
  String? lastName;
  String? email;
  String? phoneNumber;
  String? emergencyNumber;
  String? gender;
  String? language;
  String? country;
  String? address;
  String? profilePic;
  bool? active;

  Driver(
      {this.userId,
        this.carNumber,
        this.sId,
        this.firstName,
        this.carColor,
        this.lastName,
        this.email,
        this.phoneNumber,
        this.emergencyNumber,
        this.gender,
        this.language,
        this.country,
        this.address,
        this.profilePic,
        this.active});

  Driver.fromJson(Map<String, dynamic> json) {
    userId = json['userId'];
    carNumber = json['carNumber'];
    sId = json['_id'];
    firstName = json['firstName'];
    lastName = json['lastName'];
    carColor = json['carColor'];
    email = json['email'];
    phoneNumber = json['phoneNumber'];
    emergencyNumber = json['emergencyNumber'];
    gender = json['gender'];
    language = json['language'];
    country = json['country'];
    address = json['address'];
    profilePic = json['profilePic'];
    active = json['active'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['userId'] = userId;
    data['carNumber'] = carNumber;
    data['_id'] = sId;
    data['firstName'] = firstName;
    data['carColor'] = carColor;
    data['lastName'] = lastName;
    data['email'] = email;
    data['phoneNumber'] = phoneNumber;
    data['emergencyNumber'] = emergencyNumber;
    data['gender'] = gender;
    data['language'] = language;
    data['country'] = country;
    data['address'] = address;
    data['profilePic'] = profilePic;
    data['active'] = active;
    return data;
  }
}
