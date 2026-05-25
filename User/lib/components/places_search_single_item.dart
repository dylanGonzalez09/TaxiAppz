import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import '../utils/dimensions.dart';

import '../network/response_models/places_search_model.dart';
import '../utils/custom_images.dart';

class PlacesSearchSingleItem extends StatelessWidget {
  final PlacesSearchModel model;
  // final Function(PlacesSearchModel, BuildContext) onPlaceSelected;

  const PlacesSearchSingleItem(
      {super.key, required this.model,
        // required this.onPlaceSelected
      });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 1.0, horizontal: 2),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8.0),
            child: SvgPicture.asset(
              CustomImages.logo,
              width: 15, // Icon size
              height: 15,
            ),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(model.structuredFormatting?.mainText ?? "",
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context)
                        .textTheme
                        .bodyMedium
                        ?.copyWith(
                      fontSize: 14,
                      overflow: TextOverflow.ellipsis,
                    )),
                Text(model.description ?? "",
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context)
                        .textTheme
                        .bodyMedium
                        ?.copyWith(
                      fontSize: 12,
                      overflow: TextOverflow.ellipsis,
                    )),
                SizedBox(height: Dimensions.padding_5,),
                // Container(
                //   height: 0.5,
                //   color:
                //   CustomColors.clr_919191,
                // ),
              ],
            ),
          )
        ],
      ),
    );
  }
}