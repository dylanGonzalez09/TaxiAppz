import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:taxiappzpro/network/response_models/translation_model.dart';
import 'package:taxiappzpro/ui/trip/trip_vm.dart';
import 'package:taxiappzpro/utils/app_constants.dart';
import 'package:taxiappzpro/utils/dimensions.dart';

import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';

class TripAddressChange extends StatefulWidget {
  final Map<String, dynamic> map;
  final TranslationModel translationModel;
  final TRIPADDRESSCHANGETYPE tripaddresschangetype;

  const TripAddressChange(
      {super.key,
      required this.map,
      required this.translationModel,
      required this.tripaddresschangetype});

  @override
  State createState() => TripAddressChangeState();
}

class TripAddressChangeState extends State<TripAddressChange> {
  bool isDrop = false;
  String address = "";
  final AudioPlayer audioPlayer = AudioPlayer();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((callback) async {
      await audioPlayer.play(
          AssetSource(widget.tripaddresschangetype ==
                  TRIPADDRESSCHANGETYPE.PICKUP_ADDRESS
              ? 'sounds/pickup_change.mp3'
              : 'sounds/drop_change.mp3'),
          volume: 1.0);
      audioPlayer.setReleaseMode(ReleaseMode.loop);

      setState(() {
        address = widget.map[AppConstants.address];
      });
    });
  }

  @override
  Widget build(BuildContext context) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(Dimensions.padding_20),
        ),
        backgroundColor: Colors.white,
        insetPadding:
            const EdgeInsets.symmetric(horizontal: Dimensions.padding_20),
        child: Container(
          padding: const EdgeInsets.symmetric(
              horizontal: Dimensions.padding_30,
              vertical: Dimensions.padding_20),
          width: double.infinity,
          child: Column(
              spacing: Dimensions.padding_15,
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  widget.translationModel.txtLocationChangeRequest,
                  style: Theme.of(context)
                      .textTheme
                      .bodyMedium
                      ?.copyWith(fontSize: 20),
                ),
                Text(
                  widget.tripaddresschangetype ==
                          TRIPADDRESSCHANGETYPE.PICKUP_ADDRESS
                      ? widget
                          .translationModel.txtPickupAddressChangeDescription
                      : widget.tripaddresschangetype ==
                              TRIPADDRESSCHANGETYPE.STOP_ADDRESS
                          ? widget
                              .translationModel.txtStopAddressChangeDescription
                          : widget
                              .translationModel.txtDropAddressChangeDescription,
                  style: Theme.of(context)
                      .textTheme
                      .bodySmall
                      ?.copyWith(fontSize: 16),
                ),
                Container(
                  margin: const EdgeInsets.symmetric(
                      vertical: Dimensions.padding_10),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Image.asset(
                        isDrop
                            ? CustomImages.dropIndicator
                            : CustomImages.pickUpIndicator,
                        height: 14,
                        width: 14,
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          address,
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(color: Colors.black, fontSize: 14),
                          overflow: TextOverflow.clip,
                        ),
                      ),
                    ],
                  ),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    Expanded(
                      child: InkWell(
                        onTap: () {
                          audioPlayer.stop();
                          GoRouter.of(context).pop(AppConstants.no);
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 22, vertical: 10),
                          decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(25),
                              border:
                                  Border.all(color: CustomColors.clr_303030)),
                          child: Center(
                            child: Text(
                              widget.translationModel.txtNo,
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: InkWell(
                        onTap: () async {
                          audioPlayer.stop();
                          GoRouter.of(context).pop(AppConstants.yes);
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            border:
                                Border.all(color: CustomColors.primaryColor),
                            color: CustomColors.primaryColor,
                            borderRadius: BorderRadius.circular(25),
                          ),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 22, vertical: 10),
                          child: Center(
                            child: Text(
                              widget.translationModel.txtYes,
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                )
              ]),
        ),
      );

  @override
  void dispose() {
    audioPlayer.stop();
    audioPlayer.dispose();
    super.dispose();
  }
}
