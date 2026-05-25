import 'package:flutter/material.dart';
import '../utils/dimensions.dart';
import '../ui/about/aboutUs_screen.dart';
import '../utils/app_constants.dart';
import '../utils/custom_colors.dart';

class CustomAlertDialog {
  static Future<void> showCustomDialog(BuildContext context, String msg,
      Function positiveBtn, Function negativeBtn, TextStyle tStyle) async {
    return showDialog(
        context: context,
        builder: (BuildContext c) {
          return Dialog(
            insetPadding: const EdgeInsets.only(
                left: Dimensions.padding_20, right: Dimensions.padding_20),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(Dimensions.padding_20),
            ),
            child: Container(
              padding: const EdgeInsets.all(Dimensions.padding_20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    msg,
                    style: tStyle,
                    maxLines: 3,
                  ),
                  const SizedBox(
                    height: Dimensions.padding_20,
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Expanded(
                        child: InkWell(
                          onTap: () {
                            Navigator.of(context).pop();
                            negativeBtn();
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 22, vertical: 11),
                            decoration: BoxDecoration(
                              color: CustomColors.primaryColor,
                              borderRadius: BorderRadius.circular(25),
                            ),
                            child: Center(
                              child: Text(
                                vm.translation.txt_no,
                                style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.white),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 20),
                      Expanded(
                        child: InkWell(
                          onTap: () async {
                            Navigator.of(context).pop();
                            positiveBtn();
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 22, vertical: 11),
                            decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(25),
                                border:
                                Border.all(color: CustomColors.clr_303030)),
                            child: Center(
                              child: Text(
                                vm.translation.txt_yes,
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  )
                ],
              ),
            ),
          );
        });
  }

  static Future<void> openCameraOrGalleryDialog(BuildContext contextWidget,
      Function openCamera, Function openGallery) async {
    return showDialog(
        context: contextWidget,
        builder: (BuildContext context) {
          return Dialog(
            insetPadding: const EdgeInsets.symmetric(horizontal: 20),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(Dimensions.padding_20),
            ),
            child: Container(
              width: double.infinity,
              margin: const EdgeInsets.all(Dimensions.padding_18),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    vm.translation.txt_choose_profile,
                    style: Theme.of(context)
                        .textTheme
                        .labelSmall!
                        .copyWith(fontSize: 16),
                  ),
                  Container(
                    alignment: Alignment.centerLeft,
                    width: double.infinity,
                    padding: const EdgeInsets.only(top: Dimensions.padding_10),
                    child: TextButton(
                      onPressed: () {
                        Navigator.of(context).pop();
                        openCamera();
                      },
                      child: Text(
                        vm.translation.txt_camera,
                        style: Theme.of(context)
                            .textTheme
                            .labelSmall!
                            .copyWith(fontSize: 15),
                      ),
                    ),
                  ),
                  Container(
                    alignment: Alignment.centerLeft,
                    width: double.infinity,
                    child: TextButton(
                      onPressed: () {
                        Navigator.of(context).pop();
                        openGallery();
                      },
                      child: Text(
                        vm.translation.txt_gallery,
                        style: Theme.of(context)
                            .textTheme
                            .labelSmall!
                            .copyWith(fontSize: 15),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        });
  }

  static Future<void> showErrorMessage(
      BuildContext context, Function action, String msg) async {
    return showDialog(
        context: context,
        builder: (c) {
          return Dialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(Dimensions.padding_20),
            ),
            child: Container(
              padding: const EdgeInsets.all(Dimensions.padding_20),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    maxLines: 5,
                    msg,
                    style: Theme.of(context).textTheme.labelMedium,
                  ),
                  const SizedBox(
                    height: Dimensions.padding_20,
                  ),
                  InkWell(
                    onTap: () {
                      Navigator.of(context).pop();
                    },
                    child: Container(
                      padding: const EdgeInsets.only(
                          left: 30,
                          right: 30,
                          top: 8,bottom: 8
                      ),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        color: CustomColors.primaryColor,
                      ),
                      child: Text(
                        vm.translation.txt_Ok,
                        style: const TextStyle(
                          fontSize: 15,
                          color: Colors.black,
                          fontFamily: AppConstants.latoFont,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),

                  // ProceedButton(
                  //   btnTxt: "ok",
                  //   onPressed: () {
                  //     Navigator.of(context).pop();
                  //     action();
                  //   },
                  //   showArrowIcon: false,
                  // )
                ],
              ),
            ),
          );
        });
  }

  static Future<void> showAlertOnlyDialog(
      BuildContext context, String msg) async {
    return showDialog(
        context: context,
        builder: (c) {
          return Dialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(Dimensions.padding_20),
            ),
            child: Container(
              padding: const EdgeInsets.all(Dimensions.padding_20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    vm.translation.txt_app_name,
                    style: Theme.of(context)
                        .textTheme
                        .labelSmall
                        ?.copyWith(fontSize: Dimensions.padding_18),
                  ),
                  const SizedBox(
                    height: Dimensions.padding_10,
                  ),
                  Padding(
                    padding:
                        const EdgeInsets.symmetric(horizontal: Dimensions.padding_10),
                    child: Text(
                      maxLines: 5,textAlign: TextAlign.center,
                      msg,
                      style: Theme.of(context)
                          .textTheme
                          .labelSmall
                          ?.copyWith(fontSize: Dimensions.padding_16),
                    ),
                  )
                ],
              ),
            ),
          );
        });
  }
}
