import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:go_router/go_router.dart';
import 'package:taxiappzpro/network/response_models/translation_model.dart';
import 'package:taxiappzpro/utils/custom_colors.dart';
import 'package:taxiappzpro/utils/custom_images.dart';
import 'package:taxiappzpro/utils/dimensions.dart';

class LocationPermissionDescDialog extends StatelessWidget {
  final TranslationModel translationModel;
  final Function() onAllowClicked;
  const LocationPermissionDescDialog(
      {super.key,
      required this.translationModel,
      required this.onAllowClicked});

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: Center(
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: Dimensions.padding_30),
          decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(Dimensions.padding_10),
              color: Colors.white),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(Dimensions.padding_10),
            child: Material(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    color: CustomColors.primaryColor,
                    padding: const EdgeInsets.symmetric(
                        vertical: Dimensions.padding_26),
                    child: Center(
                      child: SvgPicture.asset(CustomImages.locationPermission,colorFilter: ColorFilter.mode(Colors.white, BlendMode.srcIn),),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(Dimensions.padding_20),
                    child: Text(
                      translationModel.txt_welcome_to_taxi_aapz,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context)
                          .textTheme
                          .bodySmall
                          ?.copyWith(fontSize: Dimensions.padding_20),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsetsDirectional.fromSTEB(
                        Dimensions.padding_30,
                        0,
                        Dimensions.padding_30,
                        Dimensions.padding_30),
                    child: Text(
                      translationModel.txt_location_permission_description,
                      style: Theme.of(context)
                          .textTheme
                          .bodySmall
                          ?.copyWith(fontSize: Dimensions.padding_14),
                    ),
                  ),
                  Align(
                    alignment: Alignment.topRight,
                    child: InkWell(
                      onTap: () {
                        onAllowClicked();
                        GoRouter.of(context).pop();
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: Dimensions.padding_40,
                            vertical: Dimensions.padding_10),
                        margin: const EdgeInsets.fromLTRB(Dimensions.padding_20,
                            0, Dimensions.padding_20, Dimensions.padding_20),
                        decoration: BoxDecoration(
                            color: CustomColors.primaryColor,
                            borderRadius:
                                BorderRadius.circular(Dimensions.padding_27)),
                        child: Text(
                          translationModel.txt_continue,
                          style: Theme.of(context)
                              .textTheme
                              .bodyLarge
                              ?.copyWith(fontSize: 15,color: Colors.white),
                        ),
                      ),
                    ),
                  )
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
