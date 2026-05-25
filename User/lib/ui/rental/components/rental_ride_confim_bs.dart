import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import 'package:user/ui/rental/components/rental_address_view.dart';
import 'package:user/ui/rental/components/slider_view_rental.dart';

import '../../../utils/app_constants.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';
import '../../../utils/custom_router.dart';
import '../../../utils/dimensions.dart';
import '../../../utils/theme_data.dart';
import '../rental_vm.dart';

class RentalRideConfirmBs extends StatelessWidget {
  final RentalVm vm;
  final scrollController = ScrollController();
  RentalRideConfirmBs({super.key, required this.vm});

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.7,
      minChildSize: 0.6,
      maxChildSize: 0.9,
      builder: (context, control) {
        return Container(
          decoration: BoxDecoration(
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 4,
                spreadRadius: 8,
              ),
            ],
            borderRadius: const BorderRadius.only(
              topRight: Radius.circular(20),
              topLeft: Radius.circular(20),
            ),
            color: Colors.white,
          ),
          child: ClipRRect(
            borderRadius: const BorderRadius.only(
              topRight: Radius.circular(20),
              topLeft: Radius.circular(20),
            ),
            child: LayoutBuilder(builder: (context, constraints) {
              if (!vm.isConstraintSet) {
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  vm.setConstraints(constraints.maxHeight);
                });
              }
              return Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.only(top: 10),
                    child: Container(
                      height: 3,
                      width: 45,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(5),
                        color: CustomColors.clr_AAAAAA,
                      ),
                    ),
                  ),
                  Expanded(
                    child: Column(
                      children: [
                        RentalAddressView(vm: vm),
                        SliderViewRental(vm: vm),
                        const SizedBox(height: Dimensions.padding_8),
                        vm.selectedPackage?.vehiclePrices?.isEmpty == true &&
                            vm.isShimmerLoading
                            ? Expanded(
                          child: ListView.builder(
                            itemCount: 3,
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemBuilder: (context, index) {
                              return Shimmer.fromColors(
                                baseColor: Colors.grey,
                                highlightColor: Colors.white,
                                child: Container(
                                  height: 40,
                                  margin: const EdgeInsets.only(
                                    bottom: Dimensions.padding_5,
                                    left: Dimensions.padding_20,
                                    right: Dimensions.padding_20,
                                  ),
                                  width: double.infinity,
                                  decoration: BoxDecoration(
                                    color: Colors.grey
                                        .withValues(alpha: 0.2),
                                    borderRadius: BorderRadius.circular(
                                        Dimensions.padding_10),
                                  ),
                                ),
                              );
                            },
                          ),
                        )
                            : Padding(
                          padding: const EdgeInsets.symmetric(
                              horizontal: Dimensions.padding_10),
                          child: SizedBox(
                            height: MediaQuery.of(context).size.height * 0.21,
                            child: ListView.builder(
                              controller: scrollController,
                              itemCount: vm.selectedPackage?.vehiclePrices?.length ?? 0,
                              physics: const BouncingScrollPhysics(),
                              shrinkWrap: false,
                              itemBuilder: (context, index) {
                                final model = vm.selectedPackage?.vehiclePrices?[index];

                                return InkWell(
                                  onTap: () {
                                    vm.onVehicleTypeSelected(index);
                                    final double itemHeight = 100; // Approximate item height

                                    if (scrollController.hasClients) {
                                      final double viewportHeight = constraints.maxHeight;
                                      final double scrollOffset =
                                          (index * itemHeight) -
                                              (viewportHeight / 2) +
                                              (itemHeight / 2);

                                      scrollController.animateTo(
                                        scrollOffset.clamp(
                                            0.0,
                                            scrollController.position
                                                .maxScrollExtent),
                                        duration: const Duration(
                                            milliseconds: 300),
                                        curve: Curves.easeOut,
                                      );
                                    }
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: Dimensions.padding_15,
                                      vertical: Dimensions.padding_4,
                                    ),
                                    margin: const EdgeInsets.only(
                                        bottom: Dimensions.padding_4),
                                    decoration: BoxDecoration(
                                      color: model?.isSelected == true
                                          ? CustomColors.selectedColor
                                          : Colors.white,
                                      border: Border.all(
                                        width: 1,
                                        color: model?.isSelected == true
                                            ? CustomColors.primaryColor
                                            : Colors.white,
                                      ),
                                      borderRadius: BorderRadius.circular(
                                          Dimensions.padding_10),
                                    ),
                                    child: Row(
                                      crossAxisAlignment:
                                      CrossAxisAlignment.center,
                                      mainAxisAlignment:
                                      MainAxisAlignment.start,
                                      children: [
                                        SizedBox(
                                          width: 50,
                                          child: CachedNetworkImage(
                                            imageUrl:
                                            //'https://www.gstatic.com/webp/gallery/1.webp',
                                            "${AppConstants.imageBaseUrl}${vm.selectedPackage?.vehiclePrices?[index].image ?? ""}",
                                            fit: BoxFit.fitWidth,
                                            placeholder: (context, url) =>
                                            const SizedBox(),
                                            // SvgPicture.asset(CustomImages
                                            //     .vehicleTypePlaceHolder),
                                            errorWidget: (context, url,
                                                error) =>
                                                SvgPicture.asset(CustomImages
                                                    .vehicleTypePlaceHolder),
                                          ),
                                        ),
                                        const SizedBox(
                                            width: Dimensions.padding_20),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                vm.selectedPackage?.vehiclePrices?[index].vehicleName ?? "",
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                                                  color: Colors.black,
                                                  fontSize: 15,
                                                ),
                                              ),
                                              const SizedBox(height: Dimensions.padding_3),
                                              Text(
                                                vm.selectedPackage?.vehiclePrices?[index].estimatedTime != null &&
                                                    vm.selectedPackage!.vehiclePrices![index].estimatedTime > 0 &&
                                                    vm.selectedPackage?.vehiclePrices?[index].vehicleId ==
                                                        vm.selectedVehicleId &&
                                                    vm.selectedPackage?.vehiclePrices?[index].isSelected == true
                                                    ? "${vm.selectedPackage?.vehiclePrices?[index].estimatedTime} min"
                                                    : "...",
                                                style: Theme.of(context).textTheme.labelSmall?.copyWith(fontSize: 12),
                                              ),
                                            ],
                                          ),
                                        ),
                                        Column(
                                          mainAxisSize: MainAxisSize.min,
                                          crossAxisAlignment:
                                          CrossAxisAlignment.center,
                                          children: [
                                            if (vm
                                                .selectedPackage
                                                ?.vehiclePrices?[
                                            index]
                                                .price !=
                                                null)
                                              if (vm
                                                  .selectedPackage
                                                  ?.vehiclePrices?[
                                              index]
                                                  .promoAmount ==
                                                  null ||
                                                  vm
                                                      .selectedPackage
                                                      ?.vehiclePrices?[
                                                  index]
                                                      .promoAmount ==
                                                      0)
                                                Text(
                                                  "${vm.currencySymbol} ${vm.selectedPackage?.vehiclePrices?[index].price?.round().toStringAsFixed(2) ?? ""}",
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .bodyMedium
                                                      ?.copyWith(
                                                    fontSize: 15,
                                                    fontWeight:
                                                    FontWeight
                                                        .w700,
                                                  ),
                                                )
                                              else
                                                Wrap(
                                                  spacing: 10,
                                                  alignment: WrapAlignment
                                                      .center,
                                                  children: [
                                                    Text(
                                                      "${vm.currencySymbol} ${vm.selectedPackage?.vehiclePrices?[index].price?.round().toStringAsFixed(2) ?? ""}",
                                                      style: Theme.of(
                                                          context)
                                                          .textTheme
                                                          .bodyMedium
                                                          ?.copyWith(
                                                        color: Colors
                                                            .red,
                                                        fontSize: 15,
                                                        fontWeight:
                                                        FontWeight
                                                            .w700,
                                                        decoration:
                                                        TextDecoration
                                                            .lineThrough,
                                                        decorationThickness:
                                                        1,
                                                      ),
                                                    ),
                                                    Text(
                                                      "${vm.currencySymbol} ${vm.selectedPackage?.vehiclePrices?[index].promoAmount?.round().toStringAsFixed(2) ?? ""}",
                                                      style: Theme.of(
                                                          context)
                                                          .textTheme
                                                          .bodyMedium
                                                          ?.copyWith(
                                                        fontSize: 15,
                                                        fontWeight:
                                                        FontWeight
                                                            .w700,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                          ],
                                        ),
                                        const SizedBox(
                                            width: Dimensions.padding_5),
                                        InkWell(
                                          onTap: () {
                                            vm.showFareDetails(index);
                                          },
                                          child: Padding(
                                            padding: const EdgeInsets.only(
                                                bottom:
                                                Dimensions.padding_30),
                                            child: SvgPicture.asset(
                                              CustomImages.infoVehicleImage,
                                              height: 15,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    decoration: BoxDecoration(
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.1),
                          blurRadius: 8,
                          spreadRadius: 1.5,
                          offset: const Offset(0, -6),
                        ),
                      ],
                      color: Colors.white,
                    ),
                    child: Column(
                      children: [
                        const SizedBox(height: 4),
                        IntrinsicHeight(
                          child: Row(
                            children: [
                              Expanded(
                                child: GestureDetector(
                                  onTap: () {
                                    vm.showPaymentMethod();
                                  },
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          vm.paymentTypeModel?.id
                                              ?.toUpperCase() ==
                                              AppConstants.wallet
                                                  .toUpperCase()
                                              ? const Icon(
                                            Icons.wallet,
                                            color:
                                            CustomColors.primaryColor,
                                            size: 20,
                                          )
                                              : vm.paymentTypeModel?.id
                                              ?.toUpperCase() ==
                                              AppConstants.card
                                                  .toUpperCase()
                                              ? const Icon(
                                            Icons
                                                .credit_card_outlined,
                                            color: CustomColors
                                                .primaryColor,
                                            size: 20,
                                          )
                                              : SvgPicture.asset(
                                            CustomImages.cashImage,
                                            height: 14,
                                            width: 20,
                                          ),
                                          const SizedBox(
                                              width: Dimensions.padding_7),
                                          Text(
                                            vm.translation.txt_Payment,
                                            style: Theme.of(context)
                                                .textTheme
                                                .labelSmall,
                                          ),
                                          const SizedBox(
                                              width: Dimensions.padding_5),
                                          const Icon(
                                            Icons.arrow_drop_down,
                                            size: 30,
                                          ),
                                        ],
                                      ),
                                      Text(
                                        vm.paymentTypeModel?.name ?? "",
                                        style: Theme.of(context)
                                            .textTheme
                                            .labelSmall
                                            ?.copyWith(
                                            fontSize: 12,
                                            color: CustomColors.clr_FE0000),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              Container(
                                  width: 0.5, color: CustomColors.clr_AAAAAA),
                              Expanded(
                                  child: Center(
                                    child: Padding(
                                      padding:
                                      const EdgeInsets.only(left: 10, right: 5),
                                      child: InkWell(
                                        onTap: () {
                                          if (vm.promoModel?.id == null) {
                                            vm.moveAndWait(CustomRouter.applyPromoScreen, args: vm.selectedVehicleId).then((onValue) {
                                              if (onValue != null) {
                                                print('jgsfjhgfhgfj$onValue');
                                                vm.promoModel =
                                                onValue[AppConstants.promoCode];
                                                vm.getRentalList();
                                              }
                                            });
                                          }
                                        },
                                        child: Column(
                                          children: [
                                            vm.promoModel?.id == null
                                                ? const SizedBox(
                                              height: Dimensions.padding_12,
                                            )
                                                : const SizedBox(),
                                            Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                SvgPicture.asset(
                                                    CustomImages.promoImage,
                                                    height: 14,
                                                    width: 20),
                                                const SizedBox(
                                                    width: Dimensions.padding_5),
                                                Text(
                                                  vm.promoModel?.id != null
                                                      ? vm.translation
                                                      .txt_Applied_promo
                                                      : vm.translation
                                                      .txt_Apply_promo,
                                                  style: themeData
                                                      .textTheme.labelMedium
                                                      ?.copyWith(
                                                      fontWeight:
                                                      FontWeight.w400,
                                                      color: Colors.black,
                                                      fontSize: 15),
                                                ),
                                                const Icon(
                                                  Icons.arrow_drop_down,
                                                  size: 30,
                                                )
                                              ],
                                            ),
                                            Row(
                                              mainAxisAlignment:
                                              MainAxisAlignment.center,
                                              children: [
                                                Text(
                                                  vm.promoModel?.promoCode ?? '',
                                                  style: themeData
                                                      .textTheme.labelMedium
                                                      ?.copyWith(
                                                      fontWeight:
                                                      FontWeight.w400,
                                                      color: CustomColors
                                                          .clr_35CF08,
                                                      fontSize: 12),
                                                ),
                                                const SizedBox(
                                                  width: 10,
                                                ),
                                                if (vm.promoModel?.id != null)
                                                  InkWell(
                                                      onTap: () {
                                                        showDialog(
                                                          context: context,
                                                          builder: (BuildContext
                                                          context) {
                                                            return AlertDialog(
                                                              backgroundColor:
                                                              Colors.white,
                                                              title: Text(
                                                                  vm.translation
                                                                      .txt_clear_promo,
                                                                  style: themeData
                                                                      .textTheme
                                                                      .labelMedium
                                                                      ?.copyWith(
                                                                      fontWeight:
                                                                      FontWeight
                                                                          .w600,
                                                                      color: Colors
                                                                          .black,
                                                                      fontSize:
                                                                      16)),
                                                              content: Text(
                                                                vm.translation
                                                                    .txt_clear_promo_desc,
                                                                style: themeData
                                                                    .textTheme
                                                                    .labelMedium
                                                                    ?.copyWith(
                                                                    fontWeight:
                                                                    FontWeight
                                                                        .w400,
                                                                    color: Colors
                                                                        .black,
                                                                    fontSize:
                                                                    15),
                                                                maxLines: 3,
                                                              ),
                                                              actions: [
                                                                Center(
                                                                  child:
                                                                  GestureDetector(
                                                                    onTap: () {
                                                                      vm.promoModel =
                                                                      null;
                                                                      Navigator.of(
                                                                          context)
                                                                          .pop();
                                                                      vm.getRentalList();
                                                                    },
                                                                    child:
                                                                    Container(
                                                                      padding: const EdgeInsets
                                                                          .symmetric(
                                                                          horizontal:
                                                                          44,
                                                                          vertical:
                                                                          6),
                                                                      decoration:
                                                                      BoxDecoration(
                                                                        color: CustomColors
                                                                            .primaryColor,
                                                                        borderRadius:
                                                                        BorderRadius.circular(
                                                                            25),
                                                                      ),
                                                                      child: Text(
                                                                        vm.translation
                                                                            .txt_yes,
                                                                        style: themeData
                                                                            .textTheme
                                                                            .labelMedium
                                                                            ?.copyWith(
                                                                          fontWeight:
                                                                          FontWeight
                                                                              .w400,
                                                                          color: CustomColors
                                                                              .clr_191919,
                                                                          fontSize:
                                                                          16,
                                                                        ),
                                                                      ),
                                                                    ),
                                                                  ),
                                                                ),
                                                              ],
                                                              //actionsPadding: const EdgeInsets.fromLTRB(0, 10, 0, 10),
                                                              icon: GestureDetector(
                                                                  onTap: () {
                                                                    Navigator.of(
                                                                        context)
                                                                        .pop();
                                                                  },
                                                                  child: const Icon(
                                                                    Icons.cancel,
                                                                    color: CustomColors
                                                                        .clr_AAAAAA,
                                                                    size: 30,
                                                                  )),
                                                              iconPadding:
                                                              const EdgeInsets
                                                                  .fromLTRB(225,
                                                                  10, 0, 0),
                                                            );
                                                          },
                                                        );
                                                      },
                                                      child: const Row(
                                                        mainAxisAlignment:
                                                        MainAxisAlignment.end,
                                                        children: [
                                                          Icon(
                                                            Icons.cancel,
                                                            color: CustomColors
                                                                .clr_303030,
                                                            size: 20,
                                                          ),
                                                          SizedBox(
                                                            width: 10,
                                                          )
                                                        ],
                                                      )),
                                              ],
                                            )
                                          ],
                                        ),
                                      ),
                                    ),
                                  )),
                            ],
                          ),
                        ),
                        const SizedBox(height: Dimensions.padding_10),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: Row(
                            children: [
                              InkWell(
                                onTap: () {
                                  vm.showDatePicker();
                                },
                                child: Container(
                                  height: 50,
                                  width: 50,
                                  decoration: const BoxDecoration(
                                    borderRadius:
                                    BorderRadius.all(Radius.circular(15)),
                                    color: Colors.white,
                                    boxShadow: [
                                      BoxShadow(
                                        color: CustomColors.primaryColor,
                                        blurRadius: 2.3,
                                        spreadRadius: 0.9,
                                        offset: Offset(0, 0),
                                      ),
                                    ],
                                  ),
                                  child: Padding(
                                    padding: const EdgeInsets.all(14),
                                    child: SvgPicture.asset(
                                      CustomImages.calendarIcon2,
                                      colorFilter: const ColorFilter.mode(
                                        CustomColors.shadeBlack,
                                        BlendMode.srcIn,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: InkWell(
                                  onTap: () {
                                    if (vm.isLoading.value == false) {
                                      // if (vm.paymentTypeModel?.id
                                      //             ?.toUpperCase() ==
                                      //         AppConstants.wallet
                                      //             .toUpperCase() &&
                                      //     !(AppConstants.userWalletBalance !=
                                      //             null &&
                                      //         AppConstants
                                      //                 .userWalletBalance! >
                                      //             0 &&
                                      //         vm.selectedVehicle?.price
                                      //                 ?.toDouble() !=
                                      //             null &&
                                      //         vm.selectedVehicle!.price!
                                      //                 .toDouble() <=
                                      //             AppConstants
                                      //                 .userWalletBalance!)) {
                                      //   vm.showErrorDialog(
                                      //       message: vm.translation
                                      //           .txtLowWalletBalanceCreateTripDesc,
                                      //       onClick: () {
                                      //         GoRouter.of(context).pop();
                                      //         vm.walletScreen;
                                      //       });
                                      // } else
                                      if (vm
                                          .rideDateController.text.isNotEmpty) {
                                        vm.createRideLaterRequest(context);
                                      } else {
                                        vm.createRideNowRequest(context);
                                      }
                                    }
                                  },
                                  child: Container(
                                    height: 54,
                                    width: double.infinity,
                                    decoration: BoxDecoration(
                                      color: CustomColors.primaryColor,
                                      borderRadius: BorderRadius.circular(
                                          Dimensions.padding_40),
                                    ),
                                    child: Row(
                                      children: [
                                        Expanded(
                                          flex: 4,
                                          child: vm.isLoading.value == true
                                              ? const Padding(
                                            padding:
                                            EdgeInsets.only(left: 25),
                                            child: Center(
                                              child: SizedBox(
                                                  width: 30,
                                                  height: 30,
                                                  child: CircularProgressIndicator(
                                                      color: CustomColors
                                                          .clr_191919)),
                                            ),
                                          )
                                              : Padding(
                                            padding:
                                            const EdgeInsets.only(
                                                left: 25),
                                            child: Column(
                                              mainAxisAlignment:
                                              MainAxisAlignment
                                                  .center,
                                              crossAxisAlignment:
                                              CrossAxisAlignment
                                                  .start,
                                              children: [
                                                Flexible(
                                                  child: Text(
                                                    "${vm.translation.txt_Confirm} ${"${vm.selectedPackage?.hour} ${vm.translation.txt_hr}"} ${vm.selectedPackage?.km} ${vm.translation.txt_km}",
                                                    style:
                                                    const TextStyle(
                                                      color: CustomColors
                                                          .buttonTxtColor,
                                                      fontSize: 16,
                                                      fontWeight:
                                                      FontWeight.w700,
                                                    ),
                                                  ),
                                                ),
                                                Text(
                                                  vm.rideDateController.text
                                                      .isEmpty ||
                                                      vm.rideDateController
                                                          .text ==
                                                          'Ride Now'
                                                      ? vm.translation
                                                      .txt_ride_now
                                                      : vm.rideDateController
                                                      .text,
                                                  maxLines: vm
                                                      .rideDateController
                                                      .text
                                                      .isEmpty ||
                                                      vm.rideDateController
                                                          .text ==
                                                          'Ride Now'
                                                      ? 1
                                                      : 2,
                                                  style: const TextStyle(
                                                    color: CustomColors
                                                        .buttonTxtColor,
                                                    fontSize: 12,
                                                  ),
                                                  textAlign:
                                                  TextAlign.center,
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: Dimensions.padding_14,
                                            vertical: Dimensions.padding_10,
                                          ),
                                          margin: const EdgeInsets.symmetric(
                                            horizontal: Dimensions.padding_2,
                                            vertical: Dimensions.padding_4,
                                          ),
                                          decoration: const BoxDecoration(
                                            color: CustomColors.buttonTxtColor,
                                            shape: BoxShape.circle,
                                          ),
                                          child: const Icon(
                                            Icons.arrow_forward_rounded,
                                            color: CustomColors.primaryColor,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: Dimensions.padding_20),
                      ],
                    ),
                  ),
                ],
              );
            }),
          ),
        );
      },
    );
  }
}
