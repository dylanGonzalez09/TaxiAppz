import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:provider/provider.dart';
import '../../components/drawer_scaffold.dart';
import '../../components/places_search_single_item.dart';
import '../../utils/app_constants.dart';
import '../../utils/custom_colors.dart';
import '../../utils/dimensions.dart';
import '../../components/custom_bar.dart';
import '../../components/submit_button.dart';
import '../../main.dart';
import '../../utils/custom_images.dart';
import '../../utils/custom_router.dart';
import 'destination_components/address_view.dart';
import 'destination_components/favourites_view.dart';
import 'destination_components/recent_view.dart';
import 'destination_vm.dart';

class DestinationScreen extends StatefulWidget {
  final Map<String, dynamic> args;

  const DestinationScreen({super.key, required this.args});

  @override
  State<DestinationScreen> createState() => _DestinationScreenState();
}

class _DestinationScreenState extends State<DestinationScreen> with RouteAware {
  final vm = DestinationVm();
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void didPopNext() {
    super.didPopNext();
    if (AppConstants.isBookingForOthersChanged) {
      vm.riderName = AppConstants.bookingForOthersRiderName;
      vm.phoneNumber = AppConstants.bookingForOthersRiderPhoneNumber;
      setState(() {});
    }
    AppConstants.isBookingForOthersChanged = false;
    AppConstants.bookingForOthersRiderPhoneNumber = "";
    AppConstants.bookingForOthersRiderName = "";
  }

  @override
  void initState() {
    vm.setInitialData(widget.args);
    vm.dropController.addListener(vm.onDropAddressListener);
    vm.stopController.addListener(vm.onStopAddressListener);
    vm.stopFocusNode.addListener(vm.onStopFocusChange);
    vm.dropFocusNode.addListener(vm.onDropFocusChange);
    super.initState();
    Future.delayed(Duration.zero, () {
      vm.getRecentFavourites();
    });
  }

  @override
  void dispose() {
    routeObserver.unsubscribe(this);
    vm.isDisposed = true;
    super.dispose();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
  }

  @override
  Widget build(BuildContext context) {
    routeObserver.subscribe(this, ModalRoute.of(context)!);
    return DrawerScaffold(
        scaffoldKey: scaffoldKey,
        body: ChangeNotifierProvider<DestinationVm>(
          create: (context) => vm,
          child: Consumer<DestinationVm>(
            builder: (_, vm, child) {
              return Column(
                children: [
                  CustomBar(
                    menuTap: () {
                      Navigator.of(context).pop();
                    },
                    endTap: () {},
                    title: vm.translation.txt_destination,
                    vm: vm,
                  ),
                  Expanded(
                    child: SingleChildScrollView(
                      child: Column(
                        children: [
                          AddressView(vm: vm),
                          InkWell(
                            onTap: () async {
                              final mapViewMapData = <String, dynamic>{};
                              mapViewMapData[AppConstants.isPickChange] =
                                  "isDrop";
                              mapViewMapData[AppConstants.address] =
                                  vm.pickupLocation;
                              mapViewMapData[AppConstants.latitude] =
                                  vm.pickupLatLng.latitude;
                              mapViewMapData[AppConstants.longitude] =
                                  vm.pickupLatLng.longitude;
                              final data = await vm.moveAndWait(
                                  CustomRouter.mapView,
                                  args: mapViewMapData);
                              if (data is Map) {
                                vm.handleDropArgs(data);
                              }
                            },
                            child: Container(
                              margin: const EdgeInsets.symmetric(
                                  horizontal: Dimensions.padding_15),
                              child: Row(
                                children: [
                                  SvgPicture.asset(
                                    CustomImages.navigate,
                                    width: 20,
                                    height: 20,
                                    colorFilter: const ColorFilter.mode(
                                        Colors.black, BlendMode.srcIn),
                                  ),
                                  const SizedBox(width: 10),
                                  Text(
                                    vm.translation.txt_Select_from_map,
                                    style:
                                        Theme.of(context).textTheme.bodySmall,
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: Dimensions.padding_15),
                          vm.isDataLoading
                              ? const Center(
                                  child: SizedBox(
                                    height: 32,
                                    width: 32,
                                    child: CircularProgressIndicator(
                                      color: CustomColors.primaryColor,
                                    ),
                                  ),
                                )
                              : Column(
                                  children: [
                                    if (vm.placesList.isNotEmpty)
                                      Padding(
                                        padding: const EdgeInsets.only(
                                            left: Dimensions.padding_10,
                                            right: Dimensions.padding_10,
                                            bottom: Dimensions.padding_10),
                                        child: ListView.separated(
                                          itemCount: vm.placesList.length,
                                          shrinkWrap: true,
                                          physics:
                                              const NeverScrollableScrollPhysics(),
                                          itemBuilder: (context, index) {
                                            return InkWell(
                                              onTap: () {
                                                vm.onPlacesSelected(
                                                    vm.placesList[index]);
                                              },
                                              child: PlacesSearchSingleItem(
                                                  model: vm.placesList[index]),
                                            );
                                          },
                                          separatorBuilder:
                                              (BuildContext context,
                                                  int index) {
                                            return Padding(
                                              padding: const EdgeInsets.only(
                                                  top: 8.0,
                                                  right: 10,
                                                  left: 10,
                                                  bottom: 8),
                                              child: Container(
                                                height: 0.5,
                                                color: CustomColors.clr_919191,
                                              ),
                                            );
                                          },
                                        ),
                                      ),
                                    if (vm.recent.isNotEmpty)
                                      RecentView(vm: vm),
                                    const SizedBox(
                                        height: Dimensions.padding_15),
                                    if (vm.favourites.isNotEmpty)
                                      FavouritesView(vm: vm),
                                    const SizedBox(
                                        height: Dimensions.padding_10)
                                  ],
                                )
                        ],
                      ),
                    ),
                  ),
                  Padding(
                      padding: const EdgeInsets.all(Dimensions.padding_20),
                      child: SubmitButton(
                        buttonText: vm.translation.txt_Submit,
                        isEnabled: vm.isButtonEnabled,
                        onclick: () {
                          final args = <String, dynamic>{
                            'pickup': vm.pickupModel,
                            'drop': vm.dropModel,
                          };
                          if (vm.stopModel != null &&
                              vm.stopController.text.isNotEmpty) {
                            args['stop'] = vm.stopModel;
                          }
                          if (vm.riderName.toUpperCase() !=
                              AppConstants.myself.toUpperCase()) {
                            args[AppConstants.riderName] = vm.riderName;
                            args[AppConstants.phoneNumber] = vm.phoneNumber;
                          }
                          vm.moveToNamed(CustomRouter.rideConfirm, args: args);
                        },
                      )),
                ],
              );
            },
          ),
        ));
  }
}
