class BaseResponse {
  bool? success;
  dynamic data;
  String? message;
  int? statusCode;
  String? tokenType;
  String? accessToken;
  int? expiresIn;

  BaseResponse({this.success, this.data, this.message, this.statusCode});
  BaseResponse.fromJson(Map<String, dynamic> json) {
    success = json['success'];
    data = json['data'];
    if (json['message'] is String) {
      message = json['message'];
    }
    tokenType = json['token_type'];
    expiresIn = json['expires_in'];
    accessToken = json['access_token'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['success'] = success;
    data['data'] = this.data;
    data['message'] = message;
    data['token_type'] = tokenType;
    data['expires_in'] = expiresIn;
    data['access_token'] = accessToken;
    return data;
  }
}
