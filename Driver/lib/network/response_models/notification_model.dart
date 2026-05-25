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
  String? userId;
  String? subTitle;
  String? message;
  String? image1;
  int? status;
  String? notificationType;
  String? createdBy;
  String? id;
  bool isSelected= false;
  String? createdAt;

  Results(
      {this.title,
        this.userId,
        this.subTitle,
        this.message,
        this.image1,
        this.status,
        this.notificationType,
        this.createdBy,
        this.id,
      this.createdAt});

  Results.fromJson(Map<String, dynamic> json) {
    title = json['title'];
    userId = json['userId'];
    subTitle = json['subTitle'];
    message = json['message'];
    image1 = json['image1'];
    status = json['status'];
    notificationType = json['notificationType'];
    createdBy = json['createdBy'];
    id = json['id'];
    createdAt = json['createdAt'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['title'] = title;
    data['userId'] = userId;
    data['subTitle'] = subTitle;
    data['message'] = message;
    data['image1'] = image1;
    data['status'] = status;
    data['notificationType'] = notificationType;
    data['createdBy'] = createdBy;
    data['id'] = id;
    data['createdAt'] = createdAt;
    return data;
  }
}