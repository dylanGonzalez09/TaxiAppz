class VehicleTypeModel {
  VehiclePagination? vehicles;

  VehicleTypeModel({this.vehicles});

  VehicleTypeModel.fromJson(Map<String, dynamic> json) {
    vehicles = json['vehicles'] != null
        ? VehiclePagination.fromJson(json['vehicles'])
        : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {};
    if (vehicles != null) data['vehicles'] = vehicles!.toJson();
    return data;
  }
}


class VehiclePagination {
  List<VehicleResult>? results;
  int? page;
  int? limit;
  int? totalPages;
  int? totalResults;

  VehiclePagination({
    this.results,
    this.page,
    this.limit,
    this.totalPages,
    this.totalResults,
  });

  VehiclePagination.fromJson(Map<String, dynamic> json) {
    if (json['results'] != null) {
      results = <VehicleResult>[];
      json['results'].forEach((v) {
        results!.add(VehicleResult.fromJson(v));
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


class VehicleResult {
  String? sId;
  String? vehicleName;
  String? image;
  String? serviceType;
  int? sortingorder;
  String? highlightImage;
  bool? status;
  String? clientId;
  String? companyId;
  String? createdAt;
  String? updatedAt;
  int? iV;
  bool isSelected = false;
  String? carColour;

  VehicleResult({
    this.sId,
    this.vehicleName,
    this.image,
    this.serviceType,
    this.sortingorder,
    this.highlightImage,
    this.status,
    this.clientId,
    this.companyId,
    this.createdAt,
    this.updatedAt,
    this.iV,
    this.isSelected = false,
    this.carColour,
  });

  VehicleResult.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    vehicleName = json['vehicleName'];
    image = json['image'];
    serviceType = json['serviceType'];
    sortingorder = json['sortingorder'];
    highlightImage = json['highlightImage'];
    status = json['status'];
    clientId = json['clientId'];
    companyId = json['companyId'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    iV = json['__v'];
    carColour = json['carColour'];
    isSelected = false;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {};
    data['_id'] = sId;
    data['vehicleName'] = vehicleName;
    data['image'] = image;
    data['serviceType'] = serviceType;
    data['sortingorder'] = sortingorder;
    data['highlightImage'] = highlightImage;
    data['status'] = status;
    data['clientId'] = clientId;
    data['companyId'] = companyId;
    data['createdAt'] = createdAt;
    data['updatedAt'] = updatedAt;
    data['__v'] = iV;
    data['carColour'] = carColour;
    return data;
  }

  String? get id => sId;
}

