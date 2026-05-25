import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:user/ui/tripscreen/trip_screen_vm.dart';
import '../../components/drawer_scaffold.dart';
import '../../components/pickup_view.dart';
import '../../components/slider_button.dart';
import '../../components/sos_view.dart';
import '../../network/response_models/trip_model.dart';
import '../../utils/app_constants.dart';
import '../../utils/app_url.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../../utils/custom_router.dart';
import '../../utils/dimensions.dart';
import '../../utils/preference_helper.dart';
import '../../utils/utils.dart';

class TripScreen extends StatefulWidget {
  final Trip? trip;

  const TripScreen({super.key, this.trip});

  @override
  State<StatefulWidget> createState() => TripScreenState();
}

class TripScreenState extends State<TripScreen> {
  final vm = TripScreenVm();
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  final GlobalKey _containerKey = GlobalKey();
  double _containerHeight = 0.0;
  late SharedPreferences _prefs;

  @override
  void initState() {
    vm.mqtt.unSubscribe(AppConstants.listenDrivers);
    vm.setInitialData(widget.trip);
    adjustMapPadding();
    vm.startLocation();
    // vm.listenForTrips();
    Future.delayed(Duration.zero, () {
      if (!mounted || vm.isDisposed) return;
      vm.getTripDriver();
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || vm.isDisposed) return;
      if (vm.trip?.locationChangeModel != null) {
        vm.showTripChangeDialog();
      }
    });
    vm.listenForChatMessages();
    super.initState();
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => DrawerScaffold(
      onBackPressedEnable: false,
      vm: vm,
      scaffoldKey: scaffoldKey,
      body: ChangeNotifierProvider<TripScreenVm>(
        create: (context) => vm,
        child: Consumer<TripScreenVm>(builder: (_, vm, child) {
          return Stack(
            children: [
              Padding(
                padding: EdgeInsets.only(
                    bottom: _containerHeight > 10
                        ? vm.tripStatus == TRIPSTATUS.TRIP_START
                            ? vm.trip?.tripType?.toUpperCase() ==
                                    AppConstants.rental.toUpperCase()
                                ? _containerHeight - 140
                                : _containerHeight - 75
                            : _containerHeight - 10
                        : 0),
                child: GoogleMap(
                  initialCameraPosition: vm.initialLocation,
                  zoomControlsEnabled: false,
                  myLocationButtonEnabled: false,
                  myLocationEnabled: false,
                  compassEnabled: false,
                  onMapCreated: vm.onMapCreated,
                  markers: vm.markers,
                  polylines: Set<Polyline>.of(vm.polylines.values),
                ),
              ),
              Align(
                alignment: Alignment.topCenter,
                child: Container(
                  height: Dimensions.padding_60,
                  width: vm.getMatchParentWidth(context),
                  decoration: const BoxDecoration(
                      borderRadius: BorderRadius.only(
                          bottomLeft: Radius.circular(15),
                          bottomRight: Radius.circular(15)),
                      color: Colors.white,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.grey,
                          blurRadius: 30,
                          offset: Offset(1, 1),
                        ),
                      ]),
                  child: Padding(
                    padding: const EdgeInsets.only(left: 20, right: 20),
                    child: Stack(
                      children: [
                        Align(
                          alignment: Alignment.centerLeft,
                          child: InkWell(
                            onTap: () => scaffoldKey.currentState!.openDrawer(),
                            child: SvgPicture.asset(
                              CustomImages.menuIcon,
                              width: 25,
                              height: 15,
                              colorFilter: const ColorFilter.mode(
                                  CustomColors.clr_000000, BlendMode.srcIn),
                            ),
                          ),
                        ),
                        Align(
                            alignment: Alignment.center,
                            child: Text(vm.trip?.requestNumber ?? "",
                                style: Theme.of(context)
                                    .textTheme
                                    .titleLarge
                                    ?.copyWith(
                                        color: Colors.red,
                                        fontSize: Dimensions.padding_18))),
                        Align(
                          alignment: Alignment.centerRight,
                          child: vm.trip?.tripType?.toUpperCase() ==
                                  AppConstants.local.toUpperCase()
                              ? Visibility(
                                  visible: (vm.tripStatus ==
                                          TRIPSTATUS.TRIP_ARRIVED ||
                                      vm.tripStatus == TRIPSTATUS.TRIP_START),
                                  child: Column(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceEvenly,
                                    mainAxisSize: MainAxisSize.max,
                                    children: [
                                      Text(vm.translation.txt_waiting_time,
                                          style: Theme.of(context)
                                              .textTheme
                                              .titleLarge
                                              ?.copyWith(
                                                  fontSize:
                                                      Dimensions.padding_12)),
                                      Text(
                                          vm.formatHourNotZeroDuration(
                                              vm.waitingTime),
                                          style: Theme.of(context)
                                              .textTheme
                                              .titleLarge
                                              ?.copyWith(
                                                  fontSize:
                                                      Dimensions.padding_15))
                                    ],
                                  ))
                              : Visibility(
                                  visible:
                                      (vm.tripStatus == TRIPSTATUS.TRIP_START),
                                  child: Column(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceEvenly,
                                    mainAxisSize: MainAxisSize.max,
                                    children: [
                                      Text(vm.translation.txt_trip_time,
                                          style: Theme.of(context)
                                              .textTheme
                                              .titleLarge
                                              ?.copyWith(
                                                  fontSize:
                                                      Dimensions.padding_12)),
                                      Text(
                                          vm.formatHourNotZeroDuration(
                                              vm.waitingTime),
                                          style: Theme.of(context)
                                              .textTheme
                                              .titleLarge
                                              ?.copyWith(
                                                  fontSize:
                                                      Dimensions.padding_15))
                                    ],
                                  )),
                        )
                      ],
                    ),
                  ),
                ),
              ),
              Align(
                alignment: Alignment.bottomCenter,
                child: GestureDetector(
                  onVerticalDragEnd: (details) {
                    if (details.velocity.pixelsPerSecond.dy > 0) {
                      vm.changeVisibilityStatus();
                      adjustMapPadding();
                    } else if (details.velocity.pixelsPerSecond.dy < 0) {
                      vm.changeVisibilityStatus();
                      adjustMapPadding();
                    }
                  },
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Padding(
                            padding:
                                const EdgeInsets.only(bottom: 15, left: 15),
                            child: InkWell(
                                onTap: () =>
                                    vm.moveToNamed(CustomRouter.sosScreen),
                                child: const SosView()),
                          ),
                          Expanded(
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Visibility(
                                  visible: vm.trip?.tripType?.toUpperCase() ==
                                          AppConstants.rental.toUpperCase() &&
                                      vm.tripStatus == TRIPSTATUS.TRIP_START,
                                  child: InkWell(
                                      onTap: () => vm.showMeterUpload(
                                          vm.tripStatus ==
                                                  TRIPSTATUS.TRIP_COMPLETED
                                              ? vm.trip?.endKm ?? ""
                                              : vm.trip?.startKm ?? "",
                                          "${AppConstants.imageBaseUrl}${vm.tripStatus == TRIPSTATUS.TRIP_COMPLETED ? vm.trip?.endKmImage : vm.trip?.startKmImage}",
                                          vm.trip?.isCompleted == true),
                                      child: Container(
                                          alignment: Alignment.center,
                                          padding: const EdgeInsets.all(
                                              Dimensions.padding_4),
                                          margin: const EdgeInsets.only(
                                              bottom: 15, right: 10),
                                          width: Dimensions.padding_40,
                                          height: Dimensions.padding_40,
                                          decoration: BoxDecoration(
                                              color: Colors.white,
                                              borderRadius:
                                                  BorderRadius.circular(
                                                      Dimensions.padding_20)),
                                          child: SvgPicture.asset(
                                              fit: BoxFit.contain,
                                              CustomImages.icDistanceUnit))),
                                ),
                                if (vm.tripStatus != TRIPSTATUS.TRIP_COMPLETED)
                                  Flexible(
                                    child: Container(
                                      margin: const EdgeInsets.only(right: 12),
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 12, vertical: 6),
                                      decoration: const BoxDecoration(
                                        color:
                                            CustomColors.svgImageColorDarkBlue,
                                        borderRadius: BorderRadius.only(
                                          topLeft: Radius.circular(10),
                                          topRight: Radius.circular(10),
                                        ),
                                      ),
                                      child: Builder(
                                        builder: (_) {
                                          if (vm.tripStatus ==
                                              TRIPSTATUS.TRIP_ACCEPTED) {
                                            return Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Flexible(
                                                    child: Text(
                                                  vm.translation.txt_arrived_in,
                                                  maxLines: 1,
                                                  overflow:
                                                      TextOverflow.ellipsis,
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .bodyLarge
                                                      ?.copyWith(
                                                        fontSize: 15,
                                                        color: Colors.white,
                                                      ),
                                                )),
                                                Flexible(
                                                    child: Text(
                                                  " ${vm.arriveDuration} ${vm.translation.txt_minute}",
                                                  maxLines: 1,
                                                  overflow:
                                                      TextOverflow.ellipsis,
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .bodyLarge
                                                      ?.copyWith(
                                                        fontSize: 15,
                                                        fontWeight:
                                                            FontWeight.w600,
                                                        color: Colors.white,
                                                      ),
                                                )),
                                              ],
                                            );
                                          }
                                          if (vm.tripStatus ==
                                              TRIPSTATUS.TRIP_ARRIVED) {
                                            return Text(
                                              vm.translation.txt_arrived,
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .bodyLarge
                                                  ?.copyWith(
                                                    fontSize: 15,
                                                    color: Colors.white,
                                                  ),
                                            );
                                          }
                                          // if (vm.tripStatus == TRIPSTATUS.TRIP_START &&
                                          //     vm.destinationDuration > 0) {
                                          //   return Text.rich(
                                          //     TextSpan(
                                          //       children: [
                                          //         TextSpan(
                                          //           text: vm.translation.txt_destination_time,
                                          //           style: Theme.of(context)
                                          //               .textTheme
                                          //               .bodyLarge
                                          //               ?.copyWith(
                                          //             fontSize: 15,
                                          //             color: Colors.white,
                                          //           ),
                                          //         ),
                                          //         TextSpan(
                                          //           text:
                                          //               " ${vm.destinationDuration} ${vm.translation.txt_minute}",
                                          //           style: Theme.of(context)
                                          //               .textTheme
                                          //               .bodyLarge
                                          //               ?.copyWith(
                                          //             fontSize: 15,
                                          //             fontWeight: FontWeight.w600,
                                          //             color: Colors.white,
                                          //           ),
                                          //         ),
                                          //       ],
                                          //     ),
                                          //     maxLines: 2,
                                          //     softWrap: true,
                                          //   );
                                          // }
                                          return const SizedBox();
                                        },
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      Container(
                        key: _containerKey,
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 15, vertical: 15),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.grey.withValues(alpha: 0.5),
                              spreadRadius: 1,
                              blurRadius: 5,
                              offset: const Offset(
                                  2, 0), // changes position of shadow
                            ),
                          ],
                          borderRadius: const BorderRadius.only(
                              topRight: Radius.circular(20),
                              topLeft: Radius.circular(20)),
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Visibility(
                              visible: vm.isTripContentHidden,
                              child: InkWell(
                                onTap: () {
                                  vm.changeVisibilityStatus();
                                },
                                child: Container(
                                  height: 3,
                                  width: 36,
                                  decoration: BoxDecoration(
                                      color: CustomColors.clr_AAAAAA,
                                      borderRadius: BorderRadius.circular(
                                          Dimensions.padding_5)),
                                  margin: const EdgeInsets.only(left: 10),
                                ),
                              ),
                            ),
                            Visibility(
                              visible: !vm.isTripContentHidden,
                              child: Container(
                                width: vm.getMatchParentWidth(context),
                                decoration: BoxDecoration(
                                    color: const Color(0xFFFFFFFF),
                                    borderRadius: BorderRadius.circular(10),
                                    boxShadow: [
                                      BoxShadow(
                                        color:
                                            Colors.grey.withValues(alpha: 0.5),
                                        spreadRadius: 1,
                                        blurRadius: 5,
                                        offset: const Offset(
                                            0, 0), // changes position of shadow
                                      ),
                                    ]),
                                padding:
                                    const EdgeInsets.all(Dimensions.padding_20),
                                margin: const EdgeInsets.only(
                                    bottom: Dimensions.padding_20),
                                child: Row(
                                  children: [
                                    Expanded(
                                      flex: 2,
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            vm.tripStatus ==
                                                    TRIPSTATUS.TRIP_START
                                                ? vm.translation
                                                    .txt_Enjoy_your_ride
                                                : vm.translation
                                                    .txt_We_Found_you_a_driver,
                                            style: Theme.of(context)
                                                .textTheme
                                                .labelSmall
                                                ?.copyWith(fontSize: 14),
                                          ),
                                          const SizedBox(
                                            height: Dimensions.padding_5,
                                          ),
                                          Text(
                                            vm.tripStatus ==
                                                    TRIPSTATUS.TRIP_START
                                                ? vm.translation
                                                    .txt_Driver_started_to_your_location
                                                : vm.translation
                                                    .txt_Driver_accepted,
                                            style: Theme.of(context)
                                                .textTheme
                                                .labelSmall
                                                ?.copyWith(
                                                    fontSize:
                                                        Dimensions.padding_12),
                                          )
                                        ],
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.all(
                                          Dimensions.padding_5),
                                      decoration: BoxDecoration(
                                        color: CustomColors.primaryColor,
                                        borderRadius: BorderRadius.circular(5),
                                      ),
                                      child: Text(
                                        "${vm.translation.txt_Otp} - ${vm.trip?.requestOtp}",
                                        style: Theme.of(context)
                                            .textTheme
                                            .labelSmall
                                            ?.copyWith(
                                                fontSize: 18,
                                                color: Colors.white),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            Visibility(
                              visible: !vm.isTripContentHidden,
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisAlignment: MainAxisAlignment.start,
                                children: [
                                  const SizedBox(
                                    width: Dimensions.padding_10,
                                  ),
                                  Stack(
                                    children: [
                                      Padding(
                                        padding:
                                            const EdgeInsets.only(left: 8.0),
                                        child: Container(
                                          height: 40,
                                          width: 80,
                                          child: ColorFiltered(
                                            colorFilter: ColorFilter.mode(
                                              Color(
                                                int.tryParse(
                                                      (vm.trip?.driver
                                                                  ?.carColor ??
                                                              "#EEEEEE")
                                                          .replaceFirst(
                                                              '#', '0xFF'),
                                                    ) ??
                                                    0xFFEEEEEE,
                                              ),
                                              BlendMode.srcATop,
                                            ),
                                            child: Image.asset(
                                              CustomImages.tripcar,
                                              fit: BoxFit.fitWidth,
                                            ),
                                          ),
                                        ),
                                      ),
                                      Positioned(
                                        left: -1,
                                        child: Container(
                                          height: Dimensions.padding_40,
                                          width: Dimensions.padding_40,
                                          decoration: BoxDecoration(
                                            shape: BoxShape.circle,
                                            border: Border.all(
                                                color: Colors.white,
                                                width: 2), // white border
                                          ),
                                          child: ClipOval(
                                            child: CachedNetworkImage(
                                              imageUrl:
                                                  "${AppConstants.imageBaseUrl}${vm.trip?.driver?.profilePic ?? vm.trip?.driverDetails?.profilePic}",
                                              height: Dimensions.padding_45,
                                              width: Dimensions.padding_45,
                                              fit: BoxFit.cover,
                                              placeholder: (context, url) =>
                                                  const SizedBox(
                                                height: Dimensions.padding_45,
                                                width: Dimensions.padding_45,
                                                child:
                                                    CircularProgressIndicator(
                                                  color:
                                                      CustomColors.primaryColor,
                                                  strokeWidth:
                                                      Dimensions.padding_2,
                                                ),
                                              ),
                                              errorWidget:
                                                  (context, url, error) =>
                                                      Container(
                                                height: Dimensions.padding_45,
                                                width: Dimensions.padding_45,
                                                decoration: const BoxDecoration(
                                                  shape: BoxShape.circle,
                                                  color: Colors
                                                      .white, // optional background
                                                ),
                                                padding: const EdgeInsets.all(
                                                    Dimensions.padding_5),
                                                child: SvgPicture.asset(
                                                  CustomImages.dummyProfile,
                                                  fit: BoxFit.contain,
                                                ),
                                              ),
                                              fadeInDuration: const Duration(
                                                  milliseconds: 500),
                                              fadeOutDuration: const Duration(
                                                  milliseconds: 500),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(
                                    width: Dimensions.padding_10,
                                  ),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      mainAxisAlignment:
                                          MainAxisAlignment.start,
                                      children: [
                                        Text(
                                          vm.trip?.driver?.carNumber ??
                                              vm.trip?.driverDetails
                                                  ?.carNumber ??
                                              "",
                                          style: Theme.of(context)
                                              .textTheme
                                              .labelSmall!
                                              .copyWith(fontSize: 14),
                                          overflow: TextOverflow.ellipsis,
                                          maxLines: 1,
                                        ),
                                        const SizedBox(
                                            height: Dimensions.padding_1),
                                        Text(
                                          vm.trip?.vehicleDetails?.vehicleName
                                                  ?.toUpperCase() ??
                                              "",
                                          style: Theme.of(context)
                                              .textTheme
                                              .labelSmall
                                              ?.copyWith(fontSize: 12),
                                        ),
                                        const SizedBox(
                                            height: Dimensions.padding_1),
                                        Text(
                                          vm.trip?.driver?.firstName ??
                                              vm.trip?.driverDetails
                                                  ?.firstName ??
                                              "",
                                          style: Theme.of(context)
                                              .textTheme
                                              .labelSmall
                                              ?.copyWith(fontSize: 10),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Row(
                                    children: [
                                      InkWell(
                                        onTap: () {
                                          vm.clearMessageCount();
                                          final driverId =
                                              vm.trip?.driverDetails?.userId;
                                          final userId = vm.trip?.userId;
                                          final userName =
                                              vm.trip?.driver?.firstName;
                                          final tripStartTime =
                                              vm.trip?.tripStartTime;
                                          final reqID = vm.trip?.sId;
                                          vm.moveToNamed(
                                            CustomRouter.chatScreen,
                                            args: {
                                              "driverId": driverId,
                                              "userId": userId,
                                              "userName": userName,
                                              "tripStartTime": tripStartTime,
                                              "reqID": reqID,
                                            },
                                          );
                                        },
                                        child: Stack(
                                          clipBehavior: Clip.none,
                                          children: [
                                            SvgPicture.asset(
                                              CustomImages.msg,
                                              width: Dimensions.padding_34,
                                              height: Dimensions.padding_34,
                                            ),
                                            if (vm.messageCount > 0)
                                              Positioned(
                                                right: -4,
                                                top: -4,
                                                child: Container(
                                                  padding:
                                                      const EdgeInsets.all(4),
                                                  decoration:
                                                      const BoxDecoration(
                                                    color: Colors.red,
                                                    shape: BoxShape.circle,
                                                  ),
                                                  constraints:
                                                      const BoxConstraints(
                                                    minWidth: 18,
                                                    minHeight: 18,
                                                  ),
                                                  child: Text(
                                                    vm.messageCount > 99
                                                        ? vm.trip?.sId ??
                                                            toString()
                                                        : vm.messageCount
                                                            .toString(),
                                                    textAlign: TextAlign.center,
                                                    style: const TextStyle(
                                                      color: Colors.white,
                                                      fontSize: 10,
                                                      fontWeight:
                                                          FontWeight.bold,
                                                    ),
                                                  ),
                                                ),
                                              ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(
                                          width: Dimensions.padding_12),
                                      InkWell(
                                        onTap: () {
                                          vm.makePhoneCall(
                                              "${vm.trip?.driver?.phoneNumber}");
                                        },
                                        child: SvgPicture.asset(
                                          CustomImages.call,
                                          width: Dimensions.padding_34,
                                          height: Dimensions.padding_34,
                                        ),
                                      ),
                                      const SizedBox(
                                          width: Dimensions.padding_10),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            Visibility(
                              visible: !vm.isTripContentHidden,
                              child: const SizedBox(
                                height: Dimensions.padding_15,
                              ),
                            ),
                            Visibility(
                              visible: !vm.isTripContentHidden,
                              child: IntrinsicHeight(
                                child: Visibility(
                                  visible:
                                      vm.tripStatus == TRIPSTATUS.TRIP_START,
                                  child: Row(
                                    children: [
                                      Expanded(
                                        child: Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: [
                                            SvgPicture.asset(
                                              CustomImages.cash,
                                              height: Dimensions.padding_17,
                                              width: Dimensions.padding_17,
                                            ),
                                            const SizedBox(
                                                width: Dimensions.padding_10),
                                            Text(vm.translation.txt_Cash,
                                                style: Theme.of(context)
                                                    .textTheme
                                                    .bodySmall
                                                    ?.copyWith(fontSize: 15))
                                          ],
                                        ),
                                      ),
                                      Container(
                                          margin: const EdgeInsets.symmetric(
                                              horizontal: Dimensions.padding_5),
                                          width: 0.5,
                                          color: CustomColors.clr_AAAAAA),
                                      Visibility(
                                        visible: vm.tripStatus ==
                                                TRIPSTATUS.TRIP_START &&
                                            !vm.isTripContentHidden,
                                        child: Expanded(
                                          child: GestureDetector(
                                            onTap: () => Utils.shareTrip(
                                                "${vm.preference.getString(PreferenceHelper.languageCode) ?? "en"}${AppUrls.shareTripApi}${vm.trip?.sId}"),
                                            child: Row(
                                              mainAxisAlignment:
                                                  MainAxisAlignment.center,
                                              children: [
                                                SvgPicture.asset(
                                                  CustomImages.shareTrip,
                                                  height: Dimensions.padding_24,
                                                  width: Dimensions.padding_24,
                                                ),
                                                const SizedBox(
                                                    width:
                                                        Dimensions.padding_10),
                                                Text(
                                                    vm.translation
                                                        .txt_share_trip,
                                                    style: Theme.of(context)
                                                        .textTheme
                                                        .bodySmall
                                                        ?.copyWith(
                                                            fontSize: 15,
                                                            overflow:
                                                                TextOverflow
                                                                    .ellipsis))
                                              ],
                                            ),
                                          ),
                                        ),
                                      ),
                                      Visibility(
                                        visible: !vm.isTripContentHidden &&
                                            vm.tripStatus ==
                                                TRIPSTATUS.TRIP_START,
                                        child: Container(
                                            margin: const EdgeInsets.symmetric(
                                                horizontal:
                                                    Dimensions.padding_5),
                                            width: 0.5,
                                            color: CustomColors.clr_AAAAAA),
                                      ),
                                      Expanded(
                                        child: Row(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: [
                                            SvgPicture.asset(
                                              CustomImages.promoIcon,
                                              height: Dimensions.padding_19,
                                              width: Dimensions.padding_19,
                                            ),
                                            const SizedBox(
                                                width: Dimensions.padding_10),
                                            Column(
                                              children: [
                                                Expanded(
                                                  child: Text(
                                                      vm.translation.txt_promo,
                                                      style: Theme.of(context)
                                                          .textTheme
                                                          .bodySmall
                                                          ?.copyWith(
                                                              fontSize: 15,
                                                              color: CustomColors
                                                                  .textPlaceholderClr,
                                                              overflow:
                                                                  TextOverflow
                                                                      .ellipsis)),
                                                ),
                                                vm.trip?.promoId != null
                                                    ? Expanded(
                                                        child: Text(
                                                          vm.translation
                                                              .txt_applied,
                                                          style:
                                                              Theme.of(context)
                                                                  .textTheme
                                                                  .bodySmall
                                                                  ?.copyWith(
                                                                    fontSize:
                                                                        12,
                                                                  ),
                                                        ),
                                                      )
                                                    : const SizedBox(),
                                              ],
                                            )
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                            Visibility(
                              visible: !vm.isTripContentHidden &&
                                  !(vm.tripStatus == TRIPSTATUS.TRIP_START &&
                                      vm.trip?.tripType?.toUpperCase() ==
                                          AppConstants.rental.toUpperCase()),
                              child: Container(
                                margin: vm.tripStatus == TRIPSTATUS.TRIP_START
                                    ? const EdgeInsets.symmetric(
                                        horizontal: Dimensions.padding_10,
                                        vertical: Dimensions.padding_15)
                                    : const EdgeInsets.only(
                                        top: Dimensions.padding_10,
                                        bottom: Dimensions.padding_20,
                                        left: Dimensions.padding_10,
                                        right: Dimensions.padding_10),
                                child: PickupView(
                                  address:
                                      vm.tripStatus == TRIPSTATUS.TRIP_START
                                          ? vm.trip?.dropAddress ?? ""
                                          : vm.trip?.pickAddress ?? "",
                                  stopAddress: vm.trip?.stopAddress ?? "",
                                  isTripStarted:
                                      vm.tripStatus == TRIPSTATUS.TRIP_START,
                                  vm: vm,
                                ),
                              ),
                            ),
                            Visibility(
                              visible: !vm.isTripContentHidden &&
                                  vm.tripStatus != TRIPSTATUS.TRIP_START,
                              child: Padding(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 25.0),
                                  child: SliderButton(
                                    text: vm.translation.txt_Slide_to_cancel,
                                    icon: const Icon(
                                      Icons.chevron_right_sharp,
                                      color: Colors.white,
                                      size: 35,
                                    ),
                                    onCompleted: () {
                                      vm.showTripCancelRequestList();
                                    },
                                    vm: vm,
                                    height: Dimensions.padding_45,
                                    sliderIconColor: Colors.black,
                                  )),
                            ),
                          ],
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

  void adjustMapPadding() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || _containerKey.currentContext == null) return;
      final renderObject = _containerKey.currentContext!.findRenderObject();
      if (renderObject is! RenderBox) return;
      final RenderBox containerBox = renderObject;
      setState(() {
        _containerHeight = containerBox.size.height;
      });
      debugPrint("containerHeight $_containerHeight");
    });
  }
}
