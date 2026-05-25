
class VehicleBrandResponse {
  List<VehicleBrand>? results;
  int? page;
  int? limit;
  int? totalPages;
  int? totalResults;

  VehicleBrandResponse({
    this.results,
    this.page,
    this.limit,
    this.totalPages,
    this.totalResults,
  });

  VehicleBrandResponse.fromJson(Map<String, dynamic> json) {
    if (json['results'] != null) {
      results = <VehicleBrand>[];
      json['results'].forEach((v) {
        results!.add(VehicleBrand.fromJson(v));
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

class VehicleBrand {
  String? brandName;
  String? description;
  String? image;
  String? vehicleId;
  bool? status;
  String? clientId;
  String? companyId;
  String? id;

  VehicleBrand({
    this.brandName,
    this.description,
    this.image,
    this.vehicleId,
    this.status,
    this.clientId,
    this.companyId,
    this.id,
  });

  VehicleBrand.fromJson(Map<String, dynamic> json) {
    brandName = json['brandName'];
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
    data['brandName'] = brandName;
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
