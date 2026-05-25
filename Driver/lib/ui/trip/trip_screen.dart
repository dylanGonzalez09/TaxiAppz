import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:flutter_svg/svg.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:http/http.dart' as preference;
import 'package:provider/provider.dart';
import 'package:taxiappzpro/components/drawer_scaffold.dart';
import 'package:taxiappzpro/components/header_view.dart';
import 'package:taxiappzpro/components/pickup_view.dart';
import 'package:taxiappzpro/components/proceed_button.dart';
import 'package:taxiappzpro/components/slider_button.dart';
import 'package:taxiappzpro/components/sos_view.dart';
import 'package:taxiappzpro/components/title_view.dart';
import 'package:taxiappzpro/di/di_config.dart';
import 'package:taxiappzpro/network/response_models/trips_model.dart';
import 'package:taxiappzpro/ui/trip/trip_vm.dart';
import 'package:taxiappzpro/utils/app_constants.dart';
import 'package:taxiappzpro/utils/custom_router_config.dart';
import 'package:taxiappzpro/utils/dimensions.dart';
import '../../components/autoscroll.dart';
import '../../network/response_models/req_in_pro_model.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../../utils/preference_helper.dart';
import '../../utils/utils.dart';
import 'package:taxiappzpro/base/base_vm.dart';

class TripScreen extends StatefulWidget {
  final RequestInProModel? tripModel;

  const TripScreen({super.key, this.tripModel});

  @override
  State<TripScreen> createState() => _TripScreenState();
}

class _TripScreenState extends State<TripScreen> with SingleTickerProviderStateMixin, WidgetsBindingObserver {
  final GlobalKey _containerKey = GlobalKey();
  final vm = getIt<TripVm>();
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  late AnimationController _animationController;
  late Animation<double> _slideAnimation;

  @override
  void initState() {
    super.initState();

    _animationController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );
    WidgetsBinding.instance.addObserver(this);
    _slideAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    setState(() {
      vm.isDisposed = false;
      vm.requestInProModel = widget.tripModel;
      vm.trip = widget.tripModel?.trip;
      vm.isBottomSheetCollapsed = true;

      debugPrint("DisposeTripVM ${vm.trip?.requestNumber}");
      if (vm.trip?.tripType?.toUpperCase() == AppConstants.rental.toUpperCase()) {
        vm.startKm = vm.trip?.startKm;
      }
    });

    vm.setInitialLocation();
    FlutterForegroundTask.addTaskDataCallback(vm.receiveLocationUpdates);
    if (vm.trip == null) {
      Future.delayed(Duration.zero, () {
        vm.getReqInProgress();
      });
    } else {
      vm.listenForTripChanges();
      vm.getPolyLines();
    }

    Future.delayed(const Duration(milliseconds: 500), () {
      if (mounted) {}
    });

    adjustMapPadding();
  }

  @override
  void reassemble() {
    super.reassemble();
    vm.restoreWaitingTimeFromPreferences();
    vm.notifyListeners();
  }

  @override
  void dispose() {
    _animationController.dispose();
    WidgetsBinding.instance.removeObserver(this);
    vm.trip = null;
    debugPrint("disposeCheck  dispose ${vm.trip?.toJson()}");
    vm.isDisposed = true;
    FlutterForegroundTask.removeTaskDataCallback(vm.receiveLocationUpdates);
    super.dispose();
  }

  void _toggleBottomSheet() {
    setState(() {
      vm.isBottomSheetCollapsed = !vm.isBottomSheetCollapsed;
      if (vm.isBottomSheetCollapsed) {
        _animationController.reverse();
      } else {
        _animationController.forward();
      }
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      vm.force2DView();
    });

    adjustMapPadding();
  }

  @override
  void didChangeMetrics() {
    super.didChangeMetrics();

    Future.delayed(const Duration(milliseconds: 300), () {
      if (!mounted) return;

      final savedBearing = vm.preference.getDouble(PreferenceHelper.bearingDouble) ?? 0;

      vm.mapController?.animateCamera(
        CameraUpdate.newCameraPosition(
          CameraPosition(
            target: vm.currentLocation,
            zoom: 17,
            tilt: 0,
            bearing: savedBearing,
          ),
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return DrawerScaffold(
        scaffoldKey: scaffoldKey,
        body: ChangeNotifierProvider<TripVm>(
          create: (context) => vm,
          child: Consumer<TripVm>(builder: (_, vm, child) {
            return Stack(
              children: [
                GoogleMap(
                  onCameraMoveStarted: () {
                    vm.isAutoRecenterEnabled = true;
                  },
                  myLocationButtonEnabled: false,
                  initialCameraPosition: vm.initialLocation,
                  zoomControlsEnabled: false,
                  compassEnabled: false,
                  onMapCreated: vm.onMapCreated,
                  markers: vm.markers,
                  polylines: Set<Polyline>.of(vm.polylines.values),
                  padding: EdgeInsets.only(
                    bottom: vm.isBottomSheetCollapsed ? 100 : 0,
                  ),
                ),
                Align(
                  alignment: Alignment.topCenter,
                  child: TitleView(
                      showNotificationIcon: false,
                      widget: Text(vm.trip?.requestNumber ?? "", style: Theme.of(context).textTheme.titleLarge?.copyWith(color: Colors.red, fontSize: Dimensions.padding_18)),
                      scaffoldKey: scaffoldKey),
                ),
                if (vm.isBottomSheetCollapsed)
                  Positioned(
                    top: 72,
                    left: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.12),
                            blurRadius: 8,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                vm.routeDistanceText,
                                style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                vm.trip?.unit ?? "km",
                                style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.grey),
                              ),
                              const Spacer(),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.grey.shade100,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  vm.routeDurationText,
                                  style: Theme.of(context).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w600),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          AutoScrollText(
                            text: vm.tripStatus == TRIPSTATUS.TRIP_STARTED ? (vm.trip?.dropAddress ?? "") : (vm.trip?.pickAddress ?? ""),
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.grey[700]),
                          ),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              const Icon(Icons.navigation, size: 16, color: Colors.blue),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  "${vm.getTurnInstruction()} in "
                                  "${vm.getDistanceToNextTurn().toStringAsFixed(0)} m",
                                  style: Theme.of(context).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w600),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                if (vm.isBottomSheetCollapsed)
                  Positioned(
                    bottom: 20,
                    left: 20,
                    child: Material(
                      elevation: 6,
                      borderRadius: BorderRadius.circular(30),
                      child: InkWell(
                        onTap: _toggleBottomSheet,
                        borderRadius: BorderRadius.circular(30),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 10,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(30),
                            border: Border.all(
                              color: CustomColors.primaryColor.withOpacity(0.3),
                              width: 1.5,
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.expand_less,
                                color: CustomColors.primaryColor,
                                size: 20,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'Trip Details',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                      color: CustomColors.primaryColor,
                                      fontWeight: FontWeight.w600,
                                      fontSize: 13,
                                    ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                if (vm.isBottomSheetCollapsed)
                  Positioned(
                    bottom: 20,
                    right: 20,
                    child: GestureDetector(
                      onTap: vm.recenterNow,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 10,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.2),
                              blurRadius: 6,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: const [
                            Icon(
                              Icons.my_location,
                              size: 18,
                              color: Colors.black87,
                            ),
                            SizedBox(width: 6),
                            Text(
                              'Recenter',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                                color: Colors.black87,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                if (!vm.isBottomSheetCollapsed)
                  Positioned(
                    left: 0,
                    right: 0,
                    bottom: 0,
                    child: AnimatedBuilder(
                      animation: _slideAnimation,
                      builder: (context, child) {
                        return Transform.translate(
                          offset: Offset(0, 0),
                          child: child,
                        );
                      },
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Padding(
                                padding: const EdgeInsets.only(bottom: 15, left: 15),
                                child: InkWell(
                                    onTap: () => vm.moveToNamed(CustomRouterConfig.sosScreen),
                                    child: SosView(
                                      translation: vm.translation,
                                    )),
                              ),
                              const Spacer(),
                              vm.trip?.tripType?.toUpperCase() == AppConstants.local.toUpperCase()
                                  ? Visibility(
                                      visible: vm.trip?.tripType?.toUpperCase() == AppConstants.local.toUpperCase() &&
                                          (vm.tripStatus == TRIPSTATUS.TRIP_ARRIVED || vm.tripStatus == TRIPSTATUS.TRIP_STARTED),
                                      child: Container(
                                        margin: const EdgeInsets.only(right: 25),
                                        padding: const EdgeInsets.only(left: 7, right: 7, top: 7, bottom: 3),
                                        decoration: const BoxDecoration(color: CustomColors.primaryColor, borderRadius: BorderRadius.only(topLeft: Radius.circular(10), topRight: Radius.circular(10))),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          crossAxisAlignment: CrossAxisAlignment.end,
                                          children: [
                                            Text(
                                              vm.translation.txtWaitingTime,
                                              style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontSize: 12, color: CustomColors.buttonTxtColor),
                                            ),
                                            const SizedBox(width: 3),
                                            Text(
                                              vm.formatHourNotZeroDuration(vm.waitingTime),
                                              style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontSize: 15, height: 1.4, color: CustomColors.buttonTxtColor),
                                            )
                                          ],
                                        ),
                                      ),
                                    )
                                  : Visibility(
                                      visible: (vm.tripStatus == TRIPSTATUS.TRIP_STARTED),
                                      child: Container(
                                        margin: const EdgeInsets.only(right: 25),
                                        padding: const EdgeInsets.only(left: 7, right: 7, top: 7, bottom: 3),
                                        decoration: const BoxDecoration(
                                            color: CustomColors.svgImageColorDarkBlue, borderRadius: BorderRadius.only(topLeft: Radius.circular(10), topRight: Radius.circular(10))),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          crossAxisAlignment: CrossAxisAlignment.end,
                                          children: [
                                            Text(
                                              vm.translation.txtTripTime,
                                              style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontSize: 14, color: Colors.white),
                                            ),
                                            const SizedBox(width: 5),
                                            Text(
                                              vm.formatHourNotZeroDuration(vm.waitingTime),
                                              style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontSize: 15, height: 1.4, color: Colors.white),
                                            )
                                          ],
                                        ),
                                      ),
                                    )
                            ],
                          ),
                          GestureDetector(
                            onVerticalDragEnd: (details) {
                              if (details.velocity.pixelsPerSecond.dy > 500) {
                                if (!vm.isBottomSheetCollapsed) {
                                  _toggleBottomSheet();
                                }
                              } else if (details.velocity.pixelsPerSecond.dy < -500) {
                                if (vm.isBottomSheetCollapsed) {
                                  _toggleBottomSheet();
                                }
                              }
                            },
                            child: Container(
                              key: _containerKey,
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.grey.withOpacity(0.5),
                                    spreadRadius: 1,
                                    blurRadius: 5,
                                    offset: const Offset(2, 0),
                                  ),
                                ],
                                borderRadius: const BorderRadius.only(topRight: Radius.circular(20), topLeft: Radius.circular(20)),
                              ),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  // Drag handle
                                  InkWell(
                                    onTap: _toggleBottomSheet,
                                    child: Container(
                                      height: 3,
                                      width: 36,
                                      decoration: BoxDecoration(color: CustomColors.clr_AAAAAA, borderRadius: BorderRadius.circular(Dimensions.padding_5)),
                                      margin: const EdgeInsets.only(bottom: 10),
                                    ),
                                  ),
                                  Visibility(
                                      visible: !(vm.tripStatus == TRIPSTATUS.TRIP_STARTED && vm.trip?.tripType?.toUpperCase() == AppConstants.rental.toUpperCase()),
                                      child: InkWell(
                                          onTap: vm.handleTempDialog,
                                          child: PickupView(
                                            isDrop: vm.tripStatus == TRIPSTATUS.TRIP_STARTED,
                                            address: vm.tripStatus == TRIPSTATUS.TRIP_STARTED ? vm.trip?.dropAddress ?? "" : vm.trip?.pickAddress ?? "",
                                            stopAddress: vm.trip?.stopAddress ?? "",
                                          ))),
                                  SizedBox(
                                      height: (vm.tripStatus == TRIPSTATUS.TRIP_STARTED && vm.trip?.tripType?.toUpperCase() == AppConstants.rental.toUpperCase())
                                          ? Dimensions.padding_10
                                          : Dimensions.padding_20),
                                  Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    children: [
                                      const SizedBox(width: Dimensions.padding_15),
                                      CachedNetworkImage(
                                        imageUrl: "${AppConstants.imageBaseUrl}${vm.trip?.user?.profilePic ?? ""}",
                                        height: Dimensions.padding_40,
                                        width: Dimensions.padding_40,
                                        progressIndicatorBuilder: (c, u, l) => const SizedBox(
                                          height: Dimensions.padding_40,
                                          width: Dimensions.padding_40,
                                          child: CircularProgressIndicator(
                                            color: CustomColors.primaryColor,
                                            strokeWidth: Dimensions.padding_2,
                                          ),
                                        ),
                                        errorWidget: (c, e, t) => Container(
                                          padding: const EdgeInsets.all(Dimensions.padding_5),
                                          height: Dimensions.padding_40,
                                          width: Dimensions.padding_40,
                                          decoration: BoxDecoration(
                                            borderRadius: BorderRadius.circular(Dimensions.padding_10),
                                            border: Border.all(color: CustomColors.primaryColor),
                                          ),
                                          child: SvgPicture.asset(
                                            CustomImages.dummyProfileImage,
                                            fit: BoxFit.contain,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: Dimensions.padding_8),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          mainAxisAlignment: MainAxisAlignment.start,
                                          children: [
                                            Text(
                                              vm.trip?.bookingFor?.toUpperCase() == "OTHERS" ? vm.trip?.othersName ?? "" : vm.trip?.user?.firstName ?? "",
                                              style: Theme.of(context).textTheme.bodySmall,
                                              overflow: TextOverflow.ellipsis,
                                              maxLines: 1,
                                            ),
                                            const SizedBox(height: Dimensions.padding_3),
                                            Row(
                                              children: [
                                                SvgPicture.asset(CustomImages.star),
                                                const SizedBox(width: 5),
                                                Text("${vm.trip?.userAverageRating ?? vm.trip?.user?.rating ?? 0}", style: Theme.of(context).textTheme.bodySmall?.copyWith(fontSize: 16)),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                      InkWell(
                                        onTap: () {
                                          vm.clearMessageCount();
                                          final userId = vm.trip?.userId;
                                          final driverId = vm.getDriverUserId();
                                          final userName = vm.trip?.user?.firstName;
                                          final tripStartTime = vm.trip?.tripStartTime;
                                          final requestID = vm.trip?.sId;
                                          vm.moveToNamed(
                                            CustomRouterConfig.chatScreen,
                                            args: {"driverId": driverId, "userId": userId, "userName": userName, "tripStartTime": tripStartTime, "requestID": requestID},
                                          );
                                        },
                                        child: Stack(
                                          clipBehavior: Clip.none,
                                          children: [
                                            SvgPicture.asset(
                                              CustomImages.msg,
                                              height: 34,
                                              width: 34,
                                            ),
                                            if (vm.messageCount > 0)
                                              Positioned(
                                                right: -4,
                                                top: -4,
                                                child: Container(
                                                  padding: const EdgeInsets.all(4),
                                                  decoration: const BoxDecoration(
                                                    color: Colors.red,
                                                    shape: BoxShape.circle,
                                                  ),
                                                  constraints: const BoxConstraints(
                                                    minWidth: 18,
                                                    minHeight: 18,
                                                  ),
                                                  child: Text(
                                                    vm.messageCount > 99 ? vm.trip?.sId ?? toString() : vm.messageCount.toString(),
                                                    textAlign: TextAlign.center,
                                                    style: const TextStyle(
                                                      color: Colors.white,
                                                      fontSize: 10,
                                                      fontWeight: FontWeight.bold,
                                                    ),
                                                  ),
                                                ),
                                              ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: Dimensions.padding_15),
                                  Padding(
                                    padding: const EdgeInsets.only(left: Dimensions.padding_70),
                                    child: Visibility(
                                      visible: vm.tripStatus == TRIPSTATUS.TRIP_STARTED,
                                      child: Row(
                                        children: [
                                          SvgPicture.asset(CustomImages.cash),
                                          const SizedBox(width: 6),
                                          Text(
                                            vm.trip?.paymentOpt ?? "Cash",
                                            style: Theme.of(context).textTheme.bodySmall,
                                          ),
                                          const Spacer(),
                                          Text(
                                            "${vm.translation.txtDistance} ${vm.distanceTravelled.toStringAsFixed(2)}",
                                            style: Theme.of(context).textTheme.bodySmall,
                                          ),
                                          const SizedBox(width: 10),
                                        ],
                                      ),
                                    ),
                                  ),
                                  Visibility(visible: vm.tripStatus == TRIPSTATUS.TRIP_STARTED, child: const SizedBox(height: Dimensions.padding_17)),
                                  Container(
                                      height: 0.5, width: double.infinity, margin: const EdgeInsets.only(left: Dimensions.padding_20, right: Dimensions.padding_10), color: CustomColors.clr_AAAAAA),
                                  const SizedBox(height: Dimensions.padding_5),
                                  Padding(
                                    padding: const EdgeInsets.only(left: Dimensions.padding_10),
                                    child: IntrinsicHeight(
                                      child: Row(
                                        children: [
                                          Expanded(
                                              child: Center(
                                            child: Padding(
                                              padding: const EdgeInsets.only(top: 10, left: 20, right: 20),
                                              child: Row(
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  InkWell(
                                                    onTap: () {
                                                      Utils.makePhoneCall(vm.trip?.bookingFor?.toUpperCase() == "OTHERS"
                                                          ? vm.trip?.othersPhoneNumber ?? vm.trip?.user?.phoneNumber ?? ""
                                                          : vm.trip?.user?.phoneNumber ?? "");
                                                    },
                                                    child: SvgPicture.asset(
                                                      CustomImages.call,
                                                      height: 34,
                                                      width: 34,
                                                    ),
                                                  ),
                                                  const SizedBox(width: Dimensions.padding_15),
                                                  Text("Call", style: Theme.of(context).textTheme.bodySmall)
                                                ],
                                              ),
                                            ),
                                          )),
                                          Container(width: 0.5, color: CustomColors.clr_AAAAAA),
                                          Expanded(
                                              child: Center(
                                            child: Padding(
                                              padding: const EdgeInsets.only(top: 10, left: 20, right: 20),
                                              child: InkWell(
                                                onTap: () {
                                                  if (!vm.isBottomSheetCollapsed) {
                                                    _toggleBottomSheet(); // animated collapse
                                                  }
                                                  vm.recenterNow();
                                                },
                                                child: Row(
                                                  mainAxisSize: MainAxisSize.min,
                                                  children: [
                                                    Text(vm.translation.txtMap, style: Theme.of(context).textTheme.bodySmall),
                                                    const SizedBox(width: Dimensions.padding_15),
                                                    SvgPicture.asset(CustomImages.navigate, height: 34, width: 34),
                                                  ],
                                                ),
                                              ),
                                            ),
                                          )),
                                        ],
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: Dimensions.padding_15),
                                  Visibility(
                                    visible: vm.tripStatus != TRIPSTATUS.TRIP_STARTED,
                                    child: ProceedButton(
                                      btnTxt: vm.tripButtonTxt,
                                      onPressed: vm.tripStatusChange,
                                      minimumSize: Size(MediaQuery.sizeOf(context).width * 0.83, 52),
                                      maxSize: Size(MediaQuery.sizeOf(context).width * 0.83, 52),
                                    ),
                                  ),
                                  (vm.trip?.tripType?.toUpperCase() == "RENTAL" && vm.meterImageUrl == null)
                                      ? Visibility(
                                          visible: vm.tripStatus == TRIPSTATUS.TRIP_STARTED,
                                          child: Padding(
                                              padding: const EdgeInsets.symmetric(horizontal: Dimensions.padding_20),
                                              child: ProceedButton(
                                                btnTxt: vm.translation.txtUploadEndMeter,
                                                onPressed: () {
                                                  final meterDataMap = <String, dynamic>{};
                                                  meterDataMap[AppConstants.tripStatus] = vm.tripStatus;
                                                  meterDataMap[AppConstants.userId] = vm.trip?.user?.sId;
                                                  meterDataMap[AppConstants.unit] = vm.trip?.unit;
                                                  if (vm.tripStatus == TRIPSTATUS.TRIP_STARTED) {
                                                    meterDataMap[AppConstants.distanceUnit] = vm.startKm;
                                                  }

                                                  vm.moveAndWait(CustomRouterConfig.meterUploadScreen, args: meterDataMap).then((onValue) {
                                                    if (onValue != null) {
                                                      setState(() {
                                                        var files = onValue['files'];
                                                        var km = onValue['km'];

                                                        vm.meterValue = km ?? "0";
                                                        vm.meterImageUrl = files;
                                                      });
                                                    }
                                                  });
                                                },
                                                minimumSize: Size(MediaQuery.sizeOf(context).width * 0.83, 52),
                                                maxSize: Size(MediaQuery.sizeOf(context).width * 0.83, 52),
                                              )))
                                      : const SizedBox(),
                                  (vm.trip?.tripType?.toUpperCase() == AppConstants.local.toUpperCase() || (vm.trip?.tripType?.toUpperCase() == "RENTAL" && vm.meterImageUrl != null))
                                      ? Visibility(
                                          visible: vm.tripStatus == TRIPSTATUS.TRIP_STARTED,
                                          child: Padding(
                                            padding: const EdgeInsets.symmetric(horizontal: Dimensions.padding_20),
                                            child: SliderButton(
                                                onCompleted: () {
                                                  if ((vm.trip?.tripType?.toUpperCase() == "RENTAL" && vm.meterImageUrl != null)) {
                                                    vm.onEndTripFormData();
                                                  } else {
                                                    vm.onEndTrip();
                                                  }
                                                },
                                                vm: vm,
                                                icon: const Icon(
                                                  Icons.arrow_forward_rounded,
                                                  color: Colors.white,
                                                  size: 24,
                                                ),
                                                height: Dimensions.padding_55,
                                                text: vm.translation.txtSlideToEndTrip),
                                          ))
                                      : const SizedBox(),
                                  Visibility(visible: vm.tripStatus != TRIPSTATUS.TRIP_STARTED, child: const SizedBox(height: Dimensions.padding_20)),
                                  Visibility(
                                    visible: vm.tripStatus != TRIPSTATUS.TRIP_STARTED,
                                    child: Padding(
                                        padding: const EdgeInsets.symmetric(horizontal: 40.0),
                                        child: SliderButton(
                                          text: vm.translation.txtSlideToCancel,
                                          icon: const Icon(
                                            Icons.close_rounded,
                                            color: Colors.white,
                                            size: 32,
                                          ),
                                          onCompleted: () {
                                            vm.showTripCancelRequestList();
                                          },
                                          vm: vm,
                                          height: 43,
                                          sliderIconColor: Colors.black,
                                        )),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            );
          }),
        ));
  }

  void adjustMapPadding() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_containerKey.currentContext != null) {
        final RenderBox containerBox = _containerKey.currentContext!.findRenderObject() as RenderBox;
        setState(() {});
      }
    });
  }
}
