class ComplaintModel {
  String? title;
  String? category;
  String? type;
  int? status;
  int? complaintType;
  String? createdBy;
  String? language;
  String? clientId;
  String? id;

  ComplaintModel(
      {this.title,
        this.category,
        this.type,
        this.status,
        this.complaintType,
        this.createdBy,
        this.language,
        this.clientId,
        this.id});

  ComplaintModel.fromJson(Map<String, dynamic> json) {
    title = json['title'];
    category = json['category'];
    type = json['type'];
    status = json['status'];
    complaintType = json['complaintType'];
    createdBy = json['createdBy'];
    language = json['language'];
    clientId = json['clientId'];
    id = json['id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['title'] = title;
    data['category'] = category;
    data['type'] = type;
    data['status'] = status;
    data['complaintType'] = complaintType;
    data['createdBy'] = createdBy;
    data['language'] = language;
    data['clientId'] = clientId;
    data['id'] = id;
    return data;
  }
}

