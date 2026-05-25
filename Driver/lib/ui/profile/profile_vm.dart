import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:taxiappzpro/main.dart';
import 'package:taxiappzpro/network/response_models/custom_name_model.dart';
import '../../base/base_vm.dart';
import '../../network/response_models/serviceType_model.dart';
import '../../network/response_models/user_model.dart';
import '../../network/response_models/zone_model.dart';
import '../../utils/app_constants.dart';
import '../../utils/app_urls.dart';
import 'package:dio/dio.dart';
import '../../utils/custom_router_config.dart';
import '../../utils/preference_helper.dart';

class ProfileVm extends BaseVm {
  final TextEditingController nameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController phoneNumberController = TextEditingController();
  final TextEditingController primaryZoneController = TextEditingController();
  final TextEditingController secondaryZoneController = TextEditingController();
  final TextEditingController serviceTypeController = TextEditingController();
  final TextEditingController joinedDateController = TextEditingController();

  File? profileImg;
  String? profileImageUrl;
  User? driverDetail;
  String serviceType = "";
  ServiceTypeModel? serviceTypeModel;
  List<String> serviceTypes = [], selectedSecondaryZone = [];

  bool isImageCaptured = false,
      kIsWeb = false,
      isChangesAvailable = false,
      isProfileAvailable = false,
      isSecondaryZoneIsNotEmpty = false,
      isSecondaryZoneChanged = false;
  bool isSaveButtonEnabled = false, isDisposed = false;
  List<CustomNameModel> secondaryZoneListUi = [];

  // ─── SINGLE SOURCE OF TRUTH: checkChanges (same pattern as reference) ────
  void checkChanges() {
    // Guard — profile not loaded yet, button stays disabled
    if (driverDetail == null) {
      isSaveButtonEnabled = false;
      notifyListeners();
      return;
    }

    final nameChanged =
        nameController.text.trim() != (driverDetail?.firstName ?? "").trim();
    final emailChanged =
        emailController.text.trim() != (driverDetail?.email ?? "").trim();
    final picChanged = profileImg != null;
    final serviceChanged = serviceTypeController.text.toUpperCase() !=
        (driverDetail?.serviceType?.map((s) => s.toUpperCase()).join(',') ?? "");
    final zoneChanged = isSecondaryZoneChanged;

    debugPrint('=== checkChanges ===');
    debugPrint('nameChanged: $nameChanged');
    debugPrint('emailChanged: $emailChanged');
    debugPrint('picChanged: $picChanged');
    debugPrint('serviceChanged: $serviceChanged');
    debugPrint('zoneChanged: $zoneChanged');

    isChangesAvailable =
        nameChanged || emailChanged || serviceChanged || zoneChanged;
    isProfileAvailable = picChanged;
    isSaveButtonEnabled =
        nameChanged || emailChanged || picChanged || serviceChanged || zoneChanged;

    debugPrint('isSaveButtonEnabled: $isSaveButtonEnabled');
    notifyListeners();
  }

  // ─── Keep changesAvailable() as simple wrapper (used in updateProfiles) ──
  bool changesAvailable() {
    if (driverDetail == null) return false;

    final nameChanged =
        nameController.text.trim() != (driverDetail?.firstName ?? "").trim();
    final emailChanged =
        emailController.text.trim() != (driverDetail?.email ?? "").trim();
    final serviceChanged = serviceTypeController.text.toUpperCase() !=
        (driverDetail?.serviceType?.map((s) => s.toUpperCase()).join(',') ?? "");

    final result = nameChanged || emailChanged || serviceChanged;
    isChangesAvailable = result;
    return result;
  }

  // ─── GET DRIVER PROFILE ───────────────────────────────────────────────────
  Future<void> getDriverProfile() async {
    showLoader();
    final response = await apiHelper.get(AppUrls.getDriverProfile);

    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      driverDetail = parseData(r.data, User.fromJson);
      if (driverDetail != null) {
        // Set controller texts
        nameController.text = driverDetail!.firstName ?? '';
        emailController.text = driverDetail!.email ?? '';
        phoneNumberController.text =
        '${driverDetail?.countryCode} ${driverDetail!.phoneNumber ?? ''}';
        joinedDateController.text =
        '${driverDetail?.regDate} ${driverDetail?.regTime}';

        serviceType =
            driverDetail!.serviceType?.map((s) => s.toUpperCase()).join(',') ??
                '';
        serviceTypeController.text = serviceType;
        primaryZoneController.text = driverDetail?.vehicle?.zoneName ?? '';

        AppConstants.driverServiceType = serviceType;
        AppConstants.driverFirstName = driverDetail!.firstName ?? '';
        AppConstants.driverPhoneNumber =
        '${driverDetail?.countryCode} ${driverDetail!.phoneNumber ?? ''}';

        profileImageUrl = driverDetail!.profilePic?.isNotEmpty == true
            ? '${AppConstants.imageBaseUrl}${driverDetail!.profilePic}'
            : AppConstants.driverProfilePicture;
        AppConstants.driverProfilePicture = profileImageUrl ?? '';

        preference.setString(
            PreferenceHelper.primaryZone, driverDetail?.zoneId ?? '');
        preference.setString(PreferenceHelper.serviceType, serviceType);

        if (driverDetail?.vehicle?.id?.isNotEmpty == true) {
          preference.setString(
              PreferenceHelper.vehicleId, driverDetail!.vehicle!.id!);
        }

        // ✅ Reset ALL flags — button disabled on initial load
        isChangesAvailable = false;
        isSecondaryZoneChanged = false;
        isProfileAvailable = false;
        isSaveButtonEnabled = false;
        profileImg = null;

        isSecondaryZoneIsNotEmpty =
            (driverDetail?.vehicle?.zoneName?.isNotEmpty == true ||
                driverDetail?.zoneId?.isNotEmpty == true) &&
                driverDetail?.secondaryZone?.isNotEmpty == true;

        debugPrint('=== getDriverProfile success ===');
        debugPrint('isSaveButtonEnabled reset → false');

        if (isSecondaryZoneIsNotEmpty) {
          if (secondaryZoneListUi.isEmpty) getServiceLocation();
          preference.setString(PreferenceHelper.secondaryZone,
              jsonEncode(driverDetail?.secondaryZone));
          FlutterForegroundTask.sendDataToTask({
            AppConstants.secondaryZone:
            jsonEncode(driverDetail?.secondaryZone)
          });
        } else {
          hideLoader();
          notifyListeners();
        }
      } else {
        showErrorDialog(message: AppConstants.someThingWentWrong);
      }
    });
  }

  // ─── FETCH SERVICE TYPES ──────────────────────────────────────────────────
  Future<void> fetchServiceTypes() async {
    showLoader();
    final response = await apiHelper.get(AppUrls.getServiceType);
    hideLoader();
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      serviceTypeModel = parseData(r.data, ServiceTypeModel.fromJson);
      if (serviceTypeModel != null) {
        serviceTypes = serviceTypeModel!.serviceType ?? [];
        debugPrint('fetchServiceTypes: $serviceTypes');
        notifyListeners();
      } else {
        showErrorDialog(message: AppConstants.someThingWentWrong);
      }
    });
  }

  // ─── UPDATE PROFILES (ENTRY POINT) ───────────────────────────────────────
  Future<void> updateProfiles() async {
    changesAvailable();
    final isServiceTypeChanged = serviceTypeController.text.toUpperCase() !=
        (driverDetail?.serviceType?.map((s) => s.toUpperCase()).join(',') ?? '');

    debugPrint('=== updateProfiles ===');
    debugPrint('profileImg: $profileImg | isProfileAvailable: $isProfileAvailable');
    debugPrint('isChangesAvailable: $isChangesAvailable');
    debugPrint('isSecondaryZoneChanged: $isSecondaryZoneChanged');
    debugPrint('isServiceTypeChanged: $isServiceTypeChanged');

    final anyChange = isProfileAvailable ||
        isChangesAvailable ||
        isSecondaryZoneChanged ||
        isServiceTypeChanged;

    if (!anyChange) {
      debugPrint('No changes — popping');
      // ✅ Use Navigator directly — avoids GoRouter triggering RouteObserver mid-frame
      WidgetsBinding.instance.addPostFrameCallback((_) {
        final nav = navigatorKey.currentState;
        if (nav != null && nav.mounted && nav.canPop()) {
          nav.pop();
        }
      });
      return;
    }

    if (profileImg != null && isProfileAvailable) {
      await updateProfile();
    } else {
      await updateProfileDetails();
    }
  }

  // ─── UPDATE PROFILE IMAGE ─────────────────────────────────────────────────
  Future<void> updateProfile() async {
    if (isLoading.value) return;
    showLoader();
    isLoading.value = true;
    try {
      final formData = FormData.fromMap({});
      if (profileImg != null) {
        formData.files.add(MapEntry(
          AppConstants.profileImage,
          await MultipartFile.fromFile(profileImg!.path),
        ));
      }

      debugPrint('=== updateProfile (image) ===');
      debugPrint('path: ${profileImg?.path}');

      final response =
      await apiHelper.post(AppUrls.updateProfileDriver, params: formData);
      response.fold(
            (error) {
          debugPrint('updateProfile error: $error');
          showErrorDialog(errorModel: error);
        },
            (result) {
          debugPrint('updateProfile success: ${result.data}');
          if (result.data != null) {
            isProfileAvailable = false;
            profileImg = null;
            isSaveButtonEnabled = false;
            // If text fields also changed, update those too
            if (isChangesAvailable || isSecondaryZoneChanged) {
              updateProfileDetails();
            } else {
              getDriverProfile();
            }
            notifyListeners();
          } else {
            showErrorDialog();
          }
        },
      );
    } catch (e) {
      debugPrint('updateProfile exception: $e');
      showErrorDialog();
    } finally {
      isLoading.value = false;
      hideLoader();
    }
  }

  // ─── UPDATE PROFILE DETAILS (name, email, serviceType, secondaryZone) ────
  Future<void> updateProfileDetails() async {
    if (isLoading.value) return;
    showLoader();
    isLoading.value = true;
    try {
      final serviceTypeList = serviceTypeController.text
          .split(',')
          .map((s) => s.trim().toUpperCase())
          .where((s) => s.isNotEmpty)
          .toList();

      final params = <String, dynamic>{
        AppConstants.name: nameController.text,
        AppConstants.email: emailController.text,
        AppConstants.serviceType: serviceTypeList,
        if (isSecondaryZoneChanged && selectedSecondaryZone.isNotEmpty)
          AppConstants.secondaryZone: selectedSecondaryZone,
      };

      debugPrint('=== updateProfileDetails params ===');
      debugPrint('name: ${params[AppConstants.name]}');
      debugPrint('email: ${params[AppConstants.email]}');
      debugPrint('serviceType: ${params[AppConstants.serviceType]}');
      debugPrint('secondaryZone: ${params[AppConstants.secondaryZone]}');

      final formData = FormData.fromMap(params);
      final response =
      await apiHelper.put(AppUrls.updateDriverProfile, params: formData);
      response.fold(
            (error) {
          debugPrint('updateProfileDetails error: $error');
          showErrorDialog(errorModel: error);
        },
            (result) {
          debugPrint('updateProfileDetails success: ${result.data}');
          if (result.data != null) {
            isChangesAvailable = false;
            isSecondaryZoneChanged = false;
            isSaveButtonEnabled = false;
            getDriverProfile();
            notifyListeners();
          } else {
            showErrorDialog();
          }
        },
      );
    } catch (e) {
      debugPrint('updateProfileDetails exception: $e');
      showErrorDialog();
    } finally {
      isLoading.value = false;
      hideLoader();
    }
  }

  // ─── PICK IMAGE FROM GALLERY ──────────────────────────────────────────────
  void pickImageFromGallery() async {
    try {
      final picker = ImagePicker();
      final XFile? image = await picker.pickImage(source: ImageSource.gallery);
      if (image != null) {
        profileImg = File(image.path);
        isProfileAvailable = true;
        checkChanges(); // ✅ triggers isSaveButtonEnabled = true
        notifyListeners();
        debugPrint('Gallery image: ${image.path}');
      }
    } catch (e) {
      debugPrint('Error picking image: $e');
    }
  }

  // ─── DELETE ACCOUNT ───────────────────────────────────────────────────────
  Future<void> deleteAccount() async {
    isLoading.value = true;
    showLoader();
    final map = {
      AppConstants.refreshToken:
      preference.getString(PreferenceHelper.refreshToken),
    };
    debugPrint('deleteAccount → refreshToken: ${map[AppConstants.refreshToken]}');

    final response = await apiHelper.post(AppUrls.deleteAccount, params: map);
    hideLoader();
    response.fold((e) => showErrorDialog(errorModel: e), (r) async {
      AppConstants.driverFirstName = '';
      AppConstants.driverPhoneNumber = '';
      AppConstants.driverServiceType = '';
      AppConstants.driverProfilePicture = '';

      await preference.remove(PreferenceHelper.primaryZone);
      await preference.remove(PreferenceHelper.secondaryZone);
      await preference.remove(PreferenceHelper.demoKey);
      await preference.remove(PreferenceHelper.authToken);
      await preference.remove(PreferenceHelper.refreshToken);
      await preference.remove(PreferenceHelper.vehicleId);
      await preference.remove(PreferenceHelper.vehicleType);

      final existingServiceType =
      preference.getString(PreferenceHelper.serviceType)?.toUpperCase();
      await preference.setString(
        PreferenceHelper.serviceType,
        existingServiceType == 'LOCAL'
            ? AppConstants.local.toUpperCase()
            : (existingServiceType ?? ''),
      );

      FlutterForegroundTask.sendDataToTask({AppConstants.secondaryZone: ''});
      if (await FlutterForegroundTask.isRunningService) {
        FlutterForegroundTask.stopService();
      }
      MyApp.of(navigatorKey.currentContext!)?.disposeOverlayOtherAppWindows();
      for (var topic in mqtt.subscribedTopics) {
        if (topic.isNotEmpty) mqtt.unSubscribe(topic);
      }
      mqtt.disconnect();
      Fluttertoast.showToast(msg: translation.txt_delete_success);
      popAndMove(CustomRouterConfig.loginScreen);
    });
    isLoading.value = false;
    notifyListeners();
  }

  // ─── GET SERVICE LOCATION (SECONDARY ZONES) ───────────────────────────────
  void getServiceLocation() async {
    final response = await apiHelper.get(AppUrls.zoneList);
    response.fold((e) => showErrorDialog(errorModel: e), (r) {
      if (r.data != null) {
        final jsonString = jsonDecode(json.encode(r.data));
        final zones = List<ZoneModel>.from(
            jsonString.map((model) => ZoneModel.fromJson(model)));

        secondaryZoneListUi.clear();
        secondaryZoneListUi.addAll(zones
            .where((w) =>
        w.zoneLevel == AppConstants.SECONDARY &&
            w.primaryZoneId == driverDetail?.zoneId)
            .map((m) => CustomNameModel(
            name: m.zoneName,
            id: m.sId,
            isSelected:
            driverDetail?.secondaryZone?.contains(m.sId) == true)));

        secondaryZoneController.text = zones
            .where((w) =>
        driverDetail?.secondaryZone?.contains(w.sId) == true &&
            w.zoneLevel == AppConstants.SECONDARY &&
            w.primaryZoneId == driverDetail?.zoneId)
            .map((m) => m.zoneName)
            .join(',');

        debugPrint(
            'getServiceLocation: ${secondaryZoneListUi.length} zones loaded');
      }
    });
    hideLoader();
    notifyListeners();
  }

  // ─── NOTIFY GUARD ─────────────────────────────────────────────────────────
  @override
  void notifyListeners() {
    if (!isDisposed) super.notifyListeners();
  }
}