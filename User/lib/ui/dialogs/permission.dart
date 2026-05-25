import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../network/response_models/translation_model.dart';


import '../../utils/app_constants.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../../utils/theme_data.dart';

class PermissionDialog extends StatelessWidget {
  final TranslationModel translationModel;
  final Function onTap;

  const PermissionDialog({super.key, required this.translationModel, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: Padding(
        padding: const EdgeInsets.only(left: 10, right: 10),
        child: Center(
          child: Material(
            color: Colors.transparent,
            child: Container(
              width: double.infinity,
              margin: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                color: Colors.white,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Stack(
                    clipBehavior: Clip.none,
                    children: [
                      Container(
                        decoration: const BoxDecoration(
                          borderRadius: BorderRadius.only(
                            topRight: Radius.circular(10),
                            topLeft: Radius.circular(10),
                          ),
                          color: CustomColors.svgImageColorDarkBlue,
                        ),
                        height: 100,
                        width: double.infinity,
                      ),
                      Padding(
                        padding: const EdgeInsets.only(top: 28),
                        child: Center(
                          child: SvgPicture.asset(
                            CustomImages.locationIcon,
                            colorFilter: const ColorFilter.mode(
                                Colors.white, BlendMode.srcIn),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Text(
                    translationModel.txt_welcome_to_taxi_aapz,
                    style: themeData.textTheme.bodySmall?.copyWith(
                      color: CustomColors.clr_000000,
                      fontSize: 20,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 10),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 35),
                    child: Text(
                      translationModel.txt_location_permission_description,
                      style: themeData.textTheme.bodySmall?.copyWith(
                        color: CustomColors.clr_000000,
                        fontSize: 14,
                      ),
                      //textAlign: TextAlign.center,
                      maxLines: 3,
                    ),
                  ),
                  const SizedBox(height: 15),
                  InkWell(
                    onTap: () {
                       onTap();
                      Navigator.of(context).pop();
                    },
                    child: Padding(
                      padding: const EdgeInsets.only(left: 160),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 42,
                          vertical: 10,
                        ),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(20),
                          color: CustomColors.primaryColor,
                        ),
                        child:  Text(
                          translationModel.Txt_Continue,
                          style: const TextStyle(
                            fontSize: 15,
                            color: Colors.white,
                            fontFamily: AppConstants.latoFont,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
