import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../utils/custom_colors.dart';
import '../utils/custom_images.dart';
import '../utils/dimensions.dart';


class AddressView extends StatelessWidget {
  final String pickupAddress;
  final String dropAddress;
  final String stopAddress;
  final bool isPickUpOnly;

  const AddressView({
    super.key,
    required this.pickupAddress,
    required this.dropAddress,
    this.isPickUpOnly = false,
    required this.stopAddress,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(Dimensions.padding_10),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.shade300,
            blurRadius: 2.5,
            offset: const Offset(0, 0),
            spreadRadius: 2,
          ),
        ],
      ),
      padding: const EdgeInsets.all(Dimensions.padding_10),
      child: Column(
        children: [
          Row(
            children: [
              SvgPicture.asset(CustomImages.pickUpDot),
              const SizedBox(width: Dimensions.padding_5),
              Expanded(
                child: Text(
                  pickupAddress,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(fontSize: 14),
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                ),
              ),
            ],
          ),
          if (!isPickUpOnly) ...[
            const SizedBox(height: Dimensions.padding_12),
            const Divider(height: 0.8, color: CustomColors.clr_919191),
            const SizedBox(height: Dimensions.padding_12),
            if (stopAddress.isNotEmpty) ...[
              Row(
                children: [
                  SvgPicture.asset(CustomImages.stopDot),
                  const SizedBox(width: Dimensions.padding_5),
                  Expanded(
                    child: Text(
                      stopAddress,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(fontSize: 14),
                      overflow: TextOverflow.ellipsis,
                      maxLines: 1,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: Dimensions.padding_12),
              const Divider(height: 0.8, color: CustomColors.clr_919191),
              const SizedBox(height: Dimensions.padding_12),
            ],
            Row(
              children: [
                SvgPicture.asset(CustomImages.dropDot),
                const SizedBox(width: Dimensions.padding_5),
                Expanded(
                  child: Text(
                    dropAddress,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(fontSize: 14),
                    overflow: TextOverflow.ellipsis,
                    maxLines: 1,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}