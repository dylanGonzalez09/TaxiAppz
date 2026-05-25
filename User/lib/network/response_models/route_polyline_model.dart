//
//
// import '../../utils/utils.dart';
//
// class RoutePolylineModel {
//   String? polyline;
//   List<List<double>>? decodedPath;
//   double? distance;
//   double? duration;
//
//   RoutePolylineModel(
//       {this.polyline, this.decodedPath, this.distance, this.duration});
//
//   RoutePolylineModel.fromJson(Map<String, dynamic> json) {
//     polyline = json['polyline'] ?? "";
//     if (json['decodedPath'] != null && json['decodedPath'] is List<dynamic>) {
//       // decodedPath = List<List<double>>.from(
//       //   json['decodedPath'].map(
//       //     (coords) => List<double>.from(coords),
//       //   ),
//       // );
//       List<List<double>> listofLatLngList = [];
//       json['decodedPath'].forEach((m) {
//         if (m is List<dynamic>) {
//           List<double> latLngList = [];
//           for (var l in m) {
//             if (l != null) {
//               final value = Utils.convertToDouble(l);
//               if (value != null) {
//                 latLngList.add(value);
//               }
//             }
//           }
//           if (latLngList.isNotEmpty && latLngList.length == 2) {
//             listofLatLngList.add(latLngList);
//           }
//         }
//       });
//       if (listofLatLngList.isNotEmpty) {
//         decodedPath = listofLatLngList;
//       }
//     }
//     distance = Utils.convertToDouble(json['distance']);
//     duration = Utils.convertToDouble(json['duration']);
//   }
//
//   Map<String, dynamic> toJson() {
//     final Map<String, dynamic> data = <String, dynamic>{};
//     data['polyline'] = polyline;
//     if (decodedPath != null) {
//       data['decodedPath'] = decodedPath!.map((v) => v).toList();
//     }
//     data['distance'] = distance;
//     data['duration'] = duration;
//     return data;
//   }
// }
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

    if (json['decodedPath'] != null && json['decodedPath'] is List) {
      final parsed = <List<double>>[];
      for (final item in (json['decodedPath'] as List)) {
        if (item is! List || item.length < 2) continue;
        final lat = _toDouble(item[0]);
        final lng = _toDouble(item[1]);
        if (lat != null && lng != null) {
          parsed.add([lat, lng]);
        }
      }
      if (parsed.isNotEmpty) {
        decodedPath = parsed;
      }
    }

    distance = (json['distance'] as num?)?.toDouble();
    duration = json['duration'];
    summary = json['summary'];

    if (json['warnings'] != null) {
      warnings = List<String>.from(json['warnings']);
    }
  }

  double? _toDouble(dynamic value) {
    if (value == null) return null;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }
}
