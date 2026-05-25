

class CancelReasonModel {
  String? reason;
  String? userType;
  String? tripStatus;
  String? payStatus;
  bool? status;
  String? clientId;
  String? id;

  CancelReasonModel(
      {
        this.reason,
        this.userType,
        this.tripStatus,
        this.payStatus,
        this.status,
        this.clientId,
        this.id});

  CancelReasonModel.fromJson(Map<String, dynamic> json) {

    reason = json['reason'];
    userType = json['userType'];
    tripStatus = json['tripStatus'];
    payStatus = json['payStatus'];
    status = json['status'];
    clientId = json['clientId'];
    id = json['id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['reason'] = reason;
    data['userType'] = userType;
    data['tripStatus'] = tripStatus;
    data['payStatus'] = payStatus;
    data['status'] = status;
    data['clientId'] = clientId;
    data['id'] = id;
    return data;
  }
}