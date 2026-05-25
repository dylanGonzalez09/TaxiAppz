class VehicleVariantResponse {
  List<VehicleVariant>? results;
  int? page;
  int? limit;
  int? totalPages;
  int? totalResults;

  VehicleVariantResponse({
    this.results,
    this.page,
    this.limit,
    this.totalPages,
    this.totalResults,
  });

  VehicleVariantResponse.fromJson(Map<String, dynamic> json) {
    if (json['results'] != null) {
      results = <VehicleVariant>[];
      json['results'].forEach((v) {
        results!.add(VehicleVariant.fromJson(v));
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

class VehicleVariant {
  String? sId;
  String? variantName;
  String? description;
  String? image;
  String? vehicleId;
  String? vehicleModelId;
  bool? status;
  String? clientId;
  String? companyId;
  String? createdAt;
  String? updatedAt;
  int? iV;
  bool isSelected = false;

  VehicleVariant({
    this.sId,
    this.variantName,
    this.description,
    this.image,
    this.vehicleId,
    this.vehicleModelId,
    this.status,
    this.clientId,
    this.companyId,
    this.createdAt,
    this.updatedAt,
    this.iV,
    this.isSelected = false,
  });

  VehicleVariant.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    variantName = json['variantName'];
    description = json['description'];
    image = json['image'];
    vehicleId = json['vehicleId'];
    vehicleModelId = json['vehicleModelId'];
    status = json['status'];
    clientId = json['clientId'];
    companyId = json['companyId'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    iV = json['__v'];
    isSelected = false;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {};
    data['_id'] = sId;
    data['variantName'] = variantName;
    data['description'] = description;
    data['image'] = image;
    data['vehicleId'] = vehicleId;
    data['vehicleModelId'] = vehicleModelId;
    data['status'] = status;
    data['clientId'] = clientId;
    data['companyId'] = companyId;
    data['createdAt'] = createdAt;
    data['updatedAt'] = updatedAt;
    data['__v'] = iV;
    return data;
  }

  String? get id => sId;
}
