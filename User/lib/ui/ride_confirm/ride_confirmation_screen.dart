import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:provider/provider.dart';
import 'package:user/ui/ride_confirm/ride_confirm_vm.dart';

import '../../components/curved_header_view.dart';
import '../../components/drawer_scaffold.dart';
import '../../utils/app_constants.dart';
import 'components/local_ride_confirm_bs.dart';
import 'components/trip_waiting_screen.dart';

class RideConfirmationScreen extends StatefulWidget {
  final Map<String, dynamic> map;

  const RideConfirmationScreen({super.key, required this.map});

  @override
  State<RideConfirmationScreen> createState() => _RideConfirmationScreenState();
}

class _RideConfirmationScreenState extends State<RideConfirmationScreen>
    with RouteAware {
  final routeObserver = RouteObserver();
  final RideConfirmVm vm = RideConfirmVm();
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    vm.setInitialData(widget.map);
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await vm.getTypes();
      vm.getAllDrivers();
      vm.listenForTrips();
      if (vm.titleViewKey.currentContext != null) {
        final RenderBox containerBox =
        vm.titleViewKey.currentContext!.findRenderObject() as RenderBox;
        setState(() {
          vm.mapTopPadding = containerBox.size.height;
        });
      }
    });
    super.initState();
  }

  @override
  void dispose() {
    vm.listenForTripsStream?.cancel();
    vm.getAllDriversStream?.cancel();
    vm.listenForDriverChangesStream?.cancel();
    vm.isDisposed = true;
    vm.timer?.cancel();
    vm.timer = null;
    vm.mapController?.dispose();
    vm.mqtt.unSubscribe(AppConstants.listenDrivers);
    routeObserver.unsubscribe(this);
    super.dispose();
  }

  @override
  void didPushNext() {
    vm.mqtt.unSubscribe(AppConstants.listenDrivers);
    super.didPushNext();
  }

  @override
  void didChangeDependencies() {
    routeObserver.subscribe(this, ModalRoute.of(context)!);
    super.didChangeDependencies();
  }

  @override
  Widget build(BuildContext context) {
    return DrawerScaffold(
        body: ChangeNotifierProvider<RideConfirmVm>(
          create: (context) => vm,
          child: Consumer<RideConfirmVm>(builder: (_, vm, child) {
            if (vm.isMapPaddingChanged) {
              calculateHeight();
            }
            return Scaffold(
              bottomSheet: vm.showTripWaiting
                  ? TripWaitingScreen(
                vm: vm,
                key: vm.bottomSheetKey,
              )
                  : LocalRideConfirmBs(vm: vm, key: vm.bottomSheetKey),
              body: Stack(
                children: [
                  Padding(
                    padding: EdgeInsets.only(
                        bottom: vm.showTripWaiting
                            ? MediaQuery.sizeOf(context).height * 0.40
                            : MediaQuery.sizeOf(context).height * 0.55,
                        top: vm.mapTopPadding > 10 ? vm.mapTopPadding - 10 : 0),
                    child: GoogleMap(
                        zoomControlsEnabled: false,
                        myLocationEnabled: false,
                        myLocationButtonEnabled: false,
                        zoomGesturesEnabled: true,
                        markers: vm.marker,
                        padding: const EdgeInsets.only(top: 20),
                        onMapCreated: vm.onMapReady,
                        polylines: Set<Polyline>.of(vm.polylines.values),
                        initialCameraPosition: vm.getInitialCameraPosition()),
                  ),
                  Positioned(
                      top: 0,
                      left: 0,
                      right: 0,
                      key: vm.titleViewKey,
                      child: CurvedHeaderView(
                        title: vm.translation.txt_Select_vehicle,
                        rideConfirmVm: vm,
                      ))
                ],
              ),
            );
          }),
        ),
        scaffoldKey: scaffoldKey);
  }

  void calculateHeight() {
    vm.isMapPaddingChanged = false;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (vm.bottomSheetKey.currentContext != null) {
        final RenderBox containerBox =
        vm.bottomSheetKey.currentContext!.findRenderObject() as RenderBox;
        setState(() {
          vm.mapBottomPadding = containerBox.size.height;
        });
      }
    });
  }
}
