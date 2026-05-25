import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:provider/provider.dart';

import '../../../components/normal_custom_bar.dart';
import '../../../components/proceed_button.dart';
import '../../../network/response_models/trip_model.dart';
import '../../../utils/app_constants.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';
import '../../../utils/custom_router.dart';
import '../../../utils/dimensions.dart';
import '../../../utils/utils.dart';
import '../../dialogs/description_dialog.dart';
import 'invoice_vm.dart';

class InvoiceScreen extends StatefulWidget {
  final Trip? trip;

  const InvoiceScreen({super.key, this.trip});

  @override
  State<InvoiceScreen> createState() => _InvoiceScreenState();
}

class _InvoiceScreenState extends State<InvoiceScreen> {
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  var vm = InvoiceVm();

  @override
  void initState() {
    if (widget.trip != null && widget.trip?.billingDetails != null) {
      vm.trip = widget.trip;
      vm.isHistoryInvoice = widget.trip?.isHistory == true;
      if (vm.trip?.paymentOpt?.toUpperCase() ==
              AppConstants.wallet.toUpperCase() &&
          !(vm.trip?.isPaid == true)) {
        // vm.enableMoveToCashPayment = true;
        // Utils.showToast(msg: vm.translation.txtWalletPaymentFailedDesc);
      }
    } else {
      Future.delayed(Duration.zero, () {
        vm.getReqInProgress();
      });
    }
    super.initState();
  }

  @override
  void dispose() {
    vm.isDisposed = true;
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => vm,
      child: Consumer<InvoiceVm>(builder: (context, vm, child) {
        return SafeArea(
          child: Scaffold(
            body: Column(
              children: [
                NormalCustomBar(
                  title: vm.translation.txt_completed,
                  showBackBtn: vm.isHistoryInvoice,
                ),
                Expanded(
                  child: SingleChildScrollView(
                    child: Padding(
                      padding: const EdgeInsets.only(
                          left: Dimensions.padding_20,
                          right: Dimensions.padding_20,
                          top: Dimensions.padding_10),
                      child: SingleChildScrollView(
                        child: Column(
                          children: [
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
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(10),
                                      child: Image.network(
                                        "${AppConstants.imageBaseUrl}${vm.trip?.driver?.profilePic ?? vm.trip?.driverDetails?.profilePic}",
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
                                                color:
                                                    CustomColors.primaryColor),
                                          ),
                                          child: SvgPicture.asset(
                                            CustomImages.dummyProfile,
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
                                              child: SizedBox(
                                                height: 20,
                                                width: 20,
                                                child:
                                                    CircularProgressIndicator(
                                                  value: loadingProgress
                                                              .expectedTotalBytes !=
                                                          null
                                                      ? loadingProgress
                                                              .cumulativeBytesLoaded /
                                                          loadingProgress
                                                              .expectedTotalBytes!
                                                      : null,
                                                  color:
                                                      CustomColors.clr_ADADAD,
                                                ),
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
                                            vm.trip?.driver?.firstName ??
                                                vm.trip?.driverDetails
                                                    ?.firstName ??
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
                                            vm.trip?.driverDetails?.carNumber
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
                                            "${vm.translation.txt_booking_id} : ${vm.trip?.requestNumber}",
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
                                          errorBuilder: (c, e, t) =>
                                              SvgPicture.asset(
                                                  CustomImages
                                                      .vehicleTypePlaceHolder,
                                                  width: 30,
                                                  height: 30),
                                          '${AppConstants.imageBaseUrl}${vm.trip?.vehicleDetails?.highlightImage ?? ''}',
                                          fit: BoxFit.cover,
                                          width: 30,
                                          height: 30,
                                          loadingBuilder: (BuildContext context,
                                              Widget child,
                                              ImageChunkEvent?
                                                  loadingProgress) {
                                            if (loadingProgress == null) {
                                              return child;
                                            } else {
                                              return Center(
                                                child:
                                                    CircularProgressIndicator(
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
                                          vm.trip?.vehicleDetails
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
                              height: 10,
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
                                          width: 15,
                                          height: 15,
                                          child: SvgPicture.asset(
                                            CustomImages.locationDot,
                                            colorFilter: const ColorFilter.mode(
                                                CustomColors.clr_35CF08,
                                                BlendMode.srcIn),
                                          ),
                                        ),
                                        const SizedBox(width: 10),
                                        // Address and Date Column
                                        Expanded(
                                          child: Text(
                                            vm.trip?.pickAddress ?? '',
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
                                          padding:
                                              const EdgeInsets.only(left: 25),
                                          child: Text(
                                            vm.trip?.tripStartTime
                                                        ?.isNotEmpty ==
                                                    true
                                                ? vm.formatMonthDateYear(
                                                    vm.trip?.tripStartTime ??
                                                        '',
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
                                        // Time
                                        Text(
                                          vm.trip?.tripStartTime?.isNotEmpty ==
                                                  true
                                              ? vm.formatTime(
                                                  vm.trip?.tripStartTime ?? '')
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
                                    vm.trip?.stopAddress != null &&
                                            vm.trip?.stopAddress?.isNotEmpty ==
                                                true
                                        ? Row(
                                            children: [
                                              SizedBox(
                                                width: 15,
                                                height: 15,
                                                child: SvgPicture.asset(
                                                  CustomImages.stopDot,
                                                  width: Dimensions.padding_12,
                                                  height: Dimensions.padding_12,
                                                ),
                                              ),
                                              const SizedBox(width: 10),
                                              Expanded(
                                                child: Text(
                                                  vm.trip?.stopAddress ?? '',
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
                                    vm.trip?.stopAddress != null &&
                                            vm.trip?.stopAddress?.isNotEmpty ==
                                                true
                                        ? Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.spaceBetween,
                                            children: [
                                              Padding(
                                                padding: const EdgeInsets.only(
                                                    left: 25),
                                                child: Text(
                                                  vm.trip?.completedAt
                                                              ?.isNotEmpty ==
                                                          true
                                                      ? vm.formatMonthDateYear(
                                                          vm.trip?.completedAt ??
                                                              '',
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
                                    vm.trip?.stopAddress != null &&
                                            vm.trip?.stopAddress?.isNotEmpty ==
                                                true
                                        ? const Divider(
                                            height: 20,
                                            color: CustomColors.clr_AAAAAA,
                                            thickness: 0.5)
                                        : const SizedBox(),
                                    Row(
                                      children: [
                                        SizedBox(
                                          width: 15,
                                          height: 15,
                                          child: SvgPicture.asset(
                                            CustomImages.locationDot,
                                            colorFilter: const ColorFilter.mode(
                                                CustomColors.clr_FF0000,
                                                BlendMode.srcIn),
                                          ),
                                        ),
                                        const SizedBox(width: 10),
                                        Expanded(
                                          child: Text(
                                            vm.trip?.dropAddress ?? '',
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
                                          padding:
                                              const EdgeInsets.only(left: 25),
                                          child: Text(
                                            vm.trip?.completedAt?.isNotEmpty ==
                                                    true
                                                ? vm.formatMonthDateYear(
                                                    vm.trip?.completedAt ?? '',
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
                                        // Time
                                        Text(
                                          vm.trip?.completedAt?.isNotEmpty ==
                                                  true
                                              ? vm.formatTime(
                                                  vm.trip?.completedAt ?? '')
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
                              height: 10,
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
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.center,
                                        children: [
                                          Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.spaceBetween,
                                            children: [
                                              Text(
                                                '${vm.translation.txtTotal} ${vm.trip?.unit} :',
                                                style: Theme.of(context)
                                                    .textTheme
                                                    .bodyLarge
                                                    ?.copyWith(
                                                      color: Colors.black,
                                                      fontSize: 18,
                                                    ),
                                              ),
                                              const SizedBox(
                                                width: 5,
                                              ),
                                              Expanded(
                                                  child: Row(
                                                mainAxisAlignment:
                                                    MainAxisAlignment.end,
                                                children: [
                                                  Text(
                                                    Utils.formatDecimalPointValue(
                                                        vm.trip?.billingDetails
                                                                ?.totalDistance ??
                                                            '',
                                                        2),
                                                    style: Theme.of(context)
                                                        .textTheme
                                                        .bodyLarge
                                                        ?.copyWith(
                                                          color: Colors.black,
                                                          fontSize: 18,
                                                        ),
                                                  ),
                                                  const SizedBox(
                                                    width: 5,
                                                  ),
                                                  Text(
                                                    vm.trip?.unit ?? "",
                                                    style: Theme.of(context)
                                                        .textTheme
                                                        .bodyLarge
                                                        ?.copyWith(
                                                          color: Colors.black,
                                                          fontSize: 18,
                                                        ),
                                                  ),
                                                ],
                                              )),
                                            ],
                                          ),
                                          const Divider(
                                              height: 10,
                                              color: CustomColors.clr_AAAAAA,
                                              thickness: 0.5),
                                          Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.spaceBetween,
                                            children: [
                                              Text(
                                                '${vm.trip?.paymentOpt?.toUpperCase() == AppConstants.wallet.toUpperCase() ? vm.translation.txtTotalFareByWallet : vm.trip?.paymentOpt?.toUpperCase() == AppConstants.card.toUpperCase() ? vm.translation.txtTotalFareByCard : vm.translation.txtTotalFareByCash} :',
                                                style: Theme.of(context)
                                                    .textTheme
                                                    .bodyLarge
                                                    ?.copyWith(
                                                      color: Colors.black,
                                                      fontSize: 18,
                                                    ),
                                              ),
                                              const SizedBox(
                                                width: 5,
                                              ),
                                              Expanded(
                                                child: Text(
                                                  "${vm.trip?.requestedCurrencySymbol ?? ''} ${Utils.formatDecimalPointValue(vm.trip?.billingDetails?.totalAmount ?? '', 2)}",
                                                  textAlign: TextAlign.end,
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .bodyLarge
                                                      ?.copyWith(
                                                        color: Colors.black,
                                                        fontSize: 18,
                                                        overflow: TextOverflow
                                                            .ellipsis,
                                                      ),
                                                ),
                                              ),
                                            ],
                                          )
                                        ],
                                      ),
                                    ),
                                    // Container(
                                    //   width: 0.5,
                                    //   height: 50,
                                    //   color: CustomColors.clr_AAAAAA,
                                    // ),
                                    // Expanded(
                                    //   child: Column(
                                    //     crossAxisAlignment: CrossAxisAlignment.center,
                                    //     children: [
                                    //       Text(
                                    //         'Total Fare by Cash',
                                    //         style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                    //           color: Colors.black, fontSize: 12,
                                    //         ),
                                    //       ),
                                    //       Text(
                                    //         "${vm.trip?.requestedCurrencySymbol ?? '\$' } ${"${vm.trip?.billingDetails?.totalAmount.toString() ?? '25'}00000000000"}",
                                    //         style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                    //           color: Colors.black, fontSize: 24,
                                    //         ),
                                    //       ),
                                    //     ],
                                    //   ),
                                    // ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(
                              height: 10,
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
                                          vm.translation.txt_base_fare,
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodySmall
                                              ?.copyWith(
                                                color: Colors.black,
                                                fontSize: 14,
                                              ),
                                        ),
                                        Text(
                                          "${vm.trip?.requestedCurrencySymbol ?? ''} ${vm.trip?.billingDetails?.basePrice ?? ''}",
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
                                    Visibility(
                                      visible: Utils.isBillValueNotEmpty(
                                          vm.trip?.billingDetails?.bookingFees),
                                      child: const SizedBox(
                                        height: 5,
                                      ),
                                    ),
                                    Visibility(
                                      visible: Utils.isBillValueNotEmpty(
                                          vm.trip?.billingDetails?.bookingFees),
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
                                            "${vm.trip?.requestedCurrencySymbol ?? ''} ${Utils.formatDecimalPointValue(vm.trip?.billingDetails?.bookingFees ?? '', 2)}",
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
                                          .trip?.billingDetails?.distancePrice),
                                      child: const SizedBox(
                                        height: 5,
                                      ),
                                    ),
                                    Visibility(
                                      visible: Utils.isBillValueNotEmpty(vm
                                          .trip?.billingDetails?.distancePrice),
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
                                            "${vm.trip?.requestedCurrencySymbol ?? ''} ${Utils.formatDecimalPointValue(vm.trip?.billingDetails?.distancePrice ?? '', 2)}",
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
                                          .trip?.billingDetails?.waitingCharge),
                                      child: const SizedBox(
                                        height: 5,
                                      ),
                                    ),
                                    Visibility(
                                      visible: Utils.isBillValueNotEmpty(vm
                                          .trip?.billingDetails?.waitingCharge),
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            vm.translation.txtWaitingPrice,
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodySmall
                                                ?.copyWith(
                                                  color: Colors.black,
                                                  fontSize: 14,
                                                ),
                                          ),
                                          Text(
                                            "${vm.trip?.requestedCurrencySymbol ?? ''} ${Utils.formatDecimalPointValue(vm.trip?.billingDetails?.waitingCharge ?? "0", 2) ?? ''}",
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
                                    // Visibility(
                                    //   visible: Utils.isBillValueNotEmpty(
                                    //       vm.trip?.billingDetails?.adminCommission),
                                    //   child: const SizedBox(
                                    //     height: 5,
                                    //   ),
                                    // ),
                                    // Visibility(
                                    //   visible: Utils.isBillValueNotEmpty(
                                    //       vm.trip?.billingDetails?.adminCommission),
                                    //   child: Row(
                                    //     mainAxisAlignment:
                                    //         MainAxisAlignment.spaceBetween,
                                    //     children: [
                                    //       Text(
                                    //         vm.translation.txtAdminCommission,
                                    //         style: Theme.of(context)
                                    //             .textTheme
                                    //             .bodySmall
                                    //             ?.copyWith(
                                    //               color: Colors.black,
                                    //               fontSize: 14,
                                    //             ),
                                    //       ),
                                    //       Text(
                                    //         "${vm.trip?.requestedCurrencySymbol ?? ''} ${Utils.formatDecimalPointValue(vm.trip?.billingDetails?.adminCommission ?? '0', 2)}",
                                    //         style: Theme.of(context)
                                    //             .textTheme
                                    //             .bodySmall
                                    //             ?.copyWith(
                                    //               color: Colors.black,
                                    //               fontSize: 14,
                                    //             ),
                                    //       ),
                                    //     ],
                                    //   ),
                                    // ),
                                    Visibility(
                                      visible: Utils.isBillValueNotEmpty(vm
                                          .trip?.billingDetails?.promoDiscount),
                                      child: const SizedBox(
                                        height: 5,
                                      ),
                                    ),
                                    Visibility(
                                      visible: Utils.isBillValueNotEmpty(vm
                                          .trip?.billingDetails?.promoDiscount),
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
                                            "${vm.trip?.requestedCurrencySymbol ?? ''} ${vm.trip?.billingDetails?.promoDiscount ?? ''}",
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodySmall
                                                ?.copyWith(
                                                  color:
                                                      CustomColors.clr_FF0000,
                                                  fontSize: 14,
                                                ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    // Visibility(
                                    //   visible: Utils.isBillValueNotEmpty(
                                    //       vm.trip?.billingDetails?.serviceTax),
                                    //   child: const SizedBox(
                                    //     height: 5,
                                    //   ),
                                    // ),
                                    // Visibility(
                                    //   visible: Utils.isBillValueNotEmpty(
                                    //       vm.trip?.billingDetails?.serviceTax),
                                    //   child: Row(
                                    //     mainAxisAlignment:
                                    //         MainAxisAlignment.spaceBetween,
                                    //     children: [
                                    //       Text(
                                    //         vm.translation.txtServiceTax,
                                    //         style: Theme.of(context)
                                    //             .textTheme
                                    //             .bodySmall
                                    //             ?.copyWith(
                                    //               color: Colors.black,
                                    //               fontSize: 14,
                                    //             ),
                                    //       ),
                                    //       Text(
                                    //         "${vm.trip?.requestedCurrencySymbol ?? ''} ${vm.trip?.billingDetails?.serviceTax ?? ''}",
                                    //         style: Theme.of(context)
                                    //             .textTheme
                                    //             .bodySmall
                                    //             ?.copyWith(
                                    //               color: CustomColors.clr_FF0000,
                                    //               fontSize: 14,
                                    //             ),
                                    //       ),
                                    //     ],
                                    //   ),
                                    // ),
                                    // SizedBox(
                                    //   height: 5,
                                    // ),
                                    // Row(
                                    //   mainAxisAlignment:
                                    //       MainAxisAlignment.spaceBetween,
                                    //   children: [
                                    //     Text(
                                    //       vm.translation.txtBookingFee,
                                    //       style: Theme.of(context)
                                    //           .textTheme
                                    //           .bodySmall
                                    //           ?.copyWith(
                                    //             color: Colors.black,
                                    //             fontSize: 14,
                                    //           ),
                                    //     ),
                                    //     Text(
                                    //       "${vm.trip?.requestedCurrencySymbol ?? ''} ${vm.trip?.billingDetails?.bookingFees ?? ''}",
                                    //       style: Theme.of(context)f
                                    //           .textTheme
                                    //           .bodySmall
                                    //           ?.copyWith(
                                    //             color: Colors.black,
                                    //             fontSize: 14,
                                    //           ),
                                    //     ),
                                    //   ],
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
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
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
                                                vm.translation
                                                    .txt_total_fare_amount,
                                                style: Theme.of(context)
                                                    .textTheme
                                                    .bodyLarge
                                                    ?.copyWith(
                                                      color: Colors.black,
                                                      fontSize: 20,
                                                    ),
                                              ),
                                              Text(
                                                "${vm.trip?.requestedCurrencySymbol ?? ''} ${Utils.formatDecimalPointValue(vm.trip?.billingDetails?.totalAmount ?? '', 2)}",
                                                style: Theme.of(context)
                                                    .textTheme
                                                    .bodyLarge
                                                    ?.copyWith(
                                                      color: Colors.black,
                                                      fontSize: 20,
                                                    ),
                                                maxLines: 1,
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
                              visible:
                                  widget.trip?.ratingDetails?.feedback != null,
                              child: const SizedBox(
                                height: 15,
                              ),
                            ),

                            Visibility(
                              visible:
                                  widget.trip?.ratingDetails?.feedback != null,
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
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text('${vm.translation.txtRating}: '),
                                      SizedBox(height: 10),
                                      ListView.builder(
                                        shrinkWrap: true,
                                        physics:
                                            const NeverScrollableScrollPhysics(),
                                        itemCount: widget.trip?.ratingDetails
                                            ?.feedback?.length,
                                        itemBuilder: (context, index) {
                                          return Card(
                                            child: Padding(
                                              padding:
                                                  const EdgeInsets.all(8.0),
                                              child: Column(
                                                children: [
                                                  Row(
                                                    mainAxisAlignment:
                                                        MainAxisAlignment
                                                            .spaceBetween,
                                                    children: [
                                                      Expanded(
                                                        child: Text(
                                                          '${widget.trip?.ratingDetails?.feedback?[index].question}',
                                                          maxLines: 2,
                                                        ),
                                                      ),
                                                      widget
                                                                  .trip
                                                                  ?.ratingDetails
                                                                  ?.feedback?[
                                                                      index]
                                                                  .status ==
                                                              true
                                                          ? SvgPicture.asset(
                                                              CustomImages.star)
                                                          : SvgPicture.asset(
                                                              CustomImages
                                                                  .starDefault),
                                                    ],
                                                  )
                                                ],
                                              ),
                                            ),
                                          );
                                        },
                                      ),
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
                                        showDialog(
                                          context: context,
                                          barrierDismissible: true,
                                          builder: (BuildContext context) {
                                            return DescriptionDialog(
                                              title: vm.translation
                                                  .txtYourInvoiceHasSentToThisMail,
                                              title1:
                                                  vm.trip?.userDetails?.email ??
                                                      "",
                                            );
                                          },
                                        );
                                      },
                                      child: Container(
                                        decoration: BoxDecoration(
                                          color: Colors.white,
                                          borderRadius:
                                              BorderRadius.circular(5),
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
                                        child: Padding(
                                          padding: const EdgeInsets.all(10),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              const Icon(
                                                Icons.email_rounded,
                                                color:
                                                    CustomColors.primaryColor,
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
                                                      color: CustomColors
                                                          .titleColor,
                                                      fontSize: 16,
                                                    ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ),
                                  )
                                : const SizedBox(),
                            /*const SizedBox(height: Dimensions.padding_15),
                            Container(
                              margin: const EdgeInsets.all(15),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.grey.withOpacity(0.2),
                                    blurRadius: 6,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  /// TITLE
                                  Container(
                                    width: double.infinity,
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 10,
                                    ),
                                    decoration: const BoxDecoration(
                                      color: Color(0xFFD8F0D5),
                                      borderRadius: BorderRadius.only(
                                        topLeft: Radius.circular(12),
                                        topRight: Radius.circular(12),
                                      ),
                                    ),
                                    child: Text(
                                      "Appreciate your Driver?",
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyMedium
                                          ?.copyWith(
                                            color: Colors.green,
                                            fontWeight: FontWeight.w500,
                                            fontSize: 16,
                                          ),
                                    ),
                                  ),

                                  /// BUTTONS
                                  Row(
                                    children: [
                                      /// NO TIP
                                      Expanded(
                                        child: InkWell(
                                          onTap: () {
                                            vm.selectedTip = 0;
                                            vm.notifyListeners();
                                          },
                                          child: Container(
                                            alignment: Alignment.center,
                                            padding: const EdgeInsets.symmetric(
                                              vertical: 14,
                                            ),
                                            decoration: BoxDecoration(
                                              color: vm.selectedTip == 0
                                                  ? CustomColors.primaryColor
                                                  : Colors.white,
                                              borderRadius:
                                                  const BorderRadius.only(
                                                bottomLeft: Radius.circular(12),
                                              ),
                                            ),
                                            child: Text(
                                              "No Tip",
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .bodyMedium
                                                  ?.copyWith(
                                                    color: vm.selectedTip == 0
                                                        ? Colors.white
                                                        : Colors.black,
                                                    fontWeight: FontWeight.w600,
                                                  ),
                                            ),
                                          ),
                                        ),
                                      ),

                                      Container(
                                        width: 1,
                                        height: 50,
                                        color: Colors.grey.shade300,
                                      ),

                                      /// PAY TIP
                                      Expanded(
                                        child: InkWell(
                                          onTap: () {
                                            vm.selectedTip = 50;
                                            vm.notifyListeners();
                                          },
                                          child: Container(
                                            alignment: Alignment.center,
                                            padding: const EdgeInsets.symmetric(
                                              vertical: 14,
                                            ),
                                            decoration: BoxDecoration(
                                              color: vm.selectedTip != 0
                                                  ? Colors.green
                                                  : Colors.white,
                                              borderRadius:
                                                  const BorderRadius.only(
                                                bottomRight:
                                                    Radius.circular(12),
                                              ),
                                            ),
                                            child: Text(
                                              "Pay Tip",
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .bodyMedium
                                                  ?.copyWith(
                                                    color: vm.selectedTip != 0
                                                        ? Colors.white
                                                        : Colors.black,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),*/

                            const SizedBox(height: 10),

                            /// MESSAGE
                            Row(
                              children: [
                                Icon(
                                  Icons.info_outline,
                                  size: 16,
                                  color: Colors.grey.shade500,
                                ),
                                const SizedBox(width: 5),
                                Text(
                                  "Please select an option to continue",
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodySmall
                                      ?.copyWith(
                                        color: Colors.grey.shade500,
                                        fontSize: 12,
                                      ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                // Visibility(
                //   visible: vm.enableMoveToCashPayment &&
                //       (vm.trip?.paymentOpt?.toUpperCase() ==
                //           AppConstants.card.toUpperCase() &&
                //           !vm.isHistoryInvoice &&
                //           vm.trip?.isPaid == false ||
                //           vm.trip?.paymentOpt?.toUpperCase() ==
                //               AppConstants.wallet.toUpperCase() &&
                //               !vm.isHistoryInvoice &&
                //               vm.trip?.isPaid == false),
                //   child: Padding(
                //     padding: const EdgeInsets.symmetric(
                //         horizontal: 20, vertical: Dimensions.padding_20),
                //     child: ProceedButton(
                //       btnTxt: vm.translation.txtMoveToCashPayment,
                //       onPressed: () => vm.moveToCashTypePayment(),
                //       showArrowIcon: true,
                //     ),
                //   ),
                // ),
                vm.isHistoryInvoice
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
                              style: Theme.of(context)
                                  .textTheme
                                  .titleLarge
                                  ?.copyWith(
                                      color: CustomColors.buttonTxtColor),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ),
                      )
                    : Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: vm.isProcessingPayment
                            ? const Center(child: CircularProgressIndicator())
                            : ProceedButton(
                                // btnTxt: vm.trip?.paymentOpt?.toUpperCase() ==
                                //     AppConstants.card.toUpperCase() ||
                                //     vm.trip?.paymentOpt?.toUpperCase() ==
                                //         AppConstants.wallet.toUpperCase()
                                //     ? vm.trip?.isPaid == true
                                //     ? vm.translation.txtGiveRating
                                //     : vm.translation.txtMakePayment
                                //     : vm.translation.txtGiveRating,
                                btnTxt: vm.selectedTip != 0
                                    ? vm.translation.txt_Confirm
                                    : vm.translation.txtGiveRating,
                          onPressed: () {

                            /// TIP SELECTED
                            if (vm.selectedTip != 0) {

                              /// PAYMENT SCREEN
                              vm.showPaymentDetails(vm.trip);

                            } else {

                              /// GIVE RATING
                              vm.showRatingDetails(vm.trip);
                            }
                          },
                                // onPressed: () {
                                //   print("orjfprefe${vm.trip?.isPaid}");
                                //   // if ((vm.trip?.paymentOpt?.toUpperCase() ==
                                //   //     AppConstants.card.toUpperCase() ||
                                //   //     vm.trip?.paymentOpt?.toUpperCase() ==
                                //   //         AppConstants.wallet.toUpperCase()) &&
                                //   //     !(vm.trip?.isPaid == true)) {
                                //   // if (vm.isProcessingPayment == false) {
                                //   //   vm.makePayment();
                                //   // }
                                //   // } else {
                                //   vm.showRatingDetails(vm.trip);
                                //   //}
                                // },
                                showArrowIcon: true,
                              ),
                      ),
                const SizedBox(height: Dimensions.padding_10),
              ],
            ),
            //scaffoldKey: scaffoldKey,
          ),
        );
      }),
    );
  }
}
