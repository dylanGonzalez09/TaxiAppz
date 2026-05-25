import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:provider/provider.dart';

import '../../components/curved_header_view.dart';
import '../../components/drawer_scaffold.dart';
import '../../ui/rental/components/rental_ride_confim_bs.dart';
import '../../ui/rental/rental_vm.dart';
import '../../utils/app_constants.dart';
import 'components/rental_trip_waiting_screen.dart';

class RentalScreen extends StatefulWidget {
  final Map<String, dynamic> map;

  const RentalScreen({super.key, required this.map});

  @override
  State<RentalScreen> createState() => _RentalScreenState();
}

class _RentalScreenState extends State<RentalScreen> with RouteAware {
  final routeObserver = RouteObserver();
  final vm = RentalVm();
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    widget.map;
    var selectedPackage = widget.map['selectedPackage'];
    var rentalPackage = widget.map['rentalPackage'];
    var rentalModel = widget.map['rentalModel'];
    if (selectedPackage != null &&
        rentalPackage != null &&
        rentalModel != null) {
      vm.rentalModel = rentalModel;
      vm.savePaymentTypeList(vm.rentalModel?.paymentTypes);
      vm.minHours = vm.rentalModel?.minHr ?? 0;
      vm.maxHours = vm.rentalModel?.maxHr ?? 0;
      vm.minKm = vm.rentalModel?.minKm ?? 0;
      vm.maxKm = vm.rentalModel?.maxKm ?? 0;
      vm.rentalPackages = rentalPackage;
      vm.selectedPackage = selectedPackage;
      vm.pickupLocation = "";
      if (vm.selectedPackage?.vehiclePrices?.isNotEmpty == true) {
        vm.isShimmerLoading = false;
        vm.selectedPackage?.vehiclePrices?[0].isSelected = true;
        vm.selectedVehicle = vm.selectedPackage?.vehiclePrices?[0];
        vm.selectedVehicleId = vm.selectedVehicle?.vehicleId ?? "";
      }
    }
    vm.setInitialData(widget.map);
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      vm.getAllDrivers();
      vm.listenForTrips();
      if (vm.titleViewKey.currentContext != null) {
        final RenderBox containerBox =
            vm.titleViewKey.currentContext!.findRenderObject() as RenderBox;
        setState(() {
          vm.mapTopPadding = containerBox.size.height;
          debugPrint(
              "bottomPadding ${vm.mapBottomPadding} \n upPadding ${vm.mapTopPadding}");
        });
      }
    });
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
        body: ChangeNotifierProvider<RentalVm>(
          create: (context) => vm,
          child: Consumer<RentalVm>(builder: (_, vm, child) {
            if (vm.isMapPaddingChanged) {
              calculateHeight();
            }
            return Scaffold(
              bottomSheet: vm.showTripWaiting
                  ? RentalTripWaitingScreen(
                      vm: vm,
                      key: vm.bottomSheetKey,
                    )
                  : RentalRideConfirmBs(vm: vm, key: vm.bottomSheetKey),
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
                        padding: const EdgeInsets.only(top: 20, bottom: 20),
                        onMapCreated: vm.onMapReady,
                        initialCameraPosition: vm.getInitialCameraPosition()),
                  ),
                  Positioned(
                      top: 0,
                      left: 0,
                      right: 0,
                      key: vm.titleViewKey,
                      child: CurvedHeaderView(
                        title: vm.translation.txt_rental,
                        rentalVm: vm,
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
          debugPrint(
              "bottomPadding ${vm.mapBottomPadding} \n upPadding ${vm.mapTopPadding}");
        });
      }
    });
  }
}
