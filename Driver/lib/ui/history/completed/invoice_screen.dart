import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:screenshot/screenshot.dart';
import 'package:taxiappzpro/utils/app_constants.dart';
import 'package:taxiappzpro/utils/utils.dart';
import '../../../components/drawer_scaffold.dart';
import '../../../components/header_view.dart';
import '../../../components/proceed_button.dart';
import '../../../network/response_models/trips_model.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/dimensions.dart';
import '../../../utils/custom_images.dart';
import '../../dialogs/description_dialog.dart';
import 'invoice_vm.dart';

class InvoiceScreen extends StatefulWidget {
  final TripModel? tripModel;

  const InvoiceScreen({
    super.key,
    this.tripModel,
  });

  @override
  State<InvoiceScreen> createState() => _InvoiceScreen();
}

class _InvoiceScreen extends State<InvoiceScreen> {
  final vm = InvoiceVm();
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.tripModel != null &&
          widget.tripModel?.billingDetails != null) {
        vm.tripModel = widget.tripModel;
        vm.isHistoryInvoice = widget.tripModel?.isHistory == true;
        // if (vm.tripModel?.paymentOpt?.toUpperCase() ==
        //     AppConstants.wallet.toUpperCase() &&
        //     !(vm.tripModel?.isPaid == true)) {
        //   Utils.showToast(vm.translation.txtWalletPaymentFailedDesc);
        // }
        setState(() {});
      } else {
        vm.getReqInProgress();
      }
      //vm.listenForTripChanges();
    });
    super.initState();
  }

  @override
  void dispose() {
  //  vm.listenForTripChangesStream?.cancel();
    vm.isDisposed = true;
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: DrawerScaffold(
        body: SingleChildScrollView(
          child: Padding(
              padding: const EdgeInsets.only(
                left: Dimensions.padding_20,
                right: Dimensions.padding_20,
              ),
              child: ChangeNotifierProvider<InvoiceVm>(
                  create: (context) => vm,
                  child: Consumer<InvoiceVm>(builder: (_, vm, child) {
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        HeaderView(
                          title: vm.translation.txtCompleted,
                          onBackPressed: () {
                            GoRouter.of(context).pop();
                          },
                          showBackButton: vm.isHistoryInvoice,
                        ),
                        Container(
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: CustomColors.primaryColor,
                              width: 2,
                            ),
                            borderRadius: BorderRadius.circular(10.0),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(5),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(10),
                                  child: Image.network(
                                    '${AppConstants.imageBaseUrl}${vm.tripModel?.user?.profilePic}',
                                    fit: BoxFit.cover,
                                    width: 60,
                                    height: 60,
                                    errorBuilder: (c, e, t) => Container(
                                      padding: const EdgeInsets.all(
                                          Dimensions.padding_5),
                                      width: 60,
                                      height: 60,
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(
                                            Dimensions.padding_10),
                                        border: Border.all(
                                            color: CustomColors.primaryColor),
                                      ),
                                      child: SvgPicture.asset(
                                        CustomImages.myProfile,
                                        fit: BoxFit.contain,
                                      ),
                                    ),
                                    loadingBuilder: (BuildContext context,
                                        Widget child,
                                        ImageChunkEvent? loadingProgress) {
                                      if (loadingProgress == null) {
                                        return child;
                                      } else {
                                        return Center(
                                          child: CircularProgressIndicator(
                                            value: loadingProgress
                                                .expectedTotalBytes !=
                                                null
                                                ? loadingProgress
                                                .cumulativeBytesLoaded /
                                                loadingProgress
                                                    .expectedTotalBytes!
                                                : null,
                                          ),
                                        );
                                      }
                                    },
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        vm.tripModel?.bookingFor
                                            ?.toUpperCase() ==
                                            "OTHERS"
                                            ? vm.tripModel?.othersName ?? ""
                                            : vm.tripModel?.user?.firstName ??
                                            '',
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 14,
                                        ),
                                      ),
                                      Text(
                                        vm.tripModel?.driverDetails?.carNumber
                                            .toString() ??
                                            '',
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 14,
                                        ),
                                      ),
                                      Text(
                                        "${vm.translation.txtBookingId} : ${vm.tripModel?.requestNumber}",
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 14,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Column(
                                  children: [
                                    Image.network(
                                      '${AppConstants.imageBaseUrl}${vm.tripModel?.vehicleDetails?.highlightImage ?? vm.tripModel?.vehicleModelDetails?.image ?? vm.tripModel?.vehicleDetails?.image}',
                                      fit: BoxFit.cover,
                                      width: 30,
                                      height: 30,
                                      errorBuilder: (c, e, t) =>
                                          SvgPicture.asset(
                                              CustomImages
                                                  .vehicleTypePlaceHolder,
                                              width: 30,
                                              height: 30),
                                      loadingBuilder: (BuildContext context,
                                          Widget child,
                                          ImageChunkEvent? loadingProgress) {
                                        if (loadingProgress == null) {
                                          return child;
                                        } else {
                                          return Center(
                                            child: CircularProgressIndicator(
                                              value: loadingProgress
                                                  .expectedTotalBytes !=
                                                  null
                                                  ? loadingProgress
                                                  .cumulativeBytesLoaded /
                                                  loadingProgress
                                                      .expectedTotalBytes!
                                                  : null,
                                            ),
                                          );
                                        }
                                      },
                                    ),
                                    Text(
                                      vm.tripModel?.vehicleDetails
                                          ?.vehicleName ??
                                          '',
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodySmall
                                          ?.copyWith(
                                        color: Colors.black,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(
                          height: 15,
                        ),
                        Container(
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: CustomColors.clr_AAAAAA,
                              width: 1,
                            ),
                            borderRadius: BorderRadius.circular(10.0),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(10),
                            child: Column(
                              children: [
                                Row(
                                  children: [
                                    SizedBox(
                                      width: 13,
                                      height: 13,
                                      child: Image.asset(
                                          CustomImages.pickUpIndicator,
                                          height: 5,
                                          width: 5),
                                    ),
                                    const SizedBox(width: 10),
                                    // Address and Date Column
                                    Expanded(
                                      child: Text(
                                        vm.tripModel?.placesDetails?.first.pickAddress ?? '',
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                Row(
                                  mainAxisAlignment:
                                  MainAxisAlignment.spaceBetween,
                                  children: [
                                    Padding(
                                      padding: const EdgeInsets.only(
                                          left: 25, top: 2),
                                      child: Text(
                                        vm.tripModel?.tripStartTime
                                            ?.isNotEmpty ==
                                            true
                                            ? vm.formatMonthDateYear(
                                            vm.tripModel!.tripStartTime!, 1)
                                            : "",
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 10,
                                        ),
                                      ),
                                    ),
                                    // Time
                                    Text(
                                      vm.tripModel?.tripStartTime?.isNotEmpty ==
                                          true
                                          ? vm.formatTime(
                                          vm.tripModel!.tripStartTime!)
                                          : "",
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodySmall
                                          ?.copyWith(
                                        color: CustomColors.clr_35CF08,
                                        fontSize: 8,
                                      ),
                                    ),
                                  ],
                                ),
                                const Divider(
                                    height: 20,
                                    color: CustomColors.clr_AAAAAA,
                                    thickness: 0.5),
                                vm.tripModel?.placesDetails?.first.stopAddress != null &&
                                    vm.tripModel?.placesDetails?.first.stopAddress?.isNotEmpty ==
                                        true
                                    ? Row(
                                  children: [
                                    SizedBox(
                                      width: 13,
                                      height: 13,
                                      child: SvgPicture.asset(
                                          CustomImages.stopIndicator,
                                          height: 5,
                                          width: 5),
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Text(
                                        vm.tripModel?.placesDetails?.first.stopAddress ?? '',
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ),
                                  ],
                                )
                                    : const SizedBox(),
                                vm.tripModel?.placesDetails?.first.stopAddress != null &&
                                    vm.tripModel?.placesDetails?.first.stopAddress?.isNotEmpty ==
                                        true
                                    ? Row(
                                  mainAxisAlignment:
                                  MainAxisAlignment.spaceBetween,
                                  children: [
                                    Padding(
                                      padding:
                                      const EdgeInsets.only(left: 25),
                                      child: Text(
                                        vm.tripModel?.completedAt
                                            ?.isNotEmpty ==
                                            true
                                            ? vm.formatMonthDateYear(
                                            vm.tripModel!
                                                .completedAt!,
                                            1)
                                            : "",
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 10,
                                        ),
                                      ),
                                    ),
                                  ],
                                )
                                    : const SizedBox(),
                                vm.tripModel?.placesDetails?.first.stopAddress != null &&
                                    vm.tripModel?.placesDetails?.first.stopAddress?.isNotEmpty ==
                                        true
                                    ? const Divider(
                                    height: 20,
                                    color: CustomColors.clr_AAAAAA,
                                    thickness: 0.5)
                                    : const SizedBox(),
                                Row(
                                  children: [
                                    SizedBox(
                                      width: 13,
                                      height: 13,
                                      child: Image.asset(
                                          CustomImages.dropIndicator,
                                          height: 5,
                                          width: 5),
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Text(
                                        vm.tripModel?.placesDetails?.first.dropAddress ?? '',
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                Row(
                                  mainAxisAlignment:
                                  MainAxisAlignment.spaceBetween,
                                  children: [
                                    Padding(
                                      padding: const EdgeInsets.only(left: 25),
                                      child: Text(
                                        vm.tripModel?.completedAt?.isNotEmpty ==
                                            true
                                            ? vm.formatMonthDateYear(
                                            vm.tripModel!.completedAt!, 1)
                                            : "",
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 10,
                                        ),
                                      ),
                                    ),
                                    // Time
                                    Text(
                                      vm.tripModel?.completedAt?.isNotEmpty ==
                                          true
                                          ? vm.formatTime(
                                          vm.tripModel!.completedAt!)
                                          : "",
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodySmall
                                          ?.copyWith(
                                        color: CustomColors.clr_FF0000,
                                        fontSize: 8,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(
                          height: 15,
                        ),
                        Container(
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: CustomColors.clr_AAAAAA,
                              width: 1,
                            ),
                            borderRadius: BorderRadius.circular(10.0),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(10),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                    CrossAxisAlignment.center,
                                    children: [
                                      Text(
                                        "${vm.translation.txtTotal} ${vm.tripModel?.unit}",
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodyLarge
                                            ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 12,
                                        ),
                                      ),
                                      Text(
                                        "${Utils.formatDecimalPointValue(vm.tripModel?.billingDetails?.totalDistance ?? '', 2)} ${vm.tripModel?.unit}",
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodyLarge
                                            ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 24,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Container(
                                  width: 0.5,
                                  height: 50,
                                  color: CustomColors.clr_AAAAAA,
                                ),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                    CrossAxisAlignment.center,
                                    children: [
                                      Text(
                                        vm.tripModel?.paymentOpt
                                            ?.toUpperCase() ==
                                            AppConstants.wallet
                                                .toUpperCase()
                                            ? vm.translation
                                            .txtTotalFareByWallet
                                            : vm.tripModel?.paymentOpt
                                            ?.toUpperCase() ==
                                            AppConstants.card
                                                .toUpperCase()
                                            ? vm.translation
                                            .txtTotalFareByCard
                                            : vm.translation
                                            .txtTotalFareByCash,
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodyLarge
                                            ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 12,
                                        ),
                                      ),
                                      Text(
                                        "${vm.tripModel?.requestedCurrencySymbol ?? ''} ${Utils.formatDecimalPointValue(vm.tripModel?.billingDetails?.totalAmount ?? '', 2)}",
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodyLarge
                                            ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 24,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(
                          height: 15,
                        ),
                        Container(
                          decoration: const BoxDecoration(
                            border: Border(
                              top: BorderSide(
                                color: CustomColors.clr_AAAAAA,
                                width: 1,
                              ),
                              left: BorderSide(
                                color: CustomColors.clr_AAAAAA,
                                width: 1,
                              ),
                              right: BorderSide(
                                color: CustomColors.clr_AAAAAA,
                                width: 1,
                              ),
                            ),
                            borderRadius: BorderRadius.only(
                              topLeft: Radius.circular(10.0),
                              topRight: Radius.circular(10.0),
                            ),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(15),
                            child: Column(
                              children: [

                                Row(
                                  mainAxisAlignment:
                                  MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      vm.translation.txtBaseFare,
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodySmall
                                          ?.copyWith(
                                        color: Colors.black,
                                        fontSize: 14,
                                      ),
                                    ),
                                    Text(
                                      "${vm.tripModel?.requestedCurrencySymbol ?? ''} ${vm.tripModel?.billingDetails?.basePrice ?? ''}",
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodySmall
                                          ?.copyWith(
                                        color: Colors.black,
                                        fontSize: 14,
                                      ),
                                    ),
                                  ],
                                ),
                                // Visibility(
                                //   visible: Utils.isBillValueNotEmpty(vm
                                //       .tripModel?.billingDetails?.bookingFees),
                                //   child: const SizedBox(
                                //     height: 5,
                                //   ),
                                // ),
                                // Visibility(
                                //   visible: Utils.isBillValueNotEmpty(vm
                                //       .tripModel?.billingDetails?.bookingFees),
                                //   child: Row(
                                //     mainAxisAlignment:
                                //     MainAxisAlignment.spaceBetween,
                                //     children: [
                                //       Text(
                                //         vm.translation.txtBookingFee,
                                //         style: Theme.of(context)
                                //             .textTheme
                                //             .bodySmall
                                //             ?.copyWith(
                                //           color: Colors.black,
                                //           fontSize: 14,
                                //         ),
                                //       ),
                                //       Text(
                                //         "${vm.tripModel?.requestedCurrencySymbol ?? ''} ${Utils.formatDecimalPointValue(vm.tripModel?.billingDetails?.bookingFees ?? '', 2)}",
                                //         style: Theme.of(context)
                                //             .textTheme
                                //             .bodySmall
                                //             ?.copyWith(
                                //           color: Colors.black,
                                //           fontSize: 14,
                                //         ),
                                //       ),
                                //     ],
                                //   ),
                                // ),
                                Visibility(
                                  visible: Utils.isBillValueNotEmpty(vm
                                      .tripModel
                                      ?.billingDetails
                                      ?.distancePrice),
                                  child: const SizedBox(
                                    height: 5,
                                  ),
                                ),
                                Visibility(
                                  visible: Utils.isBillValueNotEmpty(vm
                                      .tripModel
                                      ?.billingDetails
                                      ?.distancePrice),
                                  child: Row(
                                    mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        vm.translation.txtDistanceCost,
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 14,
                                        ),
                                      ),
                                      Text(
                                        "${vm.tripModel?.requestedCurrencySymbol ?? ''} ${Utils.formatDecimalPointValue(vm.tripModel?.billingDetails?.distancePrice ?? '', 2)}",
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 14,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Visibility(
                                  visible: Utils.isBillValueNotEmpty(
                                      vm.tripModel?.billingDetails?.timePrice),
                                  child: const SizedBox(
                                    height: 5,
                                  ),
                                ),
                                Visibility(
                                  visible: Utils.isBillValueNotEmpty(
                                      vm.tripModel?.billingDetails?.timePrice),
                                  child: Row(
                                    mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        vm.translation.txtTimeCost,
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 14,
                                        ),
                                      ),
                                      Text(
                                        "${vm.tripModel?.requestedCurrencySymbol ?? ''} ${vm.tripModel?.billingDetails?.timePrice ?? ''}",
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 14,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Visibility(
                                  visible: Utils.isBillValueNotEmpty(vm
                                      .tripModel
                                      ?.billingDetails
                                      ?.waitingCharge),
                                  child: const SizedBox(
                                    height: 5,
                                  ),
                                ),
                                Visibility(
                                  visible: Utils.isBillValueNotEmpty(vm
                                      .tripModel
                                      ?.billingDetails
                                      ?.waitingCharge),
                                  child: Row(
                                    mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        vm.translation.txtWaitingTime,
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 14,
                                        ),
                                      ),
                                      Text(
                                        "${vm.tripModel?.requestedCurrencySymbol ?? ''} ${Utils.formatDecimalPointValue(vm.tripModel?.billingDetails?.waitingCharge ?? '0', 2)}",
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 14,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Visibility(
                                  visible: Utils.isBillValueNotEmpty(vm
                                      .tripModel
                                      ?.billingDetails
                                      ?.adminCommission),
                                  child: const SizedBox(
                                    height: 5,
                                  ),
                                ),
                                Visibility(
                                  visible: Utils.isBillValueNotEmpty(vm
                                      .tripModel
                                      ?.billingDetails
                                      ?.promoDiscount),
                                  child: const SizedBox(
                                    height: 5,
                                  ),
                                ),
                                // Row(
                                //   mainAxisAlignment:
                                //       MainAxisAlignment.spaceBetween,
                                //   children: [
                                //     Text(
                                //       vm.translation.txtReferralCost,
                                //       style: Theme.of(context)
                                //           .textTheme
                                //           .bodySmall
                                //           ?.copyWith(
                                //             color: Colors.black,
                                //             fontSize: 14,
                                //           ),
                                //     ),
                                //     Text(
                                //       "${vm.tripModel?.requestedCurrencySymbol ?? ''} ${vm.tripModel?.billingDetails?.''}",
                                //       style: Theme.of(context)
                                //           .textTheme
                                //           .bodySmall
                                //           ?.copyWith(
                                //             color: CustomColors.clr_FF0000,
                                //             fontSize: 14,
                                //           ),
                                //     ),
                                //   ],
                                // ),
                                // SizedBox(
                                //   height: 5,
                                // ),
                                Visibility(
                                  visible: Utils.isBillValueNotEmpty(vm
                                      .tripModel
                                      ?.billingDetails
                                      ?.promoDiscount),
                                  child: Row(
                                    mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        vm.translation.txtPromoBonus,
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 14,
                                        ),
                                      ),
                                      Text(
                                        "${vm.tripModel?.requestedCurrencySymbol ?? ''} ${Utils.formatDecimalPointValue(vm.tripModel?.billingDetails?.promoDiscount ?? "" , 2)}",
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                          color: CustomColors.clr_FF0000,
                                          fontSize: 14,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                // Visibility(
                                //   visible: Utils.isBillValueNotEmpty(
                                //       vm.tripModel?.billingDetails?.serviceTax),
                                //   child: const SizedBox(
                                //     height: 5,
                                //   ),
                                // ),
                                // Visibility(
                                //   visible: Utils.isBillValueNotEmpty(
                                //       vm.tripModel?.billingDetails?.serviceTax),
                                //   child: Row(
                                //     mainAxisAlignment:
                                //     MainAxisAlignment.spaceBetween,
                                //     children: [
                                //       Text(
                                //         vm.translation.txtServiceTax,
                                //         style: Theme.of(context)
                                //             .textTheme
                                //             .bodySmall
                                //             ?.copyWith(
                                //           color: Colors.black,
                                //           fontSize: 14,
                                //         ),
                                //       ),
                                //       Text(
                                //         "${vm.tripModel?.requestedCurrencySymbol ?? ''} ${vm.tripModel?.billingDetails?.serviceTax ?? ''}",
                                //         style: Theme.of(context)
                                //             .textTheme
                                //             .bodySmall
                                //             ?.copyWith(
                                //           color: Colors.black,
                                //           fontSize: 14,
                                //         ),
                                //       ),
                                //     ],
                                //   ),
                                // ),
                              ],
                            ),
                          ),
                        ),

                        Container(
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: CustomColors.primaryColor,
                              width: 2,
                            ),
                            borderRadius: const BorderRadius.only(
                              bottomLeft: Radius.circular(10.0),
                              bottomRight: Radius.circular(10.0),
                            ),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.only(
                              left: 10,
                              top: 5,
                              right: 10,
                              bottom: 5,
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            vm.translation.txtTotalFareAmount,
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodyLarge
                                                ?.copyWith(
                                              color: Colors.black,
                                              fontSize: 20,
                                            ),
                                          ),
                                          Text(
                                            "${vm.tripModel?.requestedCurrencySymbol ?? ''} ${Utils.formatDecimalPointValue(vm.tripModel?.billingDetails?.totalAmount ?? '', 2)}",
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodyLarge
                                                ?.copyWith(
                                              color: Colors.black,
                                              fontSize: 20,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ), const SizedBox(
                          height: 15,
                        ),
                        if (
                        Utils.isBillValueNotEmpty(vm.tripModel?.billingDetails?.bookingFees) ||
                            Utils.isBillValueNotEmpty(vm.tripModel?.billingDetails?.adminCommission) ||
                            Utils.isBillValueNotEmpty(vm.tripModel?.billingDetails?.serviceTax)
                        )
                          Container(
                          decoration: const BoxDecoration(
                            border: Border(
                              top: BorderSide(
                                color: CustomColors.clr_AAAAAA,
                                width: 1,
                              ),
                              left: BorderSide(
                                color: CustomColors.clr_AAAAAA,
                                width: 1,
                              ),
                              right: BorderSide(
                                color: CustomColors.clr_AAAAAA,
                                width: 1,
                              ),
                            ),
                            borderRadius: BorderRadius.only(
                              topLeft: Radius.circular(10.0),
                              topRight: Radius.circular(10.0),
                            ),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(15),
                            child: Column(
                              children: [
                                Visibility(
                                  visible: Utils.isBillValueNotEmpty(vm
                                      .tripModel
                                      ?.billingDetails
                                      ?.bookingFees),
                                  child: const SizedBox(
                                    height: 5,
                                  ),
                                ),
                                Visibility(
                                  visible: Utils.isBillValueNotEmpty(vm
                                      .tripModel
                                      ?.billingDetails
                                      ?.bookingFees),
                                  child: Row(
                                    mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        vm.translation.txtBookingFee,
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 14,
                                        ),
                                      ),
                                      Text(
                                        "- ${vm.tripModel?.requestedCurrencySymbol ?? ''} ${Utils.formatDecimalPointValue(vm.tripModel?.billingDetails?.bookingFees ?? '0', 2)}",
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 14,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Visibility(
                                  visible: Utils.isBillValueNotEmpty(vm
                                      .tripModel
                                      ?.billingDetails
                                      ?.adminCommission),
                                  child: const SizedBox(
                                    height: 5,
                                  ),
                                ),
                                Visibility(
                                  visible: Utils.isBillValueNotEmpty(vm
                                      .tripModel
                                      ?.billingDetails
                                      ?.adminCommission),
                                  child: Row(
                                    mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        vm.translation.txtAdminCommission,
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 14,
                                        ),
                                      ),
                                      Text(
                                        "- ${vm.tripModel?.requestedCurrencySymbol ?? ''} ${Utils.formatDecimalPointValue(vm.tripModel?.billingDetails?.adminCommission ?? '0', 2)}",
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 14,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),

                                Visibility(
                                  visible: Utils.isBillValueNotEmpty(
                                      vm.tripModel?.billingDetails?.serviceTax),
                                  child: const SizedBox(
                                    height: 5,
                                  ),
                                ),
                                Visibility(
                                  visible: Utils.isBillValueNotEmpty(
                                      vm.tripModel?.billingDetails?.serviceTax),
                                  child: Row(
                                    mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        vm.translation.txtServiceTax,
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 14,
                                        ),
                                      ),
                                      Text(
                                        "- ${vm.tripModel?.requestedCurrencySymbol ?? ''} ${vm.tripModel?.billingDetails?.serviceTax ?? ''}",
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 14,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        Container(
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: CustomColors.primaryColor,
                              width: 2,
                            ),
                            borderRadius: const BorderRadius.only(
                              bottomLeft: Radius.circular(10.0),
                              bottomRight: Radius.circular(10.0),
                            ),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.only(
                              left: 10,
                              top: 5,
                              right: 10,
                              bottom: 5,
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            vm.translation.txtDiverEarnings,
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodyLarge
                                                ?.copyWith(
                                              color: Colors.black,
                                              fontSize: 20,
                                            ),
                                          ),
                                          Text(
                                            "${vm.tripModel?.requestedCurrencySymbol ?? ''} ${Utils.formatDecimalPointValue(vm.tripModel?.billingDetails?.driverCommission ?? '', 2)}",
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodyLarge
                                                ?.copyWith(
                                              color: Colors.black,
                                              fontSize: 20,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        /*Visibility(
                          visible: widget.tripModel?.ratingDetails?.feedback != null,
                          child: const SizedBox(
                            height: 15,
                          ),
                        ),

                        Visibility(
                          visible: widget.tripModel?.ratingDetails?.feedback != null,
                          child: Container(
                            decoration: BoxDecoration(
                              border: Border.all(
                                color: CustomColors.primaryColor,
                                width: 2,
                              ),
                              borderRadius: const BorderRadius.only(
                                bottomLeft: Radius.circular(10.0),
                                bottomRight: Radius.circular(10.0),
                              ),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(10),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('${vm.translation
                                      .txtRating}: '),
                                  SizedBox(height: 10),
                                  ListView.builder(
                                    shrinkWrap: true,
                                    physics: const NeverScrollableScrollPhysics(),
                                    itemCount: widget.tripModel?.ratingDetails?.feedback?.length,
                                    itemBuilder: (context, index) {
                                      return Card(
                                        child: Padding(
                                          padding: const EdgeInsets.all(8.0),
                                          child: Column(
                                            children: [
                                              Row(
                                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                children: [
                                                  Expanded(
                                                    child: Text('${widget.tripModel?.ratingDetails?.feedback?[index].question}',
                                                      maxLines: 2,
                                                    ),
                                                  ),
                                                  widget.tripModel?.ratingDetails?.feedback?[index].status == true ? SvgPicture.asset(CustomImages.star) : SvgPicture.asset(CustomImages.starDefault),
                                                ],
                                              )
                                            ],
                                          ),
                                        ),
                                      );
                                    },),
                                ],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(
                          height: 15,
                        ),*/
                        vm.isHistoryInvoice == true
                            ? Align(
                          alignment: Alignment.centerRight,
                          child: InkWell(
                            onTap: () {
                              vm.sharePdf();
                              /*showDialog(
                                context: context,
                                barrierDismissible: true,
                                builder: (BuildContext context) {
                                  return DescriptionDialog(
                                    title: vm.translation
                                        .txtYourInvoiceHasSentToThisMail,
                                    title1: vm.tripModel?.driverDetails
                                        ?.email ??
                                        '',
                                    vm: vm,
                                  );
                                },
                              );*/
                            },
                            child: Container(
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(5),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.grey
                                        .withValues(alpha: 0.5),
                                    spreadRadius: 2,
                                    blurRadius: 3,
                                    offset: const Offset(0, 1),
                                  ),
                                ],
                              ),
                              padding: const EdgeInsets.all(10),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(
                                    Icons.email_rounded,
                                    color: CustomColors.primaryColor,
                                    size: 20,
                                  ),
                                  const SizedBox(
                                    width: 5,
                                  ),
                                  Text(
                                    vm.translation.txtSendInvoice,
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodySmall
                                        ?.copyWith(
                                      color: CustomColors.titleColor,
                                      fontSize: 16,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        )
                            : const SizedBox(),
                        const SizedBox(
                          height: 15,
                        ),
                        Visibility(
                          visible: true,
                          child: Center(
                            child: Padding(
                              padding:
                              const EdgeInsets.symmetric(horizontal: 20),
                              child: vm.isHistoryInvoice
                                  ? Center(
                                child: GestureDetector(
                                  onTap: () {
                                    vm.pop();
                                  },
                                  child: Container(
                                    width: MediaQuery.sizeOf(context).width * 0.75,
                                    alignment: Alignment.center,
                                    padding: const EdgeInsets.symmetric(
                                        vertical: Dimensions.padding_12,
                                        horizontal: Dimensions.padding_5),
                                    decoration: BoxDecoration(
                                      color: CustomColors.primaryColor,
                                      borderRadius: BorderRadius.circular(26),
                                    ),
                                    child: Text(
                                      vm.translation.txt_Ok,
                                      style: Theme.of(context).textTheme.titleLarge?.copyWith(color: CustomColors.buttonTxtColor),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ),
                              )
                                  : ProceedButton(
                                // isAvailable: vm.tripModel?.paymentOpt
                                //     ?.toUpperCase() ==
                                //     "CARD" ||
                                //     vm.tripModel?.paymentOpt
                                //         ?.toUpperCase() ==
                                //         AppConstants.wallet.toUpperCase()
                                //     ? vm.tripModel?.isPaid == true
                                //     : true,
                                isAvailable: true,
                                btnTxt: vm.translation.txtGiveRating,
                                onPressed: () {
                                  if ((vm.tripModel?.paymentOpt
                                      ?.toUpperCase() ==
                                      "CARD" ||
                                      vm.tripModel?.paymentOpt
                                          ?.toUpperCase() ==
                                          AppConstants.wallet
                                              .toUpperCase()) &&
                                      vm.tripModel?.isPaid != true) {
                                    Utils.showToast(vm.translation
                                        .txtKindlyWaitUntilUserCompleteThePayment);
                                 } else {
                                    vm.showRatingDetails(vm.tripModel);
                                 }
                                },
                                showArrowIcon: true,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(
                          height: 15,
                        ),
                      ],
                    );
                  }))),
        ),
        scaffoldKey: scaffoldKey,
      ),
    );
  }
}
