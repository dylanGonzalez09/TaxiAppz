import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import '../../../utils/app_constants.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';
import '../../network/response_models/translation_model.dart';
import '../../utils/dimensions.dart';

class CancelBs extends StatefulWidget {
  final TranslationModel translation;

  const CancelBs({super.key, required this.translation});

  @override
  _CancelBs createState() => _CancelBs();
}

class _CancelBs extends State<CancelBs> {
  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: SizedBox(
        width: double.infinity,
        child: Padding(
          padding: const EdgeInsets.symmetric(
              horizontal: Dimensions.padding_20,
              vertical: Dimensions.padding_20),
          child: Column(
              spacing: 20,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    GestureDetector(
                      onTap: () {
                        Navigator.of(context).pop();
                      },
                      child: SvgPicture.asset(
                        CustomImages.cancelRed,
                        width: 85,
                        height: 30,
                      ),
                    ),
                    const SizedBox(
                      width: 15,
                    ),
                    Text(
                      widget.translation.txt_trip_cancelled,
                      style: Theme.of(context)
                          .textTheme
                          .bodyMedium
                          ?.copyWith(fontSize: 24, fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
                //SizedBox(height: 400,),
                Text(
                  widget.translation.txt_cancelled_trip_desc,
                  style: Theme.of(context)
                      .textTheme
                      .bodyLarge
                      ?.copyWith(fontSize: 15, fontWeight: FontWeight.w400),
                  maxLines: 2,
                ),
                Center(
                  child: InkWell(
                    onTap: () {
                      // GoRouter.of(context).pop();
                      Navigator.of(context).pop();
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 70, vertical: 14),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(36),
                        color: CustomColors.clr_FE0000,
                      ),
                      child: Text(
                        widget.translation.txt_back_to_home,
                        style: const TextStyle(
                          fontSize: 20,
                          color: Colors.white,
                          fontFamily: AppConstants.latoFont,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                ),
              ]),
        ),
      ),
    );
  }
}
