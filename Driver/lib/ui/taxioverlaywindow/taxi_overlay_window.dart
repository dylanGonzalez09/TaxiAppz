import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:flutter_svg/svg.dart';
import 'package:overlay_windows_plugin/overlay_window_view.dart';
import 'package:taxiappzpro/main.dart';
import 'package:taxiappzpro/utils/app_constants.dart';
import 'package:taxiappzpro/utils/custom_colors.dart';

import '../../utils/custom_images.dart';
import '../../utils/dimensions.dart';

class TaxiOverlayWindow extends StatefulWidget {
  const TaxiOverlayWindow({super.key});

  @override
  State createState() => TaxiOverlayWindowState();
}

class TaxiOverlayWindowState extends State<TaxiOverlayWindow> {
  bool isChanged = true;
  final view = OverlayWindowView();

  @override
  void initState() {
    super.initState();

    view.stateChangedStream.listen((event) {
      //  debugPrint("overlayHelper   event  ${event.toJson()}");
    });

    view.messageStream.listen((mes) {
      //   debugPrint("overlayHelper   mes  ${mes.toJson()}");
    });
  }

  @override
  Widget build(BuildContext context) => SafeArea(
        child: GestureDetector(
          onTap: () async {
            if (await FlutterForegroundTask.isRunningService &&
                !await FlutterForegroundTask.isAppOnForeground) {
              FlutterForegroundTask.launchApp();
            }
            // setState(() {
            //   isChanged = !isChanged;
            // });
          },
          child: Container(
            alignment: Alignment.center,
            decoration: const BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
            ),
            padding: const EdgeInsets.all(Dimensions.padding_5),
            // child: Image.asset(
            //   CustomImages.logo,
            //   width: Dimensions.padding_50,
            //   height: Dimensions.padding_50,
            // )
            child: SvgPicture.asset(
              placeholderBuilder: (c) => SizedBox(
                width: Dimensions.padding_30,
                height: Dimensions.padding_30,
                child: CircularProgressIndicator(
                  color: CustomColors.primaryColor,
                  strokeWidth: 2,
                ),
              ),
              fit: BoxFit.fill,
              isChanged ? CustomImages.taxiLogo : CustomImages.taxiLogo,
              width: Dimensions.padding_40,
              height: Dimensions.padding_40,
            ),
          ),
        ),
      );
}
