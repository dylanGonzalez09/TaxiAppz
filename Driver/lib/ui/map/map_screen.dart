import 'package:taxiappzpro/network/response_models/req_in_pro_model.dart';
import 'package:taxiappzpro/network/response_models/trips_model.dart';
import 'package:flutter/material.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:provider/provider.dart';
import 'package:taxiappzpro/bottom_sheets/trip_request_bs/trip_request_bs.dart';
import 'package:taxiappzpro/components/custom_switch.dart';
import 'package:taxiappzpro/components/drawer_scaffold.dart';
import 'package:taxiappzpro/components/title_view.dart';
import 'package:taxiappzpro/di/di_config.dart';
import 'package:taxiappzpro/ui/map/map_view_supporters/map_bottom_view.dart';
import 'package:taxiappzpro/ui/map/map_view_supporters/offline_allert.dart';
import 'package:taxiappzpro/ui/map/map_vm.dart';
import 'package:taxiappzpro/utils/custom_router_config.dart';
import '../../main.dart';
import 'map_view_supporters/schedule_trip_alert.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();

  static _MapScreenState? of(BuildContext context) =>
      context.findAncestorStateOfType<_MapScreenState>();
}

class _MapScreenState extends State<MapScreen> with RouteAware {
  final vm = getIt<MapVm>();


  late final AppLifecycleListener _listener;
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {

    _listener = AppLifecycleListener(onStateChange: vm.onLifeCycleChanged);
    vm.isPopNextRequestInProgressTrigger = 0;
    vm.setMapDetails();
    // vm.listenForTrips();
    FlutterForegroundTask.addTaskDataCallback(vm.receiveLocationUpdates);
    MyApp.of(context)?.overlayHelper.closeOverlayWindow();
    Future.delayed(Duration.zero, () {
      vm.listenForTrips();
      vm.initService();
      vm.getRequestInProgress(context);
    });
    super.initState();
  }

  @override
  void didChangeDependencies() {
    print('didChangeDependencies');
    routeObserver.subscribe(this, ModalRoute.of(context)!);
    super.didChangeDependencies();
  }

  @override
  void didPopNext() {
    super.didPopNext();

    // ✅ Guard — widget may be unmounted during pop transition
    if (!mounted) return;

    final args = ModalRoute.of(context)?.settings.arguments;

    // If coming from ManageVehicle and refresh == true
    if (args is Map && args["refresh"] == true) {
      vm.getRequestInProgress(context);
      return;
    }

    // ✅ Always call getRequestInProgress when coming back from profileScreen
    final currentRoute = ModalRoute.of(context)?.settings.name ?? '';
    debugPrint('didPopNext → currentRoute: $currentRoute');

    Future.delayed(Duration.zero, () {
      if (mounted) vm.getRequestInProgress(context);
    });

    // Reset counter so next navigation also triggers it
    vm.isPopNextRequestInProgressTrigger = 0;
  }

  @override
  void didPushNext() {
    print('didPushNext');
    super.didPushNext();
  }

  @override
  void dispose() {
    vm.stopLocationUpdates();
    vm.isDisposed = true;
    FlutterForegroundTask.removeTaskDataCallback(vm.receiveLocationUpdates);

    print('Disposing lifecycle listener...');
    _listener.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DrawerScaffold(
        onBackPressedEnable: false,
        vm: vm,
        scaffoldKey: scaffoldKey,
        body: ChangeNotifierProvider<MapVm>(
          create: (context) => vm,
          child: Consumer<MapVm>(builder: (_, vm, child) {
            return  Scaffold(
              bottomSheet: vm.showTripRequest
                  ? TripRequestBs(
                requestInProModel: vm.requestInProModel ?? RequestInProModel(),
                      tripsModel: vm.tripModel ?? TripModel(),
                      closeBottomSheet: vm.closeTripRequest,
                    )
                  : null,
              body: Stack(
                children: [
                  GoogleMap(
                    myLocationButtonEnabled: false,
                    onMapCreated: vm.onMapReady,
                    markers: vm.markers,
                    compassEnabled: false,
                    initialCameraPosition: vm.initialCameraPosition,
                    zoomControlsEnabled: false,
                  ),
                  TitleView(
                    scaffoldKey: scaffoldKey,
                    widget: CustomSwitch(
                        isOnline: vm.isOnline,
                        onClicked: (data) {
                          vm.changeOnlineStatus();
                        },
                        translationModel: vm.translation),
                    onNotificationClick: () {
                      vm.moveToNamed(CustomRouterConfig.notificationScreen);
                    },
                  ),
                  ScheduleTripAlert(vm: vm),
                  OfflineAllert(vm: vm),
                  MapBottomView(vm: vm)
                ],
              ),
            );
          }),
        ));
  }
}
