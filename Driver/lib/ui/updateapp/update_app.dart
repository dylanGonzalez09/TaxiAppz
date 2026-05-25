import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/svg.dart';
import 'package:provider/provider.dart';
import 'package:taxiappzpro/components/drawer_scaffold.dart';
import 'package:taxiappzpro/network/response_models/translation_model.dart';
import 'package:taxiappzpro/ui/updateapp/update_app_vm.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../di/di_config.dart';
import '../../network/response_models/custom_error_model.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../../utils/utils.dart';

class UpdateApp extends StatefulWidget {
  final TranslationModel? translation;
  const UpdateApp({super.key, required this.translation});

  @override
  State<UpdateApp> createState() => _UpdateAppState();
}

class _UpdateAppState extends State<UpdateApp> {
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  final vm = getIt<UpdateAppVm>();

  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    vm.isDisposed = true;
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    bool isExit = false;
    return PopScope(
        onPopInvokedWithResult: (didPop, result) {
          if (!didPop) {
            if (isExit == true) {
              SystemNavigator.pop();
            } else {
              Utils.showToast(widget.translation?.txt_press_again_to_exit ??
                  "press again to exit");
              isExit = true;
            }
            // Future.delayed(const Duration(seconds: 5), () {
            //   isExit = false;
            // });
            debugPrint('PopScope Pop was blocked or not allowed.');
          }
        },
        canPop: false,
        child: DrawerScaffold(
          scaffoldKey: scaffoldKey,
          body: Stack(
            children: [
              Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      SvgPicture.asset(CustomImages.update),
                      const SizedBox(height: 24),
                      Text(
                        "${widget.translation?.txt_time_to_update}",
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Colors.black,
                              fontWeight: FontWeight.w600,
                              fontSize: 20,
                            ),
                      ),
                      const SizedBox(height: 12),
                      Padding(
                        padding: const EdgeInsets.only(left: 14.0, right: 14),
                        child: Text(
                          "${widget.translation?.txt_time_to_update_desc}",
                          textAlign: TextAlign.center,
                          style:
                              Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: Colors.black,
                                    fontSize: 16,
                                    fontWeight: FontWeight.w400,
                                    overflow: TextOverflow.clip,
                                  ),
                          maxLines: 4,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              Positioned(
                bottom: 15,
                left: 24,
                right: 24,
                child: InkWell(
                  onTap: () {
                    if (Platform.isAndroid || Platform.isIOS) {
                      final appId = Platform.isAndroid
                          ? 'com.vyd.driver'
                          : 'YOUR_IOS_APP_ID';
                      final url = Uri.parse(
                        Platform.isAndroid
                            ? "market://details?id=$appId"
                            : "https://apps.apple.com/in/app/$appId",
                      );
                      launchUrl(
                        url,
                        mode: LaunchMode.externalApplication,
                      );
                    }
                  },
                  child: SizedBox(
                    width: double.infinity,
                    child: Padding(
                      padding: const EdgeInsets.only(left: 35.0, right: 35),
                      child: Container(
                        decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(50),
                            color: CustomColors.primaryColor),
                        child: Padding(
                          padding: const EdgeInsets.all(14.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                "${widget.translation?.txt_update}",
                                style: Theme.of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(
                                      color: CustomColors.buttonTxtColor,
                                      fontSize: 18,
                                      fontWeight: FontWeight.w700,
                                    ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              )
            ],
          ),
        ));
  }
}
