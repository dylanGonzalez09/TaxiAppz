import 'dart:io';

import 'package:app_settings/app_settings.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:provider/provider.dart';
import 'package:taxiappzpro/components/document_txt_field.dart';
import 'package:taxiappzpro/components/drawer_scaffold.dart';
import 'package:taxiappzpro/components/header_view.dart';
import 'package:taxiappzpro/components/submit_button.dart';
import 'package:taxiappzpro/components/text_with_icon.dart';
import 'package:taxiappzpro/di/di_config.dart';
import 'package:taxiappzpro/network/response_models/document_image_view.dart';
import 'package:taxiappzpro/ui/documents/upload_document/document_upload_vm.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';
import '../../../utils/dimensions.dart';

class UploadDocumentScreen extends StatefulWidget {
  final Map<String, dynamic> args;

  const UploadDocumentScreen({super.key, required this.args});

  @override
  State<UploadDocumentScreen> createState() => _UploadDocumentScreenState();
}

class _UploadDocumentScreenState extends State<UploadDocumentScreen> {
  final vm = getIt<DocumentUploadVm>();
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  String? storedDocumentImageUrl;

  @override
  void initState() {
    vm.setData(widget.args);
    vm.currentVehicleId = widget.args["vehicleId"];
    addListeners();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    print('sdbdfhsbvhdfv ${vm.document}');
    return DrawerScaffold(
        body: Padding(
          padding: const EdgeInsets.only(
            left: Dimensions.padding_20,
            right: Dimensions.padding_20,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              HeaderView(title: vm.document.name ?? ""),
              Expanded(
                  child: ChangeNotifierProvider<DocumentUploadVm>(
                create: (context) => vm,
                child: Consumer<DocumentUploadVm>(builder: (_, vm, child) {
                  return SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (vm.showIdentifier)
                          const SizedBox(height: Dimensions.padding_20),
                        if (vm.showIdentifier)
                          DocumentTxtField(
                            controller: vm.documentIdController,
                            errorTxt: vm.identifierError,
                            onChanged: (data) {
                              if (vm.document.getDocument?.isNotEmpty ??
                                  false) {
                                vm.document.getDocument?.forEach((document) {
                                  storedDocumentImageUrl = document
                                      .documentImage; // Store the image URL
                                  document.documentImage =
                                      null; // Clear the image
                                });
                              }
                              vm.issueDateController.clear();
                              vm.expireDateController.clear();
                            },
                            hint:
                                '${vm.document.name ?? ""} ${vm.translation.txt_number}',
                          ),
                        if (vm.showIssueDate)
                          SizedBox(
                              height: vm.isIssueDateHintEnabled
                                  ? Dimensions.padding_10
                                  : Dimensions.padding_25),
                        if (vm.showIssueDate)
                          DocumentTxtField(
                            controller: vm.issueDateController,
                            hint: vm.translation.txt_Issue_Date,
                            errorTxt: vm.issueDateError,
                            readOnly: true,
                            onChanged: (data) {
                              vm.document.getDocument?.forEach((docs) {
                                setState(() {
                                  docs.documentImage = null;
                                });
                              });
                            },
                            keyboardType: TextInputType.phone,
                            suffixIcon: const Icon(
                              Icons.calendar_month,
                              color: CustomColors.clr_303030,
                              size: 20,
                            ),
                            onTap: () {
                              vm.document.getDocument?.forEach((docs) {
                                setState(() {
                                  docs.documentImage = null;
                                });
                              });
                              vm.expireDateController.clear();
                              vm.selectDate(true);
                            },
                          ),
                        if (vm.showExpiryDate)
                          SizedBox(
                              height: vm.isExpiryDateHintEnabled
                                  ? Dimensions.padding_10
                                  : Dimensions.padding_25),
                        if (vm.showExpiryDate)
                          DocumentTxtField(
                            controller: vm.expireDateController,
                            hint: vm.translation.txt_Expiry_Date,
                            errorTxt: vm.expiryDateError,
                            readOnly: true,
                            onChanged: (data) {
                              vm.document.getDocument?.forEach((docs) {
                                setState(() {
                                  docs.documentImage = null;
                                });
                              });
                            },
                            keyboardType: TextInputType.phone,
                            suffixIcon: const Icon(
                              Icons.calendar_month,
                              color: CustomColors.clr_303030,
                              size: 20,
                            ),
                            onTap: () {
                              vm.document.getDocument?.forEach((docs) {
                                setState(() {
                                  docs.documentImage = null;
                                });
                              });
                              vm.selectDate(false);
                            },
                          ),
                        const SizedBox(height: Dimensions.padding_20),
                        if (vm.document.getDocument != null &&
                            vm.document.getDocument?.isNotEmpty == true &&
                            vm.showImage)
                          ListView.builder(
                              physics: const NeverScrollableScrollPhysics(),
                              shrinkWrap: true,
                              itemCount: vm.document.getDocument?.length ?? 0,
                              itemBuilder: (context, index) {
                                final getDocs = vm.document.getDocument![index];
                                return Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    TextWithIcon(
                                        text: getDocs.documentName ?? "",
                                        isRequired: getDocs.isRequired == true),
                                    const SizedBox(
                                        height: Dimensions.padding_20),
                                    DocumentImageView(
                                      document: getDocs,
                                    ),
                                    const SizedBox(
                                        height: Dimensions.padding_20),
                                    Padding(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: Dimensions.padding_16),
                                      child: Row(
                                        children: [
                                          Expanded(
                                            child: InkWell(
                                              onTap: () {
                                                vm.pickImageFromGallery(index);
                                              },
                                              child: Container(
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                        vertical: Dimensions
                                                            .padding_10),
                                                decoration: BoxDecoration(
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            Dimensions
                                                                .padding_27),
                                                    border: Border.all(
                                                        color: CustomColors
                                                            .clr_303030)),
                                                child: Center(
                                                  child: Row(
                                                    mainAxisSize:
                                                        MainAxisSize.min,
                                                    children: [
                                                      SvgPicture.asset(
                                                          CustomImages
                                                              .icGallery),
                                                      const SizedBox(
                                                          width: Dimensions
                                                              .padding_8),
                                                      Flexible(
                                                        child: Text(
                                                          vm.translation
                                                              .txt_Gallery,
                                                          style: Theme.of(
                                                                  context)
                                                              .textTheme
                                                              .titleLarge
                                                              ?.copyWith(
                                                                  fontSize: 15,
                                                                  color: CustomColors
                                                                      .clr_303030),
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ),
                                            ),
                                          ),
                                          const SizedBox(
                                              width: Dimensions.padding_20),
                                          Expanded(
                                            child: InkWell(
                                              onTap: () {
                                                onCameraClick(index);
                                              },
                                              child: Container(
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                        vertical: Dimensions
                                                            .padding_12,
                                                        horizontal: Dimensions
                                                            .padding_10),
                                                decoration: BoxDecoration(
                                                  color:
                                                      CustomColors.primaryColor,
                                                  borderRadius:
                                                      BorderRadius.circular(
                                                          Dimensions
                                                              .padding_27),
                                                ),
                                                child: Center(
                                                  child: Row(
                                                    mainAxisSize:
                                                        MainAxisSize.min,
                                                    children: [
                                                      SvgPicture.asset(
                                                        CustomImages.icCamera,
                                                        colorFilter:
                                                            const ColorFilter
                                                                .mode(
                                                                CustomColors
                                                                    .buttonTxtColor,
                                                                BlendMode
                                                                    .srcIn),
                                                      ),
                                                      const SizedBox(
                                                          width: Dimensions
                                                              .padding_8),
                                                      Flexible(
                                                        child: Text(
                                                          vm.translation
                                                              .txt_Take_Photo,
                                                          style: Theme.of(
                                                                  context)
                                                              .textTheme
                                                              .titleLarge
                                                              ?.copyWith(
                                                                  fontSize: 15,
                                                                  color: CustomColors
                                                                      .buttonTxtColor),
                                                          maxLines: 1,
                                                          overflow: TextOverflow
                                                              .ellipsis,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ),
                                            ),
                                          )
                                        ],
                                      ),
                                    ),
                                    if (index !=
                                        vm.document.getDocument!.length - 1)
                                      const SizedBox(
                                          height: Dimensions.padding_20)
                                  ],
                                );
                              }),
                      ],
                    ),
                  );
                }),
              )),
              Padding(
                  padding: const EdgeInsets.symmetric(
                      horizontal: Dimensions.padding_20,
                      vertical: Dimensions.padding_20),
                  child: SubmitButton(
                    buttonText: vm.translation.txt_Submit,
                    onclick: vm.validate,
                  )),
            ],
          ),
        ),
        scaffoldKey: scaffoldKey);
  }

  void addListeners() {
    vm.issueDateController.addListener(() {
      if (vm.issueDateController.text.isNotEmpty) {
        if (mounted) {
          setState(() {
            vm.isIssueDateHintEnabled = true;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            vm.isIssueDateHintEnabled = false;
          });
        }
      }
    });

    vm.expireDateController.addListener(() {
      if (vm.expireDateController.text.isNotEmpty) {
        if (mounted) {
          setState(() {
            vm.isExpiryDateHintEnabled = true;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            vm.isExpiryDateHintEnabled = false;
          });
        }
      }
    });
  }

  void onCameraClick(int index) async {
    final permissionStatus = await Permission.camera.isGranted;
    if (!permissionStatus) {
      if (await Permission.camera.isPermanentlyDenied) {
        vm.showErrorDialog(
            message: vm.translation.txt_camera_permanently_denied_desc,
            onClick: () {
              GoRouter.of(context).pop();
              AppSettings.openAppSettings(type: AppSettingsType.settings);
            });
      } else {
        final response = await Permission.camera.request();
        if (response == PermissionStatus.granted) {
          onCameraClick(index);
        } else if (response == PermissionStatus.permanentlyDenied) {
          vm.showErrorDialog(
              message: vm.translation.txt_camera_permanently_denied_desc,
              onClick: () {
                GoRouter.of(context).pop();
                AppSettings.openAppSettings(type: AppSettingsType.settings);
              });
        } else {
          vm.showErrorDialog(
              message: vm.translation.txt_camera_permission_denied_desc,
              onClick: () async {
                GoRouter.of(context).pop();
                await Permission.photos.request();
                onCameraClick(index);
              });
        }
      }
    } else {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(source: ImageSource.camera);
      if (image != null) {
        setState(() {
          vm.document.getDocument![index].documentImage = null;
          vm.document.getDocument![index].imageFile = File(image.path);
        });
      }
    }
  }
}
