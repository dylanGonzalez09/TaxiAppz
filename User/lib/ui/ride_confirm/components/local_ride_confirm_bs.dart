import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import '../../../utils/app_constants.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/dimensions.dart';
import '../ride_confirm_vm.dart';
import '../../../utils/custom_images.dart';
import '../../../utils/custom_router.dart';
import '../../../utils/theme_data.dart';
import 'address_view.dart';

class LocalRideConfirmBs extends StatelessWidget {
  final RideConfirmVm vm;
  final scrollController = ScrollController();
  LocalRideConfirmBs({super.key, required this.vm});

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.6,
        minChildSize: 0.6,
        maxChildSize: 0.9,
        builder: (context, controller) {
          return Container(
            decoration: BoxDecoration(
              boxShadow: [
                BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 4,
                    spreadRadius: 8)
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
                    // Top handle
                    Padding(
                      padding: const EdgeInsets.only(top: 10),
                      child: Container(
                        height: 3,
                        width: 45,
                        decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(5),
                            color: CustomColors.clr_AAAAAA),
                      ),
                    ),

                    // Main scrollable content
                    Expanded(
                      child: SingleChildScrollView(
                        controller: controller,
                        child: Column(
                          children: [
                            // Address View
                            AddressView(vm: vm),
                            vm.isShimmerLoading
                                ? ListView.builder(
                              itemCount: 4,
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
                                      color: Colors.grey.withValues(alpha: 0.2),
                                      borderRadius: BorderRadius.circular(Dimensions.padding_10),
                                    ),
                                  ),
                                );
                              },
                            )
                                : vm.vehicleModelDetails.isEmpty
                                ? Padding(
                              padding: const EdgeInsets.only(top: 20),
                              child: Column(
                                children: [
                                  SvgPicture.asset(
                                    CustomImages.notificationNotFound,
                                    height: 120,
                                  ),
                                  const SizedBox(height: 10),
                                  Text(
                                    vm.translation.txt_no_vehicle,
                                    style: Theme.of(context).textTheme.labelMedium,
                                  ),
                                ],
                              ),
                            )
                                : Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: Dimensions.padding_10,
                              ),
                              // REMOVED: Fixed height SizedBox
                              child: ListView.builder(
                                  controller: scrollController,
                                  itemCount: vm.vehicleModelDetails.length,
                                  physics: const NeverScrollableScrollPhysics(),
                                  shrinkWrap: true,
                                  itemBuilder: (context, index) {
                                    final model = vm.vehicleModelDetails[index];
                                    return InkWell(
                                      onTap: () {
                                        vm.onVehicleTypeSelected(index);

                                        // Calculate item position for scrolling
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
                                            vertical: Dimensions.padding_4),
                                        margin: const EdgeInsets.only(
                                            bottom: Dimensions.padding_4),
                                        decoration: BoxDecoration(
                                            color: model.isSelected
                                                ? CustomColors.selectedColor
                                                : Colors.white,
                                            border: Border.all(
                                                width: 1,
                                                color: model.isSelected
                                                    ? CustomColors.primaryColor
                                                    : Colors.white),
                                            borderRadius: BorderRadius.circular(
                                                Dimensions.padding_10)),
                                        child: Row(
                                          crossAxisAlignment:
                                          CrossAxisAlignment.center,
                                          mainAxisAlignment:
                                          MainAxisAlignment.start,
                                          children: [
                                            SizedBox(
                                              width: 60,
                                              child: CachedNetworkImage(
                                                imageUrl:
                                                "${AppConstants.imageBaseUrl}${vm.vehicleModelDetails[index].typeImage ?? ""}",
                                                fit: BoxFit.fitWidth,
                                                placeholder: (context, url) =>
                                                const SizedBox(),
                                                errorWidget:
                                                    (context, url, error) =>
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
                                                    vm.vehicleModelDetails[index].typeName ?? "",
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                    style: Theme.of(context).textTheme.labelLarge?.copyWith(
                                                      color: Colors.black,
                                                      fontSize: 15,
                                                    ),
                                                  ),
                                                  const SizedBox(height: Dimensions.padding_3),
                                                  Text(
                                                    vm.vehicleModelDetails[index].estimatedTime == null ||
                                                        vm.vehicleModelDetails[index].estimatedTime! <= 0
                                                        ? "..."
                                                        : "${vm.vehicleModelDetails[index].estimatedTime} ${vm.translation.txt_minute}",
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
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
                                                if (vm.vehicleModelDetails[index]
                                                    .totalAmount !=
                                                    null &&
                                                    vm.vehicleModelDetails[index]
                                                        .totalAmount
                                                        .toString()
                                                        .isNotEmpty)
                                                  if (vm.vehicleModelDetails[index]
                                                      .promoAmount ==
                                                      null ||
                                                      vm.vehicleModelDetails[index]
                                                          .promoAmount ==
                                                          0)
                                                    Text(
                                                      "${vm.currencySymbol} ${vm.vehicleModelDetails[index].totalAmount?.round().toStringAsFixed(2) ?? ""}",
                                                      style: Theme.of(context)
                                                          .textTheme
                                                          .bodyMedium
                                                          ?.copyWith(
                                                        fontSize: 15,
                                                        fontWeight: FontWeight.w700,
                                                      ),
                                                    )
                                                  else
                                                    Column(
                                                      mainAxisSize: MainAxisSize.min,
                                                      crossAxisAlignment: CrossAxisAlignment.center,
                                                      children: [
                                                        Text(
                                                          "${vm.currencySymbol} ${vm.vehicleModelDetails[index].promoAmount?.round().toStringAsFixed(2) ?? ""}",
                                                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                                            fontSize: 15,
                                                            fontWeight: FontWeight.w700,
                                                          ),
                                                        ),
                                                        Text(
                                                          "${vm.currencySymbol} ${vm.vehicleModelDetails[index].totalAmount?.round().toStringAsFixed(2) ?? ""}",
                                                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                                            color: Colors.red,
                                                            fontSize: 13,
                                                            fontWeight: FontWeight.w600,
                                                            height: 1,
                                                            decoration: TextDecoration.lineThrough,
                                                            decorationThickness: 2,
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
                                  }
                            ),
                            ),

                            // Add padding at bottom to prevent overflow
                            const SizedBox(height: 16),
                          ],
                        ),
                      ),
                    ),

                    // Bottom fixed section - FIXED: Reduced padding/margins
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
                        mainAxisSize: MainAxisSize.min, // ADDED: Minimize vertical space
                        children: [
                          const SizedBox(height: 4),

                          // Payment and Promo section
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
                                              vm.paymentTypeModel?.id?.toUpperCase() ==
                                                  AppConstants.wallet.toUpperCase()
                                                  ? const Icon(
                                                Icons.wallet,
                                                color: CustomColors
                                                    .svgImageColorDarkBlue,
                                                size: 20,
                                              )
                                                  : vm.paymentTypeModel?.id
                                                  ?.toUpperCase() ==
                                                  AppConstants.card
                                                      .toUpperCase()
                                                  ? const Icon(
                                                Icons.credit_card_outlined,
                                                color: CustomColors
                                                    .svgImageColorDarkBlue,
                                                size: 20,
                                              )
                                                  : SvgPicture.asset(
                                                CustomImages.cashImage,
                                                height: 14,
                                                width: 20,
                                              ),
                                              const SizedBox(
                                                  width: Dimensions.padding_7),
                                              Text(vm.translation.txt_Payment,
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .labelSmall),
                                              const SizedBox(
                                                  width: Dimensions.padding_5),
                                              const Icon(
                                                Icons.arrow_drop_down,
                                                size: 30,
                                              )
                                            ],
                                          ),
                                          Text(vm.paymentTypeModel?.name ?? "",
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .labelSmall
                                                  ?.copyWith(
                                                  fontSize: 12,
                                                  color:
                                                  CustomColors.clr_FE0000))
                                        ],
                                      )),
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
                                                  vm.promoModel =
                                                  onValue[AppConstants.promoCode];
                                                  vm.getTypes();
                                                }
                                              });
                                            }
                                          },
                                          child: Column(
                                            mainAxisSize: MainAxisSize.min, // ADDED
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
                                                        ? vm.translation.txt_Applied_promo
                                                        : vm.translation.txt_Apply_promo,
                                                    style: themeData
                                                        .textTheme.labelMedium
                                                        ?.copyWith(
                                                        fontWeight: FontWeight.w400,
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
                                                        fontWeight: FontWeight.w400,
                                                        color:
                                                        CustomColors.clr_35CF08,
                                                        fontSize: 12),
                                                  ),
                                                  const SizedBox(width: 10),
                                                  if (vm.promoModel?.id != null)
                                                    InkWell(
                                                        onTap: () {
                                                          showDialog(
                                                            context: context,
                                                            builder:
                                                                (BuildContext context) {
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
                                                                        fontSize: 16)),
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
                                                                      color:
                                                                      Colors.black,
                                                                      fontSize: 15),
                                                                  maxLines: 3,
                                                                ),
                                                                actions: [
                                                                  Center(
                                                                    child: GestureDetector(
                                                                      onTap: () {
                                                                        vm.promoModel =
                                                                        null;
                                                                        Navigator.of(
                                                                            context)
                                                                            .pop();
                                                                        vm.getTypes();
                                                                      },
                                                                      child: Container(
                                                                        padding: const EdgeInsets
                                                                            .symmetric(
                                                                            horizontal: 44,
                                                                            vertical: 6),
                                                                        decoration:
                                                                        BoxDecoration(
                                                                          color: CustomColors
                                                                              .primaryColor,
                                                                          borderRadius:
                                                                          BorderRadius
                                                                              .circular(
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
                                                                                .buttonTxtColor,
                                                                            fontSize: 16,
                                                                          ),
                                                                        ),
                                                                      ),
                                                                    ),
                                                                  ),
                                                                ],
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
                                                                    .fromLTRB(
                                                                    225, 10, 0, 0),
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
                                                              color: CustomColors.clr_303030,
                                                              size: 20,
                                                            ),
                                                            SizedBox(width: 10)
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

                          const SizedBox(height: 8), // REDUCED from 10

                          // Bottom button section
                          Padding(
                            padding: const EdgeInsets.fromLTRB(20, 0, 20, 8), // REDUCED bottom padding
                            child: Row(
                              children: [
                                InkWell(
                                  onTap: () {
                                    print('iowfhqfq');
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
                                      if (vm.rideDateController.text.isNotEmpty) {
                                        vm.createRideLaterRequest(context);
                                      } else {
                                        vm.createRideNowRequest(context);
                                      }
                                    },
                                    child: Stack(
                                      children: [
                                        Container(
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
                                                        child:
                                                        CircularProgressIndicator(
                                                            color: CustomColors
                                                                .buttonTxtColor)),
                                                  ),
                                                )
                                                    : Padding(
                                                  padding: const EdgeInsets.only(
                                                      left: 25),
                                                  child: Column(
                                                    mainAxisAlignment:
                                                    MainAxisAlignment.center,
                                                    crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                    children: [
                                                      Text(
                                                        vm.rideDateController.text
                                                            .isEmpty ||
                                                            (vm.rideDateController
                                                                .text ==
                                                                'Ride Now' &&
                                                                vm.vehicleModelDetails
                                                                    .isNotEmpty)
                                                            ? (vm.selectedIndex <
                                                            vm.vehicleModelDetails
                                                                .length
                                                            ? "${vm.translation.txt_Confirm} ${vm.vehicleModelDetails[vm.selectedIndex].typeName ?? ""}"
                                                            : "${vm.translation.txt_Confirm} ")
                                                            : vm.translation
                                                            .txt_Scheduled_Auto,
                                                        style: const TextStyle(
                                                          color: CustomColors
                                                              .buttonTxtColor,
                                                          fontSize: 16,
                                                          fontWeight:
                                                          FontWeight.w700,
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
                                                        textAlign: TextAlign.center,
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
                                        Shimmer.fromColors(
                                          baseColor: Colors.transparent,
                                          highlightColor: Colors.grey[100]!,
                                          child: Container(
                                            height: 54,
                                            width: double.infinity,
                                            decoration: BoxDecoration(
                                              color: Colors.white
                                                  .withValues(alpha: 0.5),
                                              borderRadius: BorderRadius.circular(
                                                  Dimensions.padding_40),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                )
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                );
              }),
            ),
          );
        });
  }
}