import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:taxiappzpro/utils/custom_images.dart';

import '../network/response_models/trips_model.dart';
import '../utils/app_constants.dart';
import '../utils/custom_colors.dart';

class AddressView extends StatelessWidget {
  final String prickUpAddress;
  final String dropAddress;
  final String stopAddress;
  final TripModel tripsModel;

  const AddressView(
      {super.key, required this.prickUpAddress, required this.dropAddress, required this.tripsModel, required this.stopAddress});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: CustomColors.clr_414141,
            blurRadius: 2,
            spreadRadius: 0.5,
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Image.asset(
                CustomImages.pickUpIndicator,
                height: 14,
                width: 14,
              ),
              const SizedBox(width: 5),
              Expanded(
                  child: Text(
                    prickUpAddress,
                    style: Theme.of(context)
                        .textTheme
                        .bodySmall
                        ?.copyWith(color: Colors.black, fontSize: 15),
                    overflow: TextOverflow.ellipsis,
                  ))
            ],
          ),
          tripsModel.tripType?.toUpperCase() == AppConstants.local.toUpperCase() ? const SizedBox(height: 12) : const SizedBox(),
          tripsModel.tripType?.toUpperCase() == AppConstants.local.toUpperCase() ? Row(
            children: [
              const SizedBox(
                width: 21,
              ),
              Expanded(
                  child: Container(
                    height: 1,
                    color: CustomColors.clr_919191,
                  ))
            ],
          ) : const SizedBox(),
          tripsModel.tripType?.toUpperCase() == AppConstants.local.toUpperCase() ? const SizedBox(height: 13) : const SizedBox(),
          Visibility(
            visible: stopAddress.isNotEmpty,
            child: Column(
              children: [
                Row(
                  children: [
                    SvgPicture.asset(
                      CustomImages.stopIndicator,
                      height: 14,
                      width: 14,
                    ),
                    const SizedBox(width: 5),
                    Expanded(
                        child: Text(
                          stopAddress,
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(color: Colors.black, fontSize: 15),
                          overflow: TextOverflow.ellipsis,
                        ))
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    const SizedBox(
                      width: 21,
                    ),
                    Expanded(
                        child: Container(
                          height: 1,
                          color: CustomColors.clr_919191,
                        ))
                  ],
                ),
                const SizedBox(height: 13),
              ],
            ),
          ),
          tripsModel.tripType?.toUpperCase() == AppConstants.local.toUpperCase() ? Row(
            children: [
              Image.asset(
                CustomImages.dropIndicator,
                height: 14,
                width: 14,
              ),
              const SizedBox(width: 5),
              Expanded(
                  child: Text(
                    dropAddress,
                    style: Theme.of(context)
                        .textTheme
                        .bodySmall
                        ?.copyWith(color: Colors.black, fontSize: 15),
                    overflow: TextOverflow.ellipsis,
                  ))
            ],
          ) : const SizedBox(),
        ],
      ),
    );
  }
}