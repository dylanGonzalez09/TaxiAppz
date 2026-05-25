import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:taxiappzpro/network/response_models/translation_model.dart';
import 'package:taxiappzpro/utils/custom_colors.dart';
import 'package:taxiappzpro/utils/dimensions.dart';
import 'package:taxiappzpro/utils/theme_data.dart';

class PickupLocationChangedAlert extends StatelessWidget {
  final TranslationModel translation;

  const PickupLocationChangedAlert({super.key, required this.translation});

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: Dialog(
        insetPadding:
            const EdgeInsets.symmetric(horizontal: Dimensions.padding_20),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(Dimensions.padding_20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(translation.txt_TaxiAppz_Driver,
                  style:
                      themeData.textTheme.bodyMedium?.copyWith(fontSize: 20)),
              const SizedBox(height: Dimensions.padding_10),
              Text(translation.txt_Pickup_Location_changed,
                  style: themeData.textTheme.bodySmall),
              const SizedBox(height: Dimensions.padding_20),
              InkWell(
                onTap: () {
                  GoRouter.of(context).pop();
                },
                child: Container(
                  decoration: BoxDecoration(
                      borderRadius:
                          BorderRadius.circular(Dimensions.padding_30),
                      color: CustomColors.primaryColor),
                  padding: const EdgeInsets.symmetric(
                      horizontal: Dimensions.padding_40,
                      vertical: Dimensions.padding_10),
                  child: Text(
                    translation.txt_Ok,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
