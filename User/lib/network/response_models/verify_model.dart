

import 'package:user/network/response_models/user_model.dart';

class VerifyModel {
  String? usertype;
  Tokens? tokens;
  UserModel? user;

  VerifyModel({this.usertype, this.tokens, this.user});

  VerifyModel.fromJson(Map<String, dynamic> json) {
    usertype = json['usertype'];
    tokens = json['tokens'] != null ? Tokens.fromJson(json['tokens']) : null;
    user =
        json['userData'] != null ? UserModel.fromJson(json['userData']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['usertype'] = usertype;
    if (tokens != null) {
      data['tokens'] = tokens!.toJson();
    }
    if (user != null) {
      data['userData'] = user!.toJson();
    }
    return data;
  }
}

class Tokens {
  Access? access;
  Access? refresh;
  String? userId;

  Tokens({this.access, this.refresh, this.userId});

  Tokens.fromJson(Map<String, dynamic> json) {
    access = json['access'] != null ? Access.fromJson(json['access']) : null;
    refresh = json['refresh'] != null ? Access.fromJson(json['refresh']) : null;
    userId = json['userId'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (access != null) {
      data['access'] = access!.toJson();
    }
    if (refresh != null) {
      data['refresh'] = refresh!.toJson();
    }
    data['userId'] = userId;
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
