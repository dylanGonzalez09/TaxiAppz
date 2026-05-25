class UserFeedbackModel {
  String? question;
  bool? status;
  String? clientId;
  String? id;
  bool? like;

  UserFeedbackModel({
    this.question,
    this.status,
    this.clientId,
    this.id,
    this.like = false,
  });

  UserFeedbackModel.fromJson(Map<String, dynamic> json) {
    question = json['question'];
    status = json['status'];
    clientId = json['clientId'];
    id = json['id'];
    like = json['like'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['question'] = question;
    data['status'] = status;
    data['clientId'] = clientId;
    data['id'] = id;
    data['like'] = like;
    return data;
  }
}
