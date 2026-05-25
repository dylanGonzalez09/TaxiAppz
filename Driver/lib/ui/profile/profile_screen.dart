import 'dart:io';
import 'package:taxiappzpro/utils/preference_helper.dart';
import 'package:app_settings/app_settings.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:provider/provider.dart';
import 'package:taxiappzpro/components/drawer_scaffold.dart';
import 'package:taxiappzpro/ui/profile/profile_vm.dart';
import 'package:taxiappzpro/utils/app_constants.dart';

import '../../bottom_sheets/confirmation_bs/confirmation_bs.dart';
import '../../components/common_text_field.dart';
import '../../components/header_view.dart';
import '../../components/proceed_button.dart';
import '../../main.dart';
import '../../network/response_models/custom_name_model.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../../utils/custom_router_config.dart';
import '../../utils/dimensions.dart';
import '../dialogs/error_dialog.dart';
import '../dialogs/profile_service_dialog.dart';
import '../dialogs/select_dialog.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final vm = ProfileVm();
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  bool _isLoading = false;
  bool isCompany = false;

  @override
  void initState() {
    vm.isDisposed = false;
    super.initState();

    // ✅ Load profile after frame — so driverDetail guard works correctly
    WidgetsBinding.instance.addPostFrameCallback((_) {
      isCompany =
          vm.preference.getBool(PreferenceHelper.isCompanyDriver) ?? false;
      vm.getDriverProfile();
    });

    // ✅ Name & email listeners — only fire checkChanges after profile loaded
    vm.nameController.addListener(() {
      if (vm.driverDetail != null) {
        setState(() => vm.checkChanges());
      }
    });

    vm.emailController.addListener(() {
      if (vm.driverDetail != null) {
        setState(() => vm.checkChanges());
      }
    });
  }

  @override
  void dispose() {
    vm.isDisposed = true;
    super.dispose();
  }

  // ✅ Gallery image selected — set flags + checkChanges
  void onGalleryImageSelected(File file) {
    setState(() {
      vm.profileImg = file;
      vm.isProfileAvailable = true;
      vm.checkChanges();
    });
  }

  // ✅ Camera image selected — set flags + checkChanges
  void onImageSelected(File file) {
    setState(() {
      vm.profileImg = file;
      vm.isProfileAvailable = true;
      vm.checkChanges();
    });
  }

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context).size;
    return DrawerScaffold(
      scaffoldKey: scaffoldKey,
      body: ChangeNotifierProvider<ProfileVm>(
        create: (context) => vm,
        child: Consumer<ProfileVm>(
          builder: (_, vm, child) {
            return Column(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.only(
                      left: Dimensions.padding_20,
                      right: Dimensions.padding_20,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // ── Header ──────────────────────────────────────────
                        HeaderView(
                          title: vm.translation.txtProfileDetails,
                          onBackPressed: () => GoRouter.of(context).pop(),
                        ),
                        const SizedBox(height: 15),

                        // ── Profile Image ────────────────────────────────────
                        Align(
                          alignment: Alignment.center,
                          child: InkWell(
                            onTap: () async {
                              showModalBottomSheet(
                                context: context,
                                shape: const RoundedRectangleBorder(
                                  borderRadius: BorderRadius.only(
                                    topLeft: Radius.circular(
                                        Dimensions.padding_10),
                                    topRight: Radius.circular(
                                        Dimensions.padding_10),
                                  ),
                                ),
                                builder: (_) {
                                  return SafeArea(
                                    child: Wrap(
                                      children: [
                                        // Gallery option
                                        ListTile(
                                          leading: const Icon(
                                              Icons.photo_library),
                                          title: const Text(
                                              "Choose from Gallery"),
                                          onTap: () async {
                                            Navigator.pop(context);
                                            setState(
                                                    () => _isLoading = true);
                                            final picker = ImagePicker();
                                            final XFile? galleryImage =
                                            await picker.pickImage(
                                              source: ImageSource.gallery,
                                              requestFullMetadata: false,
                                            );
                                            if (galleryImage != null) {
                                              // ✅ calls checkChanges inside
                                              onGalleryImageSelected(
                                                  File(galleryImage.path));
                                            }
                                            setState(
                                                    () => _isLoading = false);
                                          },
                                        ),
                                        // Camera option
                                        ListTile(
                                          leading: const Icon(
                                              Icons.camera_alt),
                                          title:
                                          const Text("Take a Photo"),
                                          onTap: () async {
                                            Navigator.pop(context);
                                            setState(
                                                    () => _isLoading = true);
                                            final status =
                                            await Permission
                                                .camera.status;
                                            if (status.isGranted) {
                                              await openCamera();
                                            } else if (status
                                                .isPermanentlyDenied) {
                                              showMessageDialog(
                                                "Camera permission permanently denied. Please enable it in settings.",
                                                    () =>
                                                    AppSettings.openAppSettings(
                                                        type: AppSettingsType
                                                            .settings),
                                              );
                                            } else {
                                              final result =
                                              await Permission
                                                  .camera.request();
                                              if (result.isGranted) {
                                                await openCamera();
                                              }
                                            }
                                            setState(
                                                    () => _isLoading = false);
                                          },
                                        ),
                                      ],
                                    ),
                                  );
                                },
                              );
                            },
                            child: Stack(
                              clipBehavior: Clip.none,
                              children: [
                                Container(
                                  width: Dimensions.padding_80,
                                  height: Dimensions.padding_80,
                                  decoration: BoxDecoration(
                                    color: CustomColors.clr_E6ECFF,
                                    borderRadius: BorderRadius.circular(
                                        Dimensions.padding_10),
                                  ),
                                  child: vm.profileImg != null
                                      ? ClipRRect(
                                    borderRadius:
                                    BorderRadius.circular(
                                        Dimensions.padding_10),
                                    child: vm.kIsWeb
                                        ? Image.network(
                                        vm.profileImg!.path,
                                        fit: BoxFit.fill)
                                        : Image.file(vm.profileImg!,
                                        fit: BoxFit.fill),
                                  )
                                      : (vm.profileImageUrl?.isNotEmpty ==
                                      true
                                      ? ClipRRect(
                                    borderRadius:
                                    BorderRadius.circular(
                                        Dimensions.padding_10),
                                    child: CachedNetworkImage(
                                      imageUrl:
                                      vm.profileImageUrl!,
                                      fit: BoxFit.fill,
                                      placeholder: (context,
                                          url) =>
                                      const Center(
                                        child:
                                        CircularProgressIndicator(
                                          color: CustomColors
                                              .primaryColor,
                                          strokeWidth: 2,
                                        ),
                                      ),
                                      errorWidget: (context,
                                          url, error) =>
                                          Padding(
                                            padding:
                                            const EdgeInsets.all(
                                                Dimensions
                                                    .padding_10),
                                            child: SvgPicture.asset(
                                              CustomImages
                                                  .dummyProfileImage,
                                              fit: BoxFit.fill,
                                            ),
                                          ),
                                    ),
                                  )
                                      : Padding(
                                    padding: const EdgeInsets.all(
                                        Dimensions.padding_10),
                                    child: SvgPicture.asset(
                                      CustomImages
                                          .dummyProfileImage,
                                      fit: BoxFit.fill,
                                    ),
                                  )),
                                ),
                                Positioned(
                                  right: -8,
                                  bottom: -8,
                                  child: Container(
                                    height: mediaQuery.height * 0.03,
                                    width: mediaQuery.height * 0.03,
                                    decoration: const BoxDecoration(
                                      color: CustomColors
                                          .svgImageColorDarkBlue,
                                      shape: BoxShape.circle,
                                    ),
                                    child: Center(
                                      child: _isLoading
                                          ? const SizedBox(
                                        height: 20,
                                        width: 20,
                                        child:
                                        CircularProgressIndicator(
                                          color: CustomColors
                                              .primaryColor,
                                          strokeWidth: 2,
                                        ),
                                      )
                                          : const Icon(
                                        Icons.add_rounded,
                                        color: CustomColors
                                            .buttonTxtColor,
                                        size: 20,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),

                        // ── Name ─────────────────────────────────────────────
                        CommonTextField(
                          controller: vm.nameController,
                          hint: vm.translation.txt_Name,
                        ),
                        const SizedBox(height: 15),

                        // ── Email ────────────────────────────────────────────
                        CommonTextField(
                          controller: vm.emailController,
                          hint: vm.translation.txt_Email,
                          keyboardType: TextInputType.emailAddress,
                        ),
                        const SizedBox(height: 15),

                        // ── Phone ────────────────────────────────────────────
                        CommonTextField(
                          controller: vm.phoneNumberController,
                          hint: vm.translation.txt_Phone_Number,
                          keyboardType: TextInputType.phone,
                          readOnly: true,
                        ),
                        const SizedBox(height: 15),

                        // ── Primary Zone ─────────────────────────────────────
                        CommonTextField(
                          controller: vm.primaryZoneController,
                          hint: vm.translation.txtZoneName,
                          keyboardType: TextInputType.name,
                          readOnly: true,
                        ),

                        // ── Secondary Zone ───────────────────────────────────
                        Visibility(
                          visible: vm.isSecondaryZoneIsNotEmpty,
                          child: const SizedBox(height: 15),
                        ),
                        Visibility(
                          visible: vm.isSecondaryZoneIsNotEmpty,
                          child: CommonTextField(
                            controller: vm.secondaryZoneController,
                            hint: vm.translation.txt_Secondary_location,
                            keyboardType: TextInputType.name,
                            readOnly: true,
                            onTap: () async {
                              if (vm.driverDetail?.zoneId?.isNotEmpty ==
                                  true) {
                                final result = await showDialog(
                                  context: context,
                                  builder: (BuildContext context) {
                                    return SelectDialog(
                                      errorText: vm.translation
                                          .txt_Select_secondary_location,
                                      showErrorDialog: vm.showErrorDialog,
                                      btnText: vm.translation.txt_Ok,
                                      isMultipleSelect: true,
                                      title: vm.translation
                                          .txt_Select_secondary_location,
                                      customModel: vm.secondaryZoneListUi,
                                    );
                                  },
                                );
                                if (result != null &&
                                    result is List<CustomNameModel>) {
                                  vm.secondaryZoneController.text = result
                                      .where((i) => i.isSelected)
                                      .map((m) => m.name as String)
                                      .join(",");
                                  vm.selectedSecondaryZone.clear();
                                  vm.selectedSecondaryZone = result
                                      .where((w) => w.isSelected)
                                      .map((m) => m.id ?? "")
                                      .toList();
                                  vm.isSecondaryZoneChanged = true;
                                  vm.checkChanges(); // ✅ enable save button
                                }
                              }
                            },
                          ),
                        ),
                        const SizedBox(height: 15),

                        // ── Service Type ─────────────────────────────────────
                        CommonTextField(
                          controller: vm.serviceTypeController,
                          hint: vm.translation.txt_Service_type,
                          readOnly: true,
                          onTap: () async {
                            if (!vm.isLoading.value) {
                              await vm.fetchServiceTypes();
                              final preSelectedServiceTypes = vm.serviceTypeController.text.split(',');
                              final value = await showDialog(
                                context: context,
                                builder: (BuildContext context) {
                                  return ProfileServiceDialog(
                                    title: vm.translation
                                        .txt_Select_service_type,
                                    translation: vm.translation,
                                    serviceTypes: vm.serviceTypes,
                                    preSelectedServiceTypes: preSelectedServiceTypes,
                                  );
                                },
                              );
                              if (value is String) {
                                vm.serviceTypeController.text = value;
                                vm.checkChanges();
                              }
                            }
                          },
                        ),
                        const SizedBox(height: 15),

                        // ── Vehicle Info Label ───────────────────────────────
                        Text(
                          isCompany
                              ? vm.translation
                              .txt_Company_Vehicle_Information
                              : vm.translation.txt_Vehicle_Information,
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(
                            color: Colors.black,
                            fontSize: 15,
                          ),
                        ),
                        const SizedBox(height: 15),

                        // ── Vehicle Info Button ──────────────────────────────
                        InkWell(
                          onTap: () {
                            final vehicleData = {
                              'vehicleType': vm
                                  .driverDetail?.vehicle?.vehicleName,
                              'vehicleModel': vm
                                  .driverDetail?.vehicle?.vehicleModelName,
                              'vehicleBrand': vm
                                  .driverDetail?.vehicle?.vehicleBrandName,
                              'vehicleVariant': vm.driverDetail
                                  ?.vehicle?.vehicleVariantName,
                              'vehicleNumber': vm
                                  .driverDetail?.vehicle?.vehicleNumber,
                              'zoneName':
                              vm.driverDetail?.vehicle?.zoneName,
                              AppConstants.translation:
                              vm.translation.toJson()
                            };
                            vm
                                .moveAndWait(
                                CustomRouterConfig.profileVehicleScreen,
                                args: vehicleData)
                                .then((onValue) {
                              if (onValue != null) {
                                print("jfrpgjpg${onValue}");
                              }
                            });
                          },
                          child: Container(
                            decoration: BoxDecoration(
                              color: CustomColors.clr_D9D9D9,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            padding: const EdgeInsets.all(10),
                            child: Row(
                              mainAxisAlignment:
                              MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  vm.translation.txtInformation
                                      .toUpperCase(),
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodySmall
                                      ?.copyWith(
                                    color: Colors.black,
                                    fontSize: 15,
                                  ),
                                ),
                                const Icon(
                                  Icons.arrow_forward_ios_rounded,
                                  color: Colors.black,
                                  size: 20,
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 15),

                        // ── Joined Date ──────────────────────────────────────
                        CommonTextField(
                          controller: vm.joinedDateController,
                          hint: vm.translation.txt_joined_date,
                          showBottomLine: false,
                        ),
                        const SizedBox(height: 30),

                        // ── Delete Account ───────────────────────────────────
                        InkWell(
                          onTap: () async {
                            if (vm.isLoading.value == false) {
                              final response =
                              await showModalBottomSheet(
                                context:
                                navigatorKey.currentState!.context,
                                backgroundColor: Colors.white,
                                isDismissible: true,
                                isScrollControlled: true,
                                enableDrag: false,
                                shape: const RoundedRectangleBorder(
                                    borderRadius: BorderRadius.only(
                                        topLeft: Radius.circular(20),
                                        topRight: Radius.circular(20))),
                                builder: (_) {
                                  return ConfirmationBs(
                                    title:
                                    vm.translation.txt_delete_account,
                                    subTitle: vm.translation
                                        .txt_are_you_sure_to_delete,
                                    primaryBtnTitle:
                                    vm.translation.txt_delete,
                                    secondaryBtnTitle:
                                    vm.translation.txt_cancel,
                                  );
                                },
                              );
                              if (response == true) {
                                vm.deleteAccount();
                              }
                            }
                          },
                          child: Container(
                            width: MediaQuery.sizeOf(context).width * 0.50,
                            padding: const EdgeInsets.symmetric(
                                vertical: Dimensions.padding_12,
                                horizontal: Dimensions.padding_5),
                            decoration: BoxDecoration(
                              color: CustomColors.primaryColor,
                              borderRadius: BorderRadius.circular(26),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                SvgPicture.asset(
                                  CustomImages.deleteIcon,
                                  width: 15,
                                  height: 15,
                                  colorFilter: const ColorFilter.mode(
                                    Colors.white,
                                    BlendMode.srcIn,
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Text(
                                  vm.translation.txt_delete_account,
                                  style: Theme.of(context)
                                      .textTheme
                                      .labelSmall!
                                      .copyWith(
                                      color: Colors.white,
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // ── Save / Continue Button ─────────────────────────────────
                Padding(
                  padding: const EdgeInsets.symmetric(
                      horizontal: Dimensions.padding_20, vertical: 10),
                  child: ProceedButton(
                    isAvailable: vm.isSaveButtonEnabled,
                    btnTxt: vm.isSaveButtonEnabled
                        ? vm.translation.txt_save
                        : vm.translation.txt_continue,
                    onPressed: () {
                      vm.updateProfiles();
                    },
                  ),
                ),
                const SizedBox(height: 10),
              ],
            );
          },
        ),
      ),
    );
  }

  // ── Open Camera ────────────────────────────────────────────────────────────
  Future<void> openCamera() async {
    final picker = ImagePicker();
    final XFile? photo =
    await picker.pickImage(source: ImageSource.camera);
    if (photo != null) {
      onImageSelected(File(photo.path)); // ✅ calls checkChanges inside
    }
  }

  // ── Permission Denied Dialog ───────────────────────────────────────────────
  void showMessageDialog(String message, Function() onClick) {
    if (navigatorKey.currentState != null) {
      showDialog(
        context: navigatorKey.currentState!.context,
        barrierDismissible: true,
        builder: (_) => ErrorDialog(
          message: message,
          onClick: onClick,
          translation: vm.translation,
          buttonTxt: vm.translation.txt_Allow,
          canDismiss: true,
        ),
      );
    }
  }
}