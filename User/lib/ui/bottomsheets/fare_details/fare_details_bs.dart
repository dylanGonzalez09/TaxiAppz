import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import '../../../network/response_models/types_model.dart';
import '../../../utils/app_constants.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';
import '../../../utils/dimensions.dart';
import '../../../utils/utils.dart';
import 'fare_details_bs_vm.dart';

class FareDetailsBs extends StatefulWidget {
  final ZoneTypePrice vehicle;

  const FareDetailsBs({super.key, required this.vehicle});

  @override
  _FareDetailsBs createState() => _FareDetailsBs();
}

class _FareDetailsBs extends State<FareDetailsBs> {
  final vm = FareDetailsBsVm();
  final List<int> selectedIndices = [];

  @override
  Widget build(BuildContext context) {
    final vehicle = widget.vehicle;

    return PopScope(
      child: SizedBox(
        width: double.infinity,
        child: Padding(
          padding: const EdgeInsets.only(top: 8, left: 15, right: 26),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Center(
                child: Text(
                  vm.translation.txt_fare_details,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontSize: 20,
                        overflow: TextOverflow.ellipsis,
                      ),
                ),
              ),
              const SizedBox(height: 15),
              buildRow(
                context,
                title: vm.translation.txt_vehicle_type,
                value: vehicle.typeName ?? "N/A",
                imageUrl:
                    "${AppConstants.imageBaseUrl}${vehicle.typeImage ?? ""}",
              ),
              const SizedBox(height: 10),
              buildRow(
                context,
                title: vm.translation.txt_base_fare,
                subtitle: "For ${vehicle.baseDistance} ${vehicle.unit}",
                value: "${vehicle.currencySymbol} ${vehicle.basePrice?.toStringAsFixed(2) ?? "N/A"}",
              ),
              // const SizedBox(height: 10),
              // buildRow(
              //   context,
              //   title: vm.translation.txt_rate_per_km,
              //   subtitle: "For ${vehicle.baseDistance} ${vehicle.unit}",
              //   value: "₹${vehicle.ratePerKm?.toStringAsFixed(2) ?? "N/A"}",
              // ),
              Visibility(
                visible: Utils.isBillValueNotEmpty(
                        vehicle.pricePerDistanceCost.toString() ?? '0') &&
                    Utils.isBillValueNotEmpty(
                        vehicle.pricePerDistanceUnit.toString() ?? '0'),
                child: const SizedBox(height: 10),
              ),
              Visibility(
                visible: Utils.isBillValueNotEmpty(
                        vehicle.pricePerDistanceCost.toString() ?? '0') &&
                    Utils.isBillValueNotEmpty(
                        vehicle.pricePerDistanceUnit.toString() ?? '0'),
                child: buildRow(
                  context,
                  title: "Price per ${vehicle.unit}",
                  subtitle:
                      "For ${vehicle.pricePerDistanceUnit} ${vehicle.unit}",
                  value:
                      "${vehicle.currencySymbol} ${vehicle.pricePerDistanceCost?.toStringAsFixed(2) ?? "N/A"}",
                ),
              ),

              const SizedBox(height: 10),

              // buildRow(
              //   context,
              //   title: vm.translation.txt_ride_time_charge,
              //   value: "₹${vehicle.estimatedTime?.toStringAsFixed(2) ?? "N/A"}",
              // ),
              // const SizedBox(height: 10),
              buildRow(
                context,
                title: vm.translation.txt_waiting_charge,
                subtitle: "${vm.translation.txt_per_minute} ${vehicle.currencySymbol} ${vehicle.waitingCharge?.toStringAsFixed(2) ?? "N/A"}",
                value: "-----",
              ),
              const SizedBox(height: 10),
              // buildRow(
              //   context,
              //   title: vm.translation.txt_pickup_charge,
              //   value: "₹${vehicle.bookingFees?.toStringAsFixed(2) ?? "N/A"}",
              // ),
              // const SizedBox(height: 10),
              buildTotalFareRow(context, vehicle),
              const SizedBox(height: 10),
              const Divider(
                thickness: 1,
                color: CustomColors.textPlaceholderClr,
              ),
              const SizedBox(height: 8),
              Text(
                vm.translation.txt_note,
                style: const TextStyle(
                  overflow: TextOverflow.ellipsis,
                  fontFamily: AppConstants.latoFont,
                  fontSize: Dimensions.padding_12,
                ),
              ),
              Visibility(
                visible: vehicle.note?.isNotEmpty == true,
                child: ListView.separated(
                    separatorBuilder: (c, i) {
                      return const SizedBox(height: 10);
                    },
                    shrinkWrap: true,
                    itemCount: vehicle.note?.length ?? 0,
                    itemBuilder: (c, p) =>
                        buildNoteRow(context, vehicle.note?[p] ?? "")),
              ),
              const SizedBox(height: 17),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  InkWell(
                    onTap: () async {
                      GoRouter.of(context).pop(true);
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 92,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: CustomColors.primaryColor,
                        borderRadius: BorderRadius.circular(25),
                      ),
                      child: Center(
                        child: Text(
                          vm.translation.txt_close,
                          style:
                              Theme.of(context).textTheme.titleLarge?.copyWith(
                                    color: Colors.white,
                                    fontSize: 18,
                                  ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 15),
            ],
          ),
        ),
      ),
    );
  }

  Widget buildRow(BuildContext context,
      {required String title,
      String? subtitle,
      required String value,
      String? imageUrl}) {
    return Row(
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontSize: 15,
                    color: CustomColors.clr_111111,
                    overflow: TextOverflow.ellipsis,
                  ),
            ),
            if (subtitle != null)
              Text(
                subtitle,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      fontSize: 12,
                      color: CustomColors.clr_303030,
                      overflow: TextOverflow.ellipsis,
                    ),
              ),
          ],
        ),
        const Spacer(),
        if (imageUrl != null)
          SizedBox(
            width: 50,
            child: CachedNetworkImage(
              imageUrl: imageUrl,
              fit: BoxFit.fitWidth,
              placeholder: (context, url) =>
                  SvgPicture.asset(CustomImages.carIcon),
              errorWidget: (context, url, error) =>
                  SvgPicture.asset(CustomImages.carIcon),
            ),
          ),
        if (imageUrl == null)
          Text(
            value,
            style: const TextStyle(
              overflow: TextOverflow.ellipsis,
              fontFamily: AppConstants.latoFont,
              fontSize: Dimensions.padding_15,
            ),
          ),
      ],
    );
  }

  Widget buildTotalFareRow(BuildContext context, ZoneTypePrice vehicle) {
    return Row(
      children: [
        Text(
          vm.translation.txt_total_fare_amount,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontSize: 20,
                color: CustomColors.clr_111111,
                overflow: TextOverflow.ellipsis,
              ),
        ),
        const Spacer(),
        Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            if (vehicle.totalAmount != null &&
                vehicle.totalAmount.toString().isNotEmpty)
              if (vehicle.promoAmount == null || vehicle.promoAmount == 0)
                Text(
                  "${vehicle.currencySymbol} ${vehicle.totalAmount?.toStringAsFixed(2) ?? ""}",
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                )
              else
                Wrap(
                  spacing: 10,
                  alignment: WrapAlignment.center,
                  children: [
                    Text(
                      "${vehicle.currencySymbol} ${vehicle.promoAmount?.toStringAsFixed(2) ?? ""}",
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.red,
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        decoration: TextDecoration.lineThrough,
                        decorationThickness: 2,
                      ),
                    ),
                    Text(
                      "${vehicle.currencySymbol} ${vehicle.promoAmount?.toStringAsFixed(2) ?? ""}",
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                  ],
                ),
          ],
        )
      ],
    );
  }

  Widget buildNoteRow(BuildContext context, String note) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 6),
          child: SvgPicture.asset(
            CustomImages.blackDotIcon,
            height: Dimensions.padding_6,
            width: Dimensions.padding_6,
          ),
        ),
        const SizedBox(width: 4),
        Expanded(
          child: Text(
            note,
            maxLines: 20,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  fontSize: 11,
                  color: CustomColors.clr_000000,
                  overflow: TextOverflow.ellipsis,
                ),
          ),
        ),
      ],
    );
  }
}
