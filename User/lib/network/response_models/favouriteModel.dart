
class FavouriteListModel {
  List<FavouriteModel>? favouriteList;


  FavouriteListModel({this.favouriteList,});

  FavouriteListModel.fromJson(Map<String, dynamic> json) {
    if (json['FavouriteList'] != null) {
      favouriteList = <FavouriteModel>[];
      json['FavouriteList'].forEach((v) {
        favouriteList!.add(FavouriteModel.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (favouriteList != null) {
      data['FavouriteList'] =
          favouriteList!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class FavouriteModel {
  String? userId;
  String? type;
  double? latitude;
  double? longitude;
  String? address;
  bool? status;
  String? id;

  FavouriteModel(
      {this.userId,
        this.type,
        this.latitude,
        this.longitude,
        this.address,
        this.status,
        this.id});

  FavouriteModel.fromJson(Map<String, dynamic> json) {
    userId = json['userId'];
    type = json['type'];
    latitude = json['latitude'];
    longitude = json['longitude'];
    address = json['address'];
    status = json['status'];
    id = json['id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['userId'] = userId;
    data['type'] = type;
    data['latitude'] = latitude;
    data['longitude'] = longitude;
    data['address'] = address;
    data['status'] = status;
    data['id'] = id;
    return data;
  }
}