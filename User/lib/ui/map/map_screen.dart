import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/svg.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:provider/provider.dart';
import 'package:user/components/user_block_screen.dart';
import 'package:user/utils/preference_helper.dart';

import '../../components/beforeRental_header.dart';
import '../../components/drawer_scaffold.dart';
import '../../components/sos_view.dart';
import '../../main.dart';
import '../../models/enums.dart';
import '../../utils/app_constants.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../../utils/custom_router.dart';
import '../../utils/dimensions.dart';
import 'components/fetching_pickup_location.dart';
import 'components/map_local_view.dart';
import 'components/map_title_view.dart';
import 'components/service_category.dart';
import 'components/slider_view.dart';
import 'map_vm.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> with RouteAware {
  final vm = MapVm();
  late final AppLifecycleListener _listener;
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  String? _mapStyle;
  bool isAd = false;

  @override
  void initState() {
    super.initState();
    //_loadMapStyle();

    if (vm.getSavedCurrentLocation() != const LatLng(0.0, 0.0)) {
      vm.usersCurrentLocation = vm.getSavedCurrentLocation();

    }
    _listener = AppLifecycleListener(onStateChange: vm.onLifeCycleChanged);
    Future.delayed(Duration.zero, () {

      vm.checkForPermission();
    });
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await MyApp.of(context)?.subscribeToUserRequest(vm.getUserId());
      if (vm.titleViewKey.currentContext != null &&
          vm.bottomViewKey.currentContext != null) {
        final RenderBox containerBox =
        vm.titleViewKey.currentContext!.findRenderObject() as RenderBox;
        final RenderBox bottomBox =
        vm.bottomViewKey.currentContext!.findRenderObject() as RenderBox;
        setState(() {
          vm.titleViewHeight = containerBox.size.height;
          vm.bottomViewHeight = bottomBox.size.height;
        });
        // _loadMapStyle();
      }
    });
  }

  Future<void> _loadMapStyle() async {
    _mapStyle = await rootBundle.loadString('assets/map_style.json');
  }

  @override
  void didChangeDependencies() {
    routeObserver.subscribe(this, ModalRoute.of(context)!);
    super.didChangeDependencies();
  }

  @override
  void didPopNext() {
    debugPrint("did pop next called");
    vm.listenForChanges();
    super.didPopNext();
  }

  @override
  void didPop() {
    vm.mqtt.unSubscribe(AppConstants.listenDrivers);
    super.didPop();
  }

  @override
  void didPushNext() {
    debugPrint("CheckDataFromMapScreen");
    vm.mqtt.unSubscribe(AppConstants.listenDrivers);
    super.didPushNext();
  }

  @override
  void dispose() {
    _listener.dispose();
    vm.mapController?.dispose();
    vm.mqtt.unSubscribe(AppConstants.listenDrivers);
    vm.isDisposed = true;
    routeObserver.unsubscribe(this);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DrawerScaffold(
        onBackPressedEnable: false,
        vm: vm,
        body: SizedBox(
            height: double.infinity,
            width: double.infinity,
            child: ChangeNotifierProvider<MapVm>(
              create: (context) => vm,
              child: Consumer<MapVm>(builder: (_, vm, child) {
                if (vm.isMapPaddingAdjusted) {
                  WidgetsBinding.instance.addPostFrameCallback((_) {
                    vm.adjustMapPadding();
                  });
                }
                return Stack(
                  children: [
                    Container(
                      key: vm.mapViewKey,
                      margin: EdgeInsets.only(
                        top: vm.titleViewHeight > 10
                            ? vm.titleViewHeight - 10
                            : 0,
                        bottom: vm.bottomViewHeight > 10
                            ? vm.bottomViewHeight - 10
                            : 0,
                      ),
                      child: Stack(
                        children: [
                          GoogleMap(
                              onMapCreated: (GoogleMapController controller) {
                                vm.onMapLoaded(controller);
                              },
                              style: _mapStyle,
                              zoomControlsEnabled: false,
                              compassEnabled: false,
                              onCameraIdle: vm.onMapIdle,
                              myLocationEnabled: false,
                              myLocationButtonEnabled: false,
                              markers: vm.marker,
                              onCameraMove: vm.onCameraMove,
                              initialCameraPosition: CameraPosition(
                                  target: vm.usersCurrentLocation, zoom: 16)),
                          if (vm.showFloatingMarker)
                            Positioned(
                              top: 0,
                              bottom: 25,
                              left: 0,
                              right: 0,
                              child: Center(
                                child: Image.asset(
                                  CustomImages.currentLocationMarker,
                                  width: 60,
                                  height: 60,
                                ),
                              ),
                            )
                        ],
                      ),
                    ),
                    vm.isFetchingPickupLocation
                        ? BeforeRentalHeader(
                      scaffoldKey: scaffoldKey,
                      vm: vm,
                    )
                        : MapTitleView(
                      scaffoldKey: scaffoldKey,
                      key: vm.titleViewKey,
                      onNotificationClick: vm.moveToNamed,
                    ),
                    Positioned(
                        bottom: 0,
                        left: 0,
                        right: 0,
                        child: Column(
                          children: [
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: Dimensions.padding_20,
                                  vertical: Dimensions.padding_15),
                              child: Row(
                                children: [
                                  const Spacer(),
                                  InkWell(
                                    onTap: vm.getCurrentLocation,
                                    child: Container(
                                        decoration: BoxDecoration(
                                            boxShadow: [
                                              BoxShadow(
                                                  color: CustomColors.clr_414141
                                                      .withAlpha(51),
                                                  spreadRadius: 1,
                                                  blurRadius: 2),
                                            ],
                                            shape: BoxShape.circle,
                                            color: CustomColors.buttonTxtColor),
                                        padding: const EdgeInsets.all(
                                            Dimensions.padding_9),
                                        child: SvgPicture.asset(
                                            CustomImages.myLocationIcon)),
                                  )
                                ],
                              ),
                            ),
                            Container(
                              key: vm.bottomViewKey,
                              decoration: BoxDecoration(
                                  boxShadow: [
                                    BoxShadow(
                                        color: CustomColors.clr_414141
                                            .withAlpha(51),
                                        spreadRadius: 1,
                                        blurRadius: 2),
                                  ],
                                  color: Colors.white,
                                  borderRadius: const BorderRadius.only(
                                      topLeft: Radius.circular(
                                          Dimensions.padding_20),
                                      topRight: Radius.circular(
                                          Dimensions.padding_20))),
                              child: vm.isFetchingPickupLocation
                                  ? FetchingPickupLocation(
                                vm: vm,
                                isChangePick: vm.isPickupChange,
                              )
                                  : Column(
                                children: [
                                  vm.selectedCategory ==
                                      ServiceCategoryType.Ride
                                      ? MapLocalView(
                                    vm: vm,
                                  )
                                      : const SizedBox(),
                                  vm.selectedCategory ==
                                      ServiceCategoryType.Rental
                                      ? SliderView(
                                    vm: vm,
                                  )
                                      : const SizedBox(),
                                  ServiceCategory(
                                    vm: vm,
                                  ),
                                  const SizedBox(
                                      height: Dimensions.padding_10)
                                ],
                              ),
                            ),
                          ],
                        )),
                    if (vm.isDataLoading)
                      const Center(
                        child: SizedBox(
                          height: 32,
                          width: 32,
                          child: CircularProgressIndicator(
                            color: CustomColors.primaryColor,
                          ),
                        ),
                      )
                  ],
                );
              }),
            )),
        scaffoldKey: scaffoldKey);
  }
}
