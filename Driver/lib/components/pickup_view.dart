import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:taxiappzpro/utils/custom_images.dart';
import 'package:taxiappzpro/utils/dimensions.dart';

import '../utils/custom_colors.dart';

class PickupView extends StatelessWidget {
  final String address;
  final bool isDrop;
  final String stopAddress;

  const PickupView(
      {super.key,
      required this.address,
      required this.isDrop,
      required this.stopAddress});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.zero,
      decoration: BoxDecoration(
        color: const Color(0xFFFFFFFF),
        borderRadius: BorderRadius.circular(10),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.5),
            spreadRadius: 1,
            blurRadius: 5,
            offset: const Offset(0, 0), // changes position of shadow
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (isDrop && stopAddress.isNotEmpty) ...[
              Row(
                children: [
                  SvgPicture.asset(
                    CustomImages.stopIndicator,
                    height: 12,
                    width: 12,
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      stopAddress,
                      style: Theme.of(context)
                          .textTheme
                          .bodySmall
                          ?.copyWith(color: Colors.black, fontSize: 14),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: Dimensions.padding_10),
              const Divider(
                height: 0.6,
                color: CustomColors.clr_ADADAD,
              ),
              const SizedBox(height: Dimensions.padding_8),
            ],
            Row(
              children: [
                Image.asset(
                  isDrop
                      ? CustomImages.dropIndicator
                      : CustomImages.pickUpIndicator,
                  height: 12,
                  width: 12,
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    address,
                    style: Theme.of(context)
                        .textTheme
                        .bodySmall
                        ?.copyWith(color: Colors.black, fontSize: 14),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
