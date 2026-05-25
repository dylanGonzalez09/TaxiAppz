
class VehicleModelResponse {
  List<VehicleModel>? results;
  int? page;
  int? limit;
  int? totalPages;
  int? totalResults;

  VehicleModelResponse({
    this.results,
    this.page,
    this.limit,
    this.totalPages,
    this.totalResults,
  });

  VehicleModelResponse.fromJson(Map<String, dynamic> json) {
    if (json['results'] != null) {
      results = <VehicleModel>[];
      json['results'].forEach((v) {
        results!.add(VehicleModel.fromJson(v));
      });
    }
    page = json['page'];
    limit = json['limit'];
    totalPages = json['totalPages'];
    totalResults = json['totalResults'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {};
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

class VehicleModel {
  String? modelName;
  String? description;
  String? image;
  String? vehicleId;
  bool? status;
  String? clientId;
  String? companyId;
  String? id;

  VehicleModel({
    this.modelName,
    this.description,
    this.image,
    this.vehicleId,
    this.status,
    this.clientId,
    this.companyId,
    this.id,
  });

  VehicleModel.fromJson(Map<String, dynamic> json) {
    modelName = json['modelname'];
    description = json['description'];
    image = json['image'];
    vehicleId = json['vehicleId'];
    status = json['status'];
    clientId = json['clientId'];
    companyId = json['companyId'];
    id = json['id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {};
    data['modelname'] = modelName;
    data['description'] = description;
    data['image'] = image;
    data['vehicleId'] = vehicleId;
    data['status'] = status;
    data['clientId'] = clientId;
    data['companyId'] = companyId;
    data['id'] = id;
    return data;
  }
}
