import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import '../../../network/response_models/trip_model.dart';
import '../../tripscreen/trip_screen_vm.dart';

import '../../../network/response_models/translation_model.dart';

import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';
import '../../../utils/dimensions.dart';

class RentalMeterBottomSheet extends StatelessWidget {
  final String meterValue, meterImage;
  final TranslationModel translationModel;
  final TRIPSTATUS tripstatus;
  final Trip? trip;
  final bool isTripStarted;

  const RentalMeterBottomSheet(
      {super.key,
      required this.meterValue,
      required this.meterImage,
      required this.translationModel,
      required this.tripstatus,
      required this.trip,
      required this.isTripStarted});

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.all(Dimensions.padding_20),
        child: Column(
            mainAxisSize: MainAxisSize.min,
            spacing: 20,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Row(
                children: [
                  SvgPicture.asset(
                    CustomImages.icDistanceUnit,
                    width: 75,
                    height: 20,
                  ),
                  const SizedBox(
                    width: 15,
                  ),
                  Text(
                    translationModel.txtDistanceMeter,
                    style: Theme.of(context)
                        .textTheme
                        .bodyMedium
                        ?.copyWith(fontSize: 20, fontWeight: FontWeight.w700),
                  ),
                ],
              ),
              Container(
                  height: 130,
                  margin: const EdgeInsets.symmetric(
                      horizontal: Dimensions.padding_40),
                  decoration: BoxDecoration(
                    color: CustomColors.clr_E9E9E9,
                    borderRadius: BorderRadius.circular(Dimensions.padding_5),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(Dimensions.padding_5),
                    child: CachedNetworkImage(
                      fit: BoxFit.cover,
                      width: double.infinity,
                      height: 130,
                      imageUrl: meterImage,
                      fadeInDuration: const Duration(
                        seconds: 1,
                      ),
                      placeholderFadeInDuration:
                      const Duration(
                        milliseconds: 100,
                      ),
                      memCacheWidth: 500,
                      memCacheHeight: 500,
                      maxWidthDiskCache: 500,
                      maxHeightDiskCache: 500,
                      filterQuality: FilterQuality.high,
                      progressIndicatorBuilder: (c, p, l) => const Center(
                        child: SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            color: CustomColors.primaryColor,
                            strokeWidth: 2,
                          ),
                        ),
                      ),
                      errorWidget: (c, e, t) => const Center(
                        child: SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            color: CustomColors.primaryColor,
                            strokeWidth: 2,
                          ),
                        ),
                      ),
                    ),
                  )),
              Text(
                "${isTripStarted ? translationModel.txtEndDistanceUnit : translationModel.txtStartDistanceUnit} : ${meterValue} ${trip?.unit}",
                style: Theme.of(context).textTheme.labelMedium,
              ),
              InkWell(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      vertical: Dimensions.padding_10,
                      horizontal: Dimensions.padding_40),
                  decoration: BoxDecoration(
                      color: CustomColors.primaryColor,
                      borderRadius:
                          BorderRadius.circular(Dimensions.padding_40)),
                  child: Text(translationModel.txt_Ok,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.white
                  ),

                  ),
                ),
                onTap: () => Navigator.of(context).pop(),
              ),
            ]),
      );
}
