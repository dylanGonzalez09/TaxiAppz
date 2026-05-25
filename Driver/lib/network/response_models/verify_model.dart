import 'package:taxiappzpro/network/response_models/user_model.dart';

class VerifyModel {
  String? usertype;
  Tokens? tokens;
  User? driver;

  VerifyModel({this.usertype, this.tokens});

  VerifyModel.fromJson(Map<String, dynamic> json) {
    usertype = json['usertype'];
    tokens = json['tokens'] != null ? Tokens.fromJson(json['tokens']) : null;
    driver = json['driver'] != null && json['driver'] is Map<String, dynamic>
        ? User.fromJson(json['driver'])
        : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['usertype'] = usertype;
    if (tokens != null) {
      data['tokens'] = tokens!.toJson();
    }
    return data;
  }
}

class Tokens {
  Access? access;
  Access? refresh;

  Tokens({this.access, this.refresh});

  Tokens.fromJson(Map<String, dynamic> json) {
    access = json['access'] != null ? Access.fromJson(json['access']) : null;
    refresh = json['refresh'] != null ? Access.fromJson(json['refresh']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (access != null) {
      data['access'] = access!.toJson();
    }
    if (refresh != null) {
      data['refresh'] = refresh!.toJson();
    }
    return data;
  }
}

class Access {
  String? token;
  String? expires;

  Access({this.token, this.expires});

  Access.fromJson(Map<String, dynamic> json) {
    token = json['token'];
    expires = json['expires'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['token'] = token;
    data['expires'] = expires;
    return data;
  }
}
