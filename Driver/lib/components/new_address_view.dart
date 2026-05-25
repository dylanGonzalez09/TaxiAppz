import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:taxiappzpro/utils/custom_images.dart';

import '../network/response_models/trips_model.dart';

class NewAddressView extends StatelessWidget {
  final String prickUpAddress;
  final String dropAddress;
  final String stopAddress;
  final TripModel tripsModel;

  // Distance texts
  final String pickUpDistance;
  final String stopDistance; // New parameter for stop distance
  final String dropDistance;

  const NewAddressView({
    super.key,
    required this.prickUpAddress,
    required this.dropAddress,
    required this.tripsModel,
    required this.stopAddress,
    required this.pickUpDistance, // e.g., "5 min (1.5 Km) away"
    required this.stopDistance, // e.g., "10 min (3.2 Km)"
    required this.dropDistance, // e.g., "30 min (9.5 Km) trip"
  });

  Widget _distanceRow(String text, BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 2),
      child: Text(
        text,
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Colors.black,
              fontSize: 15,
              fontWeight: FontWeight.w700,
            ),
      ),
    );
  }

  Widget _addressRow({
    required String text,
    required BuildContext context,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Text(
        text,
        style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.black54, fontSize: 13),
        overflow: TextOverflow.clip,
        maxLines: 2,
      ),
    );
  }

  Widget _arrow() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: SvgPicture.asset(
        CustomImages.arrow_Down,
        height: 30,
        width: 30,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isLocal = tripsModel.tripType?.toUpperCase() == "LOCAL";

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 15),
      color: Colors.white,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Image.asset(
                CustomImages.pickUpIndicator,
                height: 14,
                width: 14,
              ),
              if (isLocal) _arrow(),
              if (isLocal && stopAddress.isNotEmpty) ...[
                SvgPicture.asset(
                  CustomImages.stopIndicator,
                  height: 14,
                  width: 14,
                ),
                _arrow(),
              ],
              if (isLocal)
                Image.asset(
                  CustomImages.dropIndicator,
                  height: 14,
                  width: 14,
                ),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _distanceRow(pickUpDistance, context),
                _addressRow(text: prickUpAddress, context: context),
                SizedBox(height: 5),
                if (isLocal && stopAddress.isNotEmpty) ...[
                  _distanceRow(stopDistance, context),
                  _addressRow(text: stopAddress, context: context),
                ],
                SizedBox(height: 10),
                if (isLocal) _distanceRow(dropDistance, context),
                if (isLocal) _addressRow(text: dropAddress, context: context),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
