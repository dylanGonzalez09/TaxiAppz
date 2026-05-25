class RoutePolylineModel {
  Origin? origin;
  Origin? destination;
  int? totalRoutes;
  List<Routes>? routes;

  RoutePolylineModel({this.origin, this.destination, this.totalRoutes, this.routes});

  RoutePolylineModel.fromJson(Map<String, dynamic> json) {
    origin = json['origin'] != null ? Origin.fromJson(json['origin']) : null;
    destination = json['destination'] != null ? Origin.fromJson(json['destination']) : null;
    totalRoutes = json['totalRoutes'];

    if (json['routes'] != null) {
      routes = (json['routes'] as List)
          .map((e) => Routes.fromJson(e))
          .toList();
    }
  }
}
class Origin {
  double? lat;
  double? lng;

  Origin({this.lat, this.lng});

  Origin.fromJson(Map<String, dynamic> json) {
    lat = (json['lat'] as num?)?.toDouble();
    lng = (json['lng'] as num?)?.toDouble();
  }
}
class Routes {
  int? routeIndex;
  String? polyline;
  List<List<double>>? decodedPath;
  double? distance;
  dynamic duration;
  String? summary;
  List<String>? warnings;

  Routes({
    this.routeIndex,
    this.polyline,
    this.decodedPath,
    this.distance,
    this.duration,
    this.summary,
    this.warnings,
  });

  Routes.fromJson(Map<String, dynamic> json) {
    routeIndex = json['routeIndex'];
    polyline = json['polyline'];

    if (json['decodedPath'] != null) {
      decodedPath = (json['decodedPath'] as List)
          .map<List<double>>((e) =>
          (e as List).map((v) => (v as num).toDouble()).toList())
          .toList();
    }

    distance = (json['distance'] as num?)?.toDouble();
    duration = json['duration'];
    summary = json['summary'];

    if (json['warnings'] != null) {
      warnings = List<String>.from(json['warnings']);
    }
  }
}
