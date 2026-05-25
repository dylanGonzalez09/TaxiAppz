
class AdvertisementModel {
  String? title;
  String? isPermanent;
  bool? status;
  String? userType;
  String? createdAt;
  String? id;
  String? image;
  bool isAd = false;

  AdvertisementModel(
      {this.title,
        this.isPermanent,
        this.status,
        this.userType,
        this.createdAt,
        this.id,
        this.image});

  AdvertisementModel.fromJson(Map<String, dynamic> json) {
    title = json['title'];
    isPermanent = json['isPermanent'];
    status = json['status'];
    userType = json['userType'];
    createdAt = json['createdAt'];
    id = json['id'];
    image = json['image'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['title'] = this.title;
    data['isPermanent'] = this.isPermanent;
    data['status'] = this.status;
    data['userType'] = this.userType;
    data['createdAt'] = this.createdAt;
    data['id'] = this.id;
    data['image'] = this.image;
    return data;
  }
}