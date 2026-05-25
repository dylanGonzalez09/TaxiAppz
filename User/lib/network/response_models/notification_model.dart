class NotificationModel {
  List<Results>? results;
  int? page;
  int? limit;
  int? totalPages;
  int? totalResults;

  NotificationModel(
      {this.results,
      this.page,
      this.limit,
      this.totalPages,
      this.totalResults});

  NotificationModel.fromJson(Map<String, dynamic> json) {
    if (json['results'] != null) {
      results = <Results>[];
      json['results'].forEach((v) {
        results!.add(Results.fromJson(v));
      });
    }
    page = json['page'];
    limit = json['limit'];
    totalPages = json['totalPages'];
    totalResults = json['totalResults'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (results != null) {
      data['results'] = results!.map((v) => v.toJson()).toList();
    }
    data['page'] = page;
    data['limit'] = limit;
    data['totalPages'] = totalPages;
    data['totalResults'] = totalResults;
    return data;
  }
}

class Results {
  String? title;
  dynamic userIds;
  String? userId;
  dynamic driverIds;
  dynamic subTitle;
  String? message;
  dynamic image;
  bool? isRead;
  int? status;
  String? notificationType;
  dynamic createdBy;
  dynamic clientId;
  dynamic companyId;
  String? id;
  bool isSelected = false;

  Results(
      {this.title,
      this.userIds,
      this.userId,
      this.driverIds,
      this.subTitle,
      this.message,
      this.image,
      this.isRead,
      this.status,
      this.notificationType,
      this.createdBy,
      this.clientId,
      this.companyId,
      this.id});

  Results.fromJson(Map<String, dynamic> json) {
    title = json['title'];
    userIds = json['userIds'];
    userId = json['userId'];
    driverIds = json['driverIds'];
    subTitle = json['subTitle'];
    message = json['message'];
    image = json['image'];
    isRead = json['isRead'];
    status = json['status'];
    notificationType = json['notificationType'];
    createdBy = json['createdBy'];
    clientId = json['clientId'];
    companyId = json['companyId'];
    id = json['id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['title'] = this.title;
    data['userIds'] = this.userIds;
    data['userId'] = this.userId;
    data['driverIds'] = this.driverIds;
    data['subTitle'] = this.subTitle;
    data['message'] = this.message;
    data['image'] = this.image;
    data['isRead'] = this.isRead;
    data['status'] = this.status;
    data['notificationType'] = this.notificationType;
    data['createdBy'] = this.createdBy;
    data['clientId'] = this.clientId;
    data['companyId'] = this.companyId;
    data['id'] = this.id;
    return data;
  }
}
