import 'package:flutter/material.dart';
import 'package:flutter_polyline_points/flutter_polyline_points.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../paly_ground_vm.dart';

import 'models/enums.dart';

class PlayGround extends StatefulWidget {
  const PlayGround({super.key});

  @override
  State<PlayGround> createState() => _PlayGroundState();
}

class _PlayGroundState extends State<PlayGround> {
  final vm = PlayGroundVm();
  Set<Marker> marker = {};
  var pickupModel = const LatLng(0, 0);
  var dropModel = const LatLng(0, 0);
  PolylinePoints polylinePoints = PolylinePoints();
  PolylineResult? polyLines;
  Map<PolylineId, Polyline> polylines = {};
  List<LatLng> polylineCoordinates = [];
  @override
  void initState() {
    pickupModel = const LatLng(11.0151214, 76.9825383);
    dropModel = const LatLng(10.9902127, 76.96286580000002);
    final pickupMarker = Marker(
      markerId: MarkerId(MakerIds.pickupLocation.name),
      position: pickupModel,
      rotation: 0,
      anchor: const Offset(0.5, 0.8),
    );
    final dropMarker = Marker(
      markerId: MarkerId(MakerIds.dropLocation.name),
      position: dropModel,
      anchor: const Offset(0.5, 0.8),
      rotation: 0,
    );
    marker.add(pickupMarker);
    marker.add(dropMarker);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: GoogleMap(
          zoomControlsEnabled: false,
          myLocationEnabled: false,
          myLocationButtonEnabled: false,
          zoomGesturesEnabled: false,
          padding:
              EdgeInsets.only(bottom: MediaQuery.sizeOf(context).height * 0.55),
          markers: marker,
          onMapCreated: (controller) async {
            getPolyLines();
            await controller.moveCamera(CameraUpdate.newLatLngBounds(
                vm.computeBounds([pickupModel, dropModel]), 60));
          },
          polylines: Set<Polyline>.of(polylines.values),
          initialCameraPosition: const CameraPosition(target: LatLng(0, 0))),
    );
  }

  void getPolyLines() async {
    // PolylineResult result = await polylinePoints.getRouteBetweenCoordinates(
    //   googleApiKey: AppConstants.mapKey,
    //   request: PolylineRequest(
    //       origin: PointLatLng(
    //           pickupModel.latitude, pickupModel.longitude),
    //       destination: PointLatLng(
    //           dropModel.latitude, dropModel.longitude),
    //       mode: TravelMode.driving,
    //       ),
    // );
    // if (result.points.isNotEmpty) {
    //   for (var point in result.points) {
    //     polylineCoordinates.add(LatLng(point.latitude, point.longitude));
    //   }
    // }
    // _addPolyLine();
  }

  _addPolyLine() {
    PolylineId id = const PolylineId("poly");
    Polyline polyline = Polyline(
      polylineId: id,
      color: Colors.black,
      points: polylineCoordinates,
      width: 3,
    );
    polylines[id] = polyline;
    setState(() {});
  }
}
