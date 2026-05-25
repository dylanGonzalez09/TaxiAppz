import 'package:taxiappzpro/network/response_models/req_in_pro_model.dart';
import 'package:taxiappzpro/utils/preference_helper.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:taxiappzpro/bottom_sheets/trip_request_bs/trip_request_vm.dart';
import 'package:taxiappzpro/components/address_view.dart';
import 'package:taxiappzpro/components/slider_button.dart';
import 'package:taxiappzpro/network/response_models/trips_model.dart';
import 'package:taxiappzpro/utils/custom_colors.dart';
import '../../components/new_address_view.dart';
import '../../utils/notification_helper.dart';

class TripRequestBs extends StatefulWidget {
  final RequestInProModel requestInProModel;
  final TripModel tripsModel;
  final Function()? closeBottomSheet;

  const TripRequestBs(
      {super.key, required this.tripsModel, this.closeBottomSheet, required this.requestInProModel});

  @override
  State<TripRequestBs> createState() => _TripRequestBsState();
}

class _TripRequestBsState extends State<TripRequestBs> {
  final vm = TripRequestVm();
  String? estimatedAmnt;
  String? avgRating;

  @override
  void initState() {
    estimatedAmnt = vm.preference.getString(PreferenceHelper.estimatedAmount);
    avgRating = vm.preference.getString(PreferenceHelper.avgRating);

    vm.closeBottomSheet = widget.closeBottomSheet;
    vm.tripModel = widget.tripsModel;
    vm.requestInProModel = widget.requestInProModel;
    vm.displayTimer = 60;
    super.initState();
    Future.delayed(Duration.zero, () {
      flutterLocalNotificationsPlugin.cancelAll();
      vm.updateToMqtt(true);
    });
    vm.startTimer();
  }

  @override
  void dispose() {
    vm.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<TripRequestVm>.value(
      value: vm,
      child: Consumer<TripRequestVm>(
        builder: (context, vm, _) {
          return PopScope(
            canPop: false,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Align(
                    alignment: Alignment.topRight,
                    child: InkWell(
                      onTap: () {
                        showDialog(
                          context: context,
                          builder: (BuildContext context) {
                            return AlertDialog(
                              title: const Text(""),
                              content:  Text("${vm.translation.txt_sure_cancelride}?"),
                              actions: [
                                Row(
                                  children: [
                                    Expanded(
                                      child: TextButton(
                                        onPressed: () {
                                          Navigator.of(context).pop();
                                        },
                                        style: ButtonStyle(
                                          backgroundColor: WidgetStateProperty.all(Colors.white),

                                        ),
                                        child: Text(vm.translation.txt_cancel,
                                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                              color: CustomColors.primaryColor
                                          ),),
                                      ),
                                    ),

                                    Expanded(
                                      child: TextButton(
                                        onPressed: () {
                                          Navigator.of(context).pop();
                                          vm.onTripRejected();
                                        },
                                        style: ButtonStyle(
                                          backgroundColor: WidgetStateProperty.all(CustomColors.primaryColor),
                                        ),
                                        child:  Text(vm.translation.txt_Ok,
                                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                          color: Colors.white
                                        ),),
                                      ),
                                    ),
                                  ],
                                ),

                              ],
                            );
                          },
                        );
                      },
                      child: const Icon(Icons.close),
                    ),
                  ),
                  /*Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Flexible(
                        child:

                        Text(
                          "${vm.requestInProModel?.currencySymbol}$estimatedAmnt",
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.black,
                            fontSize: 50,
                            fontWeight: FontWeight.w700,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),


                      ),
                      const SizedBox(width: 3),

                    ],
                  ),
                  Row(mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.star,
                        color: CustomColors.clr_FEA800,
                        size: 22,
                      ),
                      const SizedBox(width: 3),
                      Text(
                        avgRating ?? "",
                        style: Theme.of(context)
                            .textTheme
                            .bodySmall
                            ?.copyWith(color: Colors.black),
                      ),
                    ],
                  ),*/
                  const SizedBox(height: 5),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            "${vm.translation.txtpayment}:",
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.w500,
                                fontSize: 16,
                                color: Color(0xFF1696CB)),
                          ),
                          const SizedBox(width: 5),
                          Expanded(
                            child: Text(
                              vm.tripModel.paymentOpt ?? "",
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  fontWeight: FontWeight.w500,
                                  fontSize: 16,
                                  color: Colors.black),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Text(
                            "${vm.translation.txtVehicleType}:",
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.w500,
                                fontSize: 16,
                                color: Color(0xFF1696CB)),
                          ),
                          const SizedBox(width: 5),
                          Expanded(
                            child: Text(
                              vm.tripModel.vehicleDetails?.vehicleName ?? "",
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.w500,
                                fontSize: 16,
                                color: Colors.black,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 13),
                  NewAddressView(
                    prickUpAddress: vm.tripModel.pickAddress ?? "",
                    dropAddress: vm.tripModel.dropAddress ?? "",
                    tripsModel: vm.tripModel,
                    stopAddress: vm.tripModel.stopAddress ?? '',
                    pickUpDistance: '${vm.getDurationForPickup()} (${vm.getDistanceForPickup()}) ${vm.translation.txt_away}',
                    stopDistance: '${vm.getDurationForStop()} (${vm.getDistanceForStop()})',
                    dropDistance: '${vm.getDurationForDrop()} (${vm.getDistanceForDrop()}) ${vm.translation.txt_Trip}',
                  ),
                  const SizedBox(height: 14),
                  Text(
                    widget.tripsModel.tripType ?? "",
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 20),
                  InkWell(
                    onTap: () {
                      vm.onTripAccept();
                    },
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        CircleAvatar(
                          backgroundColor: CustomColors.primaryColor,
                          radius: 75,
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                vm.displayTimer.toString(),
                                style: Theme.of(context)
                                    .textTheme
                                    .titleLarge
                                    ?.copyWith(fontSize: 60,color: Colors.white),
                              ),
                              Text(
                                vm.translation.txt_Accept,
                                style: Theme.of(context)
                                    .textTheme
                                    .titleLarge
                                    ?.copyWith(
                                        fontSize: 20, color: Colors.white),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(
                          width: 150,
                          height: 150,
                          child: CircularProgressIndicator(
                            strokeWidth: 8,
                            color: CustomColors.clr_3BD101,
                            value: 1,
                          ),
                        ),
                        SizedBox(
                          width: 150,
                          height: 150,
                          child: CircularProgressIndicator(
                            strokeWidth: 8,
                            color: CustomColors.clr_EEEEEE,
                            value: vm.progressValue,
                          ),
                        ),
                      ],
                    ),
                  ),

                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

enum TripResponse { ACCEPT, DECLINE }
