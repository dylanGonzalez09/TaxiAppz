import 'dart:convert';
import 'package:flutter/material.dart';
import '../../base/base_vm.dart';
import '../../main.dart';
import '../../models/enums.dart';
import '../../network/response_models/config_model.dart';
import '../../network/response_models/country_model.dart';
import '../../network/response_models/custom_name_model.dart';
import '../../network/response_models/vehicle_brand.dart';
import '../../network/response_models/vehicle_model.dart';
import '../../network/response_models/vehicle_type_model.dart';
import '../../network/response_models/vehicle_variant_model.dart';
import '../../network/response_models/verify_model.dart';
import '../../utils/app_constants.dart';
import '../../utils/app_urls.dart';
import '../../utils/custom_router_config.dart';
import '../../utils/preference_helper.dart';

class VehicleInformationVm extends BaseVm {
  final TextEditingController vehicleNumberController = TextEditingController();
  final TextEditingController vehicleVariantController = TextEditingController();
  final TextEditingController serviceTypeController = TextEditingController();
  final TextEditingController workHoursController = TextEditingController();
  String vehicleBrandError = "";
  String vehicleModelError = "";
  String vehicleNumberError = "";
  String serviceTypeError = "";
  String vehicleVariantError = "";
  String serviceType = "";
  final List<VehicleResult> vehicleTypes = [];
  VehicleResult? selectedVehicleType;
  int _vehicleTypePage = 1;
  final int _vehicleTypeLimit = 10;
  bool vehicleTypeHasMore = true;
  bool isFetchingVehicleType = false;
  final List<VehicleModel> vehicleModel = [];
  VehicleModel? selectedVehicleModel;
  int _vehicleModelPage = 1;
  final int _vehicleModelLimit = 10;
  bool vehicleModelHasMore = true;
  bool isFetchingVehicleModel = false;
  final List<VehicleBrand> vehicleBrand = [];
  VehicleBrand? selectedVehicleBrand;
  int _vehicleBrandPage = 1;
  final int _vehicleBrandLimit = 10;
  bool vehicleBrandHasMore = true;
  bool isFetchingVehicleBrand = false;
  List<VehicleVariant> vehicleVariant = [];
  List<CustomNameModel> vehicleVariantUi = [];
  CustomNameModel? selectedVehicleVariant;
  bool vehicleVariantHasMore = true;
  bool isFetchingVehicleVariant = false;
  final List<String> selectedCategoryIds = [];
  bool isLoadingWorkType = false;
  Map<String, dynamic> args = {};
  CountryModel? country;
  CustomNameModel? primaryZone;
  List<CustomNameModel>? secondaryZone;
  CustomNameModel? company;
  bool isSecondaryZone = false;
  RegistrationType registrationType = RegistrationType.individual;
  String? gender;


  Future<void> fetchInitialVehicleTypes() async {
    _vehicleTypePage = 1;
    vehicleTypeHasMore = true;
    vehicleTypes.clear();
    notifyListeners();
    await fetchVehicleTypes();
  }

  void preMark(List<CustomNameModel> list, CustomNameModel? selected) {
    for (var item in list) {
      item.isSelected = item.id == selected?.id;
    }
  }

  void preMarkMulti(
      List<CustomNameModel> list, List<CustomNameModel>? selected) {
    final selectedIds = selected?.map((e) => e.id).toSet() ?? {};
    for (var item in list) {
      item.isSelected = selectedIds.contains(item.id);
    }
  }


  Future<void> fetchVehicleTypes() async {
    if (isFetchingVehicleType || !vehicleTypeHasMore) return;

    isFetchingVehicleType = true;
    if (_vehicleTypePage == 1) showLoader();
    notifyListeners();

    final baseUrl = primaryZone != null &&
        primaryZone?.id?.isNotEmpty == true
        ? "${AppUrls.getVehicleTypeZoneList}${primaryZone?.id}?page=$_vehicleTypePage&limit=$_vehicleTypeLimit"
        : "${AppUrls.getVehicleTypeList}?page=$_vehicleTypePage&limit=$_vehicleTypeLimit";

    final response = await apiHelper.get(baseUrl);

    if (_vehicleTypePage == 1) hideLoader();
    isFetchingVehicleType = false;

    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      if (r.data != null) {
        try {
          final vehicleTypeModel = VehicleTypeModel.fromJson(r.data);

          if (vehicleTypeModel.vehicles?.results != null) {
            vehicleTypes.addAll(vehicleTypeModel.vehicles!.results!);
            final totalPages = vehicleTypeModel.vehicles?.totalPages ?? 1;
            vehicleTypeHasMore = _vehicleTypePage < totalPages;
            _vehicleTypePage++;
          } else {
            vehicleTypeHasMore = false;
          }

          debugPrint(
              "VehicleTypes loaded: ${vehicleTypes.length} | hasMore: $vehicleTypeHasMore");
        } catch (e) {
          debugPrint("Error parsing vehicle types: $e");
          showErrorDialog(
              message: "Error loading vehicle types: ${e.toString()}");
        }
      }
    });

    notifyListeners();
  }


  Future<void> fetchInitialVehicleModels(String vehicleTypeId) async {
    _vehicleModelPage = 1;
    vehicleModelHasMore = true;
    vehicleModel.clear();
    notifyListeners();
    await fetchVehicleModels(vehicleTypeId);
  }

  Future<void> fetchVehicleModels(String vehicleTypeId) async {
    if (isFetchingVehicleModel || !vehicleModelHasMore) return;

    isFetchingVehicleModel = true;
    notifyListeners();

    final response = await apiHelper.get(
        "${AppUrls.getVehicleModels}$vehicleTypeId?page=$_vehicleModelPage&limit=$_vehicleModelLimit");

    isFetchingVehicleModel = false;

    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      if (r.data != null) {
        try {
          final vehicleModelResponse = VehicleModelResponse.fromJson(r.data);
          if (vehicleModelResponse.results != null) {
            vehicleModel.addAll(vehicleModelResponse.results!);
            final totalPages = vehicleModelResponse.totalPages ?? 1;
            vehicleModelHasMore = _vehicleModelPage < totalPages;
            _vehicleModelPage++;
          } else {
            vehicleModelHasMore = false;
          }
          debugPrint(
              "VehicleModels loaded: ${vehicleModel.length} | hasMore: $vehicleModelHasMore");
        } catch (e) {
          debugPrint("Error parsing vehicle models: $e");
          showErrorDialog(
              message: "Error loading vehicle models: ${e.toString()}");
        }
      }
    });

    notifyListeners();
  }

  Future<void> fetchInitialVehicleBrands(String vehicleTypeId) async {
    _vehicleBrandPage = 1;
    vehicleBrandHasMore = true;
    vehicleBrand.clear();
    notifyListeners();
    await fetchVehicleBrands(vehicleTypeId);
  }

  Future<void> fetchVehicleBrands(String vehicleTypeId) async {
    if (isFetchingVehicleBrand || !vehicleBrandHasMore) return;

    isFetchingVehicleBrand = true;
    notifyListeners();

    final response = await apiHelper.get(
        "${AppUrls.getVehicleBrands}$vehicleTypeId?page=$_vehicleBrandPage&limit=$_vehicleBrandLimit");

    isFetchingVehicleBrand = false;

    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      if (r.data != null) {
        try {
          final vehicleBrandResponse = VehicleBrandResponse.fromJson(r.data);
          if (vehicleBrandResponse.results != null) {
            vehicleBrand.addAll(vehicleBrandResponse.results!);
            final totalPages = vehicleBrandResponse.totalPages ?? 1;
            vehicleBrandHasMore = _vehicleBrandPage < totalPages;
            _vehicleBrandPage++;
          } else {
            vehicleBrandHasMore = false;
          }
          debugPrint(
              "VehicleBrands loaded: ${vehicleBrand.length} | hasMore: $vehicleBrandHasMore");
        } catch (e) {
          debugPrint("Error parsing vehicle Brands: $e");
          showErrorDialog(
              message: "Error loading vehicle Brands: ${e.toString()}");
        }
      }
    });

    notifyListeners();
  }



  Future<void> fetchInitialVehicleVariants(String modelId) async {
    vehicleVariantHasMore = true;
    vehicleVariant.clear();
    notifyListeners();
    await getVehicleVariants(modelId);
  }

  void onVehicleTypeSelected(VehicleResult vehicle) {
    selectedVehicleType = vehicle;
    selectedVehicleBrand = null;
    selectedVehicleModel = null;
    selectedVehicleVariant = null;
    vehicleBrandError = "";
    vehicleModelError = "";
    vehicleVariantError = "";
    vehicleBrand.clear();
    vehicleModel.clear();
    vehicleVariant.clear();
    notifyListeners();
    fetchInitialVehicleBrands(vehicle.sId ?? "");
  }

  void onVehicleBrandSelected(VehicleBrand model) {
    selectedVehicleBrand = model;
    selectedVehicleModel = null;
    selectedVehicleVariant = null;
    vehicleModelError = "";
    vehicleVariantError = "";
    vehicleModel.clear();
    vehicleVariant.clear();
    notifyListeners();
    fetchInitialVehicleModels(model.id ?? "");
  }

  void onVehicleModelSelected(VehicleModel model) {
    selectedVehicleModel = model;
    selectedVehicleVariant = null;
    vehicleModelError = "";
    vehicleVariantError = "";
    vehicleVariant.clear();
    notifyListeners();
    fetchInitialVehicleVariants(model.id ?? "");
  }

  Future<void> getVehicleVariants(String? modelID) async {
    showLoader();

    final response =
    await apiHelper.get('${AppUrls.getVehicleVariant}$modelID');

    hideLoader();

    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      if (r.data != null) {

        final vehicleResponse = VehicleVariantResponse.fromJson(r.data);

        vehicleVariantUi.clear();

        if (vehicleResponse.results != null) {
          for (var variant in vehicleResponse.results!) {

            final model = CustomNameModel(
              name: variant.variantName ?? "",
              id: variant.sId ?? "",
            );

            vehicleVariantUi.add(model);
          }
        }

        vehicleVariantUi.sort((a, b) {
          final p1 = int.tryParse(a.name ?? '') ?? 0;
          final p2 = int.tryParse(b.name ?? '') ?? 0;
          return p1.compareTo(p2);
        });

        notifyListeners();
      }
    });
  }


  List<CustomNameModel> getServiceTypeList() {
    if (serviceType.isEmpty) return [];
    final types = serviceType
        .split(',')
        .map((e) => e.trim())
        .where((e) => e.isNotEmpty)
        .toList();
    final currentSelected = serviceTypeController.text
        .split(',')
        .map((e) => e.trim())
        .where((e) => e.isNotEmpty)
        .toList();
    return types.map((type) {
      return CustomNameModel(
        name: type,
        id: type,
        isSelected: currentSelected.contains(type),
      );
    }).toList();
  }

  void handleServiceTypeSelection(dynamic result) {
    if (result is List<CustomNameModel>) {
      final selected = result
          .map((e) => e.name ?? "")
          .where((e) => e.isNotEmpty)
          .toList();
      serviceTypeController.text = selected.join(', ');
      serviceTypeError = "";
      notifyListeners();
    }
  }


  void validate() {
    if (!isLoading.value) {
      if (selectedVehicleType == null) {
        showErrorDialog(message: translation.txt_Vehicle_type_required);
        notifyListeners();
      } else if (selectedVehicleBrand == null) {
        showErrorDialog(message: translation.txt_Vehicle_brand_required);
      }else if (selectedVehicleModel == null) {
        showErrorDialog(message: translation.txt_Vehicle_model_required);
      } else if (selectedVehicleVariant == null) {
        vehicleVariantError = translation.txt_Please_select_vehicle_variant;
        notifyListeners();
      } else if (vehicleNumberController.text.isEmpty) {
        vehicleModelError = "";
        vehicleVariantError = "";
        vehicleNumberError = translation.txt_Vehicle_number_required;
        notifyListeners();
      } /*else if (isValidVehNumber(vehicleNumberController.text)) {
        vehicleModelError = "";
        vehicleVariantError = "";
        vehicleNumberError = translation.txt_invalid_vehicle_number;
        notifyListeners();
      }*/ else if (serviceTypeController.text.isEmpty) {
        vehicleModelError = "";
        vehicleBrandError = "";
        vehicleVariantError = "";
        vehicleNumberError = "";
        serviceTypeError = translation.txt_Service_type_required;
        notifyListeners();
      } else {
        vehicleBrandError = "";
        vehicleModelError = "";
        vehicleVariantError = "";
        vehicleNumberError = "";
        serviceTypeError = "";
        notifyListeners();
        args[AppConstants.vehicleType] = selectedVehicleType?.sId;
        args[AppConstants.vehicleModel] = selectedVehicleModel?.id;
        args[AppConstants.vehicleBrand] = selectedVehicleBrand?.id;
        if (selectedVehicleVariant != null) {
          args[AppConstants.vehicleVariant] = selectedVehicleVariant?.id;
        }
        args[AppConstants.carNumber] = vehicleNumberController.text;
        args[AppConstants.serviceType] = serviceTypeController.text;
        createDriver();
      }
    }
  }


  void setArgs(Map<String, dynamic> map) {
    args = map;
    country = args[AppConstants.country];
    primaryZone = args[AppConstants.serviceLocation];
    isSecondaryZone = args[AppConstants.isSecondaryZone];
    if (isSecondaryZone) {
      secondaryZone = args[AppConstants.secondaryLocation];
    }
    registrationType = args[AppConstants.registrationType];
    if (registrationType == RegistrationType.company) {
      company = args[AppConstants.company];
    }
  }

  void setConfigModel() {
    final data = preference.getString(PreferenceHelper.config);
    if (data != null && data.isNotEmpty == true) {
      final config = ConfigModel.fromJson(jsonDecode(data));
      if (config.settings != null) {
        settingsLoop:
        for (var i in config.settings!) {
          if (i.name == SettingsEnum.general.name) {
            serviceType = i.settings?.serviceType ?? "";
            break settingsLoop;
          }
        }
      }
    }
  }


  void createDriver() async {
    isLoading.value = true;
    debugPrint("Creating driver — categories: $selectedCategoryIds");

    final map = {
      AppConstants.name: args[AppConstants.name],
      if (args.containsKey(AppConstants.email))
        AppConstants.email: args[AppConstants.email],
      if (args.containsKey(AppConstants.referralCode))
        AppConstants.referralCode: args[AppConstants.referralCode],
      AppConstants.countryCode: country?.id,
      AppConstants.phoneNumber: args[AppConstants.phoneNumber],
      AppConstants.deviceInfoHash: await getFcmToken(),
      AppConstants.deviceType: getDevicePlatform(),
      AppConstants.vehicleType: selectedVehicleType?.sId,
      AppConstants.vehicleBrand: selectedVehicleBrand?.id,
      AppConstants.vehicleModel: selectedVehicleModel?.id,
      if (selectedVehicleVariant != null)
        AppConstants.vehicleVariant: selectedVehicleVariant?.id,
      AppConstants.serviceLocation: primaryZone?.id,
      if (isSecondaryZone)
        AppConstants.secondaryZone: secondaryZone
            ?.where((i) => i.isSelected)
            .map((m) => m.id)
            .toList(),
      AppConstants.serviceType: serviceTypeController.text,
      AppConstants.carNumber: vehicleNumberController.text,
      AppConstants.registrationType: registrationType.name.toUpperCase(),
      if (registrationType == RegistrationType.company)
        AppConstants.companyId: company?.id,
    };

    if (args.containsKey(AppConstants.demoKey)) {
      map[AppConstants.demoKey] = args[AppConstants.demoKey];
    }

    final response = await apiHelper.post(AppUrls.driverCreate, params: map);
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) async {
      final data = parseData(r.data, VerifyModel.fromJson);
      if (data != null) {
        preference.setString(
            PreferenceHelper.primaryZone, primaryZone?.id ?? "");
        if (isSecondaryZone) {
          preference.setString(
              PreferenceHelper.secondaryZone,
              jsonEncode(secondaryZone
                  ?.where((i) => i.isSelected)
                  .map((m) => m.id)
                  .toList()));
        }
        preference.setString(
            PreferenceHelper.authToken, data.tokens?.access?.token ?? "");
        preference.setString(
            PreferenceHelper.refreshToken,
            data.tokens?.refresh?.token ?? "");
        preference.setString(
            PreferenceHelper.driverId, data.driver?.sId ?? "");
        preference.setString(PreferenceHelper.vehicleType,
            data.driver?.vehicle?.vehicleName ?? "");
        await MyApp.of(navigatorKey.currentState!.context)?.connectToMqtt();
        await MyApp.of(navigatorKey.currentState!.context)
            ?.subscribeTODriverDetails();
        popAndMove(CustomRouterConfig.permissionScreen,
            args: CustomRouterConfig.mapScreen);
      } else {
        showErrorDialog(message: AppConstants.someThingWentWrong);
      }
    });
    isLoading.value = false;
  }

  @override
  void notifyListeners() {
    if (navigatorKey.currentState?.mounted == true) {
      super.notifyListeners();
    }
  }
}
