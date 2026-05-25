import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:provider/provider.dart';


import '../../components/drawer_scaffold.dart';
import '../../components/header_view.dart';
import '../../components/places_search_single_item.dart';
import '../../components/submit_button.dart';
import '../../main.dart';
import '../../utils/app_constants.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../../utils/dimensions.dart';
import '../tripscreen/trip_screen_vm.dart';
import 'map_view_vm.dart';

class MapViewScreen extends StatefulWidget {
  final Map<String, dynamic> map;

  const MapViewScreen({super.key, required this.map});

  @override
  State<MapViewScreen> createState() => _MapViewScreenState();
}

class _MapViewScreenState extends State<MapViewScreen> {
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  final vm = MapViewVm();

  @override
  void initState() {
    vm.isPickUpChange = widget.map[AppConstants.isPickChange] == "isPick";
    if (widget.map.containsKey(AppConstants.title)) {
      vm.title = widget.map[AppConstants.title] ?? vm.translation.txt_map_view;
    }
    if (widget.map.isNotEmpty &&
        widget.map.containsKey(AppConstants.latitude) &&
        widget.map[AppConstants.latitude] != null &&
        widget.map.containsKey(AppConstants.longitude) &&
        widget.map[AppConstants.longitude] != null) {
      vm.updatedLatLng = LatLng(widget.map[AppConstants.latitude],
          widget.map[AppConstants.longitude]);
      if (widget.map.containsKey(AppConstants.address)) {
        vm.address = widget.map[AppConstants.address] ?? "";
        vm.searchTextController.text = widget.map[AppConstants.address] ?? "";
      }
      if (widget.map.containsKey(AppConstants.tripAddressChangeType)) {
        final String str = widget.map[AppConstants.tripAddressChangeType];
        vm.markerType = TRIPADDRESSCHANGETYPE.DROP_ADDRESS.name == str
            ? 2
            : TRIPADDRESSCHANGETYPE.STOP_ADDRESS.name == str
                ? 1
                : 0;
      }
      debugPrint("adlkjkjadfhgkjsfdhgkjsdfhgjsdfhgkjsfdhg if");
    } else {
      debugPrint("adlkjkjadfhgkjsfdhgkjsdfhgjsdfhgkjsfdhg else");
      vm.updatedLatLng = vm.getSavedCurrentLocation();

      debugPrint(
          "adlkjkjadfhgkjsfdhgkjsdfhgjsdfhgkjsfdhg else ${vm.updatedLatLng}");
    }
    setState(() {});
    Future.delayed(Duration.zero, () {
      vm.getFavouriteList();
    });
    vm.focusNode.addListener(vm.onFocusChange);

    super.initState();
  }

  @override
  void dispose() {
    vm.isDisposed = true;
    vm.searchTextController.dispose();
    vm.focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DrawerScaffold(
        body: ChangeNotifierProvider<MapViewVm>(
            create: (context) => vm,
            child: Consumer<MapViewVm>(builder: (_, vm, child) {
              return Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: Dimensions.padding_20),
                    child: HeaderView(
                        onBackPressed: (){
                          if(vm.isOutOfZone){
                            vm. showErrorDialog(message: "Selected place currently unavailable");
                          }else{
                            GoRouter.of(navigatorKey.currentState!.context).pop();
                          }
                        },
                        title: vm.title.isNotEmpty == true
                            ? vm.title
                            : vm.translation.txt_map_view),
                  ),
                  Expanded(
                    child: Stack(
                      children: [
                        GoogleMap(
                            zoomControlsEnabled: false,
                            compassEnabled: false,
                            onMapCreated: vm.onMapCreated,
                            onCameraIdle: vm.onCameraIdle,
                            onCameraMove: vm.onCameraMove,
                            initialCameraPosition: CameraPosition(
                                target: vm.updatedLatLng, zoom: 18)),
                        if (!vm.isDataLoading)
                          Positioned(
                              top: 0,
                              bottom: 0,
                              left: 0,
                              right: 0,
                              child: Center(
                                  child: Image.asset(
                                CustomImages.currentLocationMarker,
                                height: 60,
                                width: 60,
                              ))),
                        Column(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  vertical: Dimensions.padding_7,
                                  horizontal: Dimensions.padding_10),
                              margin: const EdgeInsets.symmetric(
                                  horizontal: Dimensions.padding_10,
                                  vertical: Dimensions.padding_20),
                              decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(
                                      Dimensions.padding_10),
                                  color: Colors.white,
                                  boxShadow: [
                                    BoxShadow(
                                        color: CustomColors.clr_414141
                                            .withValues(alpha: 0.2),
                                        spreadRadius: 2,
                                        blurRadius: 4)
                                  ]),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  // const Icon(Icons.location_on_rounded),
                                  // const SizedBox(width: Dimensions.padding_7),
                                  Expanded(
                                    child: AutoScrollTextField(
                                      vm: vm,
                                      controller: vm.searchTextController,
                                      focusNode: vm.focusNode,
                                      onChanged: vm.onTextChange,
                                      hintText:
                                          vm.translation.txt_Search_for_address,
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodySmall
                                          ?.copyWith(fontSize: 16),
                                    ),
                                  )
                                ],
                              ),
                            ),
                            if (vm.placesList?.isNotEmpty == true)
                              Container(
                                margin:
                                    const EdgeInsets.all(Dimensions.padding_10),
                                padding:
                                    const EdgeInsets.all(Dimensions.padding_10),
                                decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(
                                        Dimensions.padding_10)),
                                child: ListView.builder(
                                  shrinkWrap: true,
                                  itemBuilder: (context, index) {
                                    return InkWell(
                                      onTap: () {
                                        vm.onPlacesSelected(
                                            vm.placesList![index]);
                                      },
                                      child: PlacesSearchSingleItem(
                                        model: vm.placesList![index],
                                      ),
                                    );
                                  },
                                  itemCount: vm.placesList?.length,
                                ),
                              )
                          ],
                        ),
                        Positioned(
                            bottom: 0,
                            left: 0,
                            right: 0,
                            child: Padding(
                              padding:
                                  const EdgeInsets.all(Dimensions.padding_20),
                              child: SubmitButton(
                                  buttonText: vm.translation.txt_Confirm,
                                  isEnabled: vm.isButtonEnabled,
                                  onclick: () {
                                    if (vm.isPickUpChange) {
                                      if (!vm.isSearchPlaceSelected) {
                                        vm.checkZoneAddress(
                                            vm.updatedLatLng, true);
                                      } else {
                                        if (!vm.isOutOfZone) {
                                          vm.pop(args: {
                                            "address":
                                                vm.searchTextController.text,
                                            "latLng": vm.updatedLatLng
                                          });
                                        } else {
                                          vm.showErrorDialog(
                                              message:
                                                  "Selected place currently unavailable");
                                        }
                                      }
                                    } else {
                                      vm.pop(args: {
                                        "address": vm.searchTextController.text,
                                        "latLng": vm.updatedLatLng
                                      });
                                    }
                                  }),
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
                    ),
                  )
                ],
              );
            })),
        scaffoldKey: scaffoldKey);
  }
}

class AutoScrollTextField extends StatefulWidget {
  final TextEditingController controller;
  final FocusNode focusNode;
  final Function(String) onChanged;
  final String hintText;
  final TextStyle? style;
  final MapViewVm vm;

  const AutoScrollTextField({
    super.key,
    required this.controller,
    required this.focusNode,
    required this.onChanged,
    required this.hintText,
    this.style,
    required this.vm,
  });

  @override
  _AutoScrollTextFieldState createState() => _AutoScrollTextFieldState();
}

class _AutoScrollTextFieldState extends State<AutoScrollTextField>
    with SingleTickerProviderStateMixin {
  late ScrollController _scrollController;
  late Ticker _ticker;
  double _scrollPosition = 0.0;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _ticker = createTicker(_onTick);
    widget.focusNode.addListener(_handleFocusChange);
    _startAutoScroll();
  }

  @override
  void dispose() {
    _ticker.dispose();
    _scrollController.dispose();
    widget.focusNode.removeListener(_handleFocusChange);
    super.dispose();
  }

  void _handleFocusChange() {
    if (widget.focusNode.hasFocus) {
      _stopAutoScroll();
    } else {
      _startAutoScroll();
    }
  }

  void _startAutoScroll() {
    _ticker.start();
  }

  void _stopAutoScroll() {
    _ticker.stop();
  }

  void _onTick(Duration elapsed) {
    if (_scrollController.hasClients) {
      final maxScrollExtent = _scrollController.position.maxScrollExtent;
      _scrollPosition += 0.2;

      if (_scrollPosition >= maxScrollExtent) {
        _scrollPosition = 0.0;
      }

      _scrollController.animateTo(
        _scrollPosition,
        duration: const Duration(milliseconds: 16),
        curve: Curves.easeInOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Icon(Icons.location_on_rounded, color: Colors.black),
        Expanded(
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            controller: _scrollController,
            child: ConstrainedBox(
              constraints: BoxConstraints(
                minWidth: MediaQuery.of(context).size.width,
              ),
              child: IntrinsicWidth(
                child: TextField(
                  controller: widget.controller,
                  focusNode: widget.focusNode,
                  onChanged: widget.onChanged,
                  style: widget.style ??
                      Theme.of(context)
                          .textTheme
                          .bodySmall
                          ?.copyWith(fontSize: 16),
                  cursorHeight: 18,
                  cursorColor: CustomColors.primaryColor,
                  decoration: InputDecoration(
                    hintText: widget.hintText,
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.zero,
                  ),
                ),
              ),
            ),
          ),
        ),
        if (widget.controller.text.isNotEmpty)
          GestureDetector(
            onTap: () {
              // widget.vm.stopAutoScroll();

              // Safely reset position and clear
              // widget.vm.scrollPosition = 0.0;
              // widget.vm.scrollController?.animateTo(
              //   0.0,
              //   duration: const Duration(milliseconds: 16),
              //   curve: Curves.easeInOut,
              // );

              widget.vm.clear(false);
              widget.controller.clear();
              widget.onChanged('');
            },
            child: const Icon(Icons.clear, color: Colors.grey),
          ),
      ],
    );
  }
}

// class AutoScrollTextField extends StatefulWidget {
//   final TextEditingController controller;
//   final FocusNode focusNode;
//   final Function(String) onChanged;
//   final String hintText;
//   final TextStyle? style;
//   final MapViewVm vm;
//
//   const AutoScrollTextField({super.key,
//     required this.controller,
//     required this.focusNode,
//     required this.onChanged,
//     required this.hintText,
//     this.style, required this.vm,
//   });
//
//   @override
//   _AutoScrollTextFieldState createState() => _AutoScrollTextFieldState();
// }
//
// class _AutoScrollTextFieldState extends State<AutoScrollTextField> with SingleTickerProviderStateMixin {
//   // late ScrollController _scrollController;
//   // late Ticker _ticker;
//   // double _scrollPosition = 0.0;
//
//   @override
//   void initState() {
//     super.initState();
//     widget.vm.scrollController = ScrollController();
//     widget.vm.ticker = createTicker(_onTick);
//     widget.focusNode.addListener(handleFocusChange);
//     _startAutoScroll();
//   }
//
//   @override
//   void dispose() {
//     widget.vm.ticker?.dispose();
//     widget.vm.scrollController?.dispose();
//     widget.focusNode.removeListener(handleFocusChange);
//     super.dispose();
//   }
//
//   void handleFocusChange() {
//     if (widget.focusNode.hasFocus) {
//       _stopAutoScroll();
//     } else {
//       _startAutoScroll();
//     }
//   }
//
//   void _startAutoScroll() {
//     widget.vm.ticker?.start();
//   }
//
//   void _stopAutoScroll() {
//     widget.vm.ticker?.stop();
//   }
//
//   void _onTick(Duration elapsed) {
//     if (widget.vm.scrollController?.hasClients == true) {
//       final maxScrollExtent = widget.vm.scrollController?.position.maxScrollExtent;
//       widget.vm.scrollPosition = widget.vm.scrollPosition!+ 0.2;
//
//       if (widget.vm.scrollPosition! >= maxScrollExtent!) {
//         widget.vm.scrollPosition = 0.0;
//       }
//
//       widget.vm.scrollController?.animateTo(
//         widget.vm.scrollPosition!,
//         duration: const Duration(milliseconds: 16),
//         curve: Curves.easeInOut,
//       );
//     }
//   }
//
//   @override
//   Widget build(BuildContext context) {
//     return Row(
//       children: [
//         // Prefix icon
//         const Icon(Icons.location_on_rounded, color: Colors.black),
//
//         // TextField with horizontal scroll
//         Expanded(
//           child: SingleChildScrollView(
//             scrollDirection: Axis.horizontal,
//             controller: widget.vm.scrollController,
//             child: ConstrainedBox(
//               constraints: BoxConstraints(
//                 minWidth: MediaQuery.of(context).size.width,
//               ),
//               child: IntrinsicWidth(
//                 child: TextField(
//                   controller: widget.controller,
//                   focusNode: widget.focusNode,
//                   onChanged: widget.onChanged,
//                   style: widget.style ??
//                       Theme.of(context)
//                           .textTheme
//                           .bodySmall
//                           ?.copyWith(fontSize: 16),
//                   cursorHeight: 18,
//                   cursorColor: CustomColors.primaryColor,
//                   decoration: InputDecoration(
//                     hintText: widget.hintText,
//                     border: InputBorder.none,
//                     contentPadding: EdgeInsets.zero, // No internal padding
//                   ),
//                 ),
//               ),
//             ),
//           ),
//         ),
//
//         // Suffix icon
//         if (widget.controller.text.isNotEmpty)
//           GestureDetector(
//             onTap: () {
//               _stopAutoScroll();
//               widget.vm.scrollPosition = 1;
//               widget.vm.scrollController?.animateTo(
//                 widget.vm.scrollPosition!,
//                 duration: const Duration(milliseconds: 16),
//                 curve: Curves.easeInOut,
//               );
//               widget.vm.clear();
//               widget.controller.clear();
//             },
//             child: const Icon(Icons.clear, color: Colors.grey),
//           ),
//       ],
//     );
//   }
// }
