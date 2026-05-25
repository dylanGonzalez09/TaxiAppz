import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:taxiappzpro/ui/register/vehicle_information_vm.dart';
import '../../components/custom_text_field.dart';
import '../../components/header_view.dart';
import '../../components/proceed_button.dart';
import '../../di/di_config.dart';
import '../../network/response_models/custom_name_model.dart';
import '../../utils/app_constants.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../../utils/dimensions.dart';
import '../dialogs/select_dialog.dart';

class VehicleInformationScreen extends StatefulWidget {
  final Map<String, dynamic> args;

  const VehicleInformationScreen({super.key, required this.args});

  @override
  State<VehicleInformationScreen> createState() =>
      _VehicleInformationScreenState();
}

class _VehicleInformationScreenState extends State<VehicleInformationScreen> {
  final vm = getIt<VehicleInformationVm>();
  final ScrollController _vehicleTypeScrollController = ScrollController();
  final ScrollController _vehicleBrandScrollController = ScrollController();
  final ScrollController _vehicleModelScrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    vm.setConfigModel();
    vm.setArgs(widget.args);
    _vehicleTypeScrollController.addListener(_onVehicleTypeScroll);
    _vehicleBrandScrollController.addListener(_onVehicleBrandScroll);
    _vehicleModelScrollController.addListener(_onVehicleModelScroll);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      vm.fetchInitialVehicleTypes();
    });
  }

  void _onVehicleTypeScroll() {
    if (_vehicleTypeScrollController.position.pixels ==
        _vehicleTypeScrollController.position.maxScrollExtent) {
      if (!vm.isFetchingVehicleType && vm.vehicleTypeHasMore) {
        vm.fetchVehicleTypes();
      }
    }
  }

  void _onVehicleBrandScroll() {
    if (_vehicleBrandScrollController.position.pixels ==
        _vehicleBrandScrollController.position.maxScrollExtent) {
      if (!vm.isFetchingVehicleBrand &&
          vm.vehicleBrandHasMore &&
          vm.selectedVehicleType != null) {
        vm.fetchVehicleBrands(vm.selectedVehicleType!.sId ?? "");
      }
    }
  }

  void _onVehicleModelScroll() {
    if (_vehicleModelScrollController.position.pixels ==
        _vehicleModelScrollController.position.maxScrollExtent) {
      if (!vm.isFetchingVehicleModel &&
          vm.vehicleModelHasMore &&
          vm.selectedVehicleBrand != null) {
        vm.fetchVehicleModels(vm.selectedVehicleBrand!.id ?? "");
      }
    }
  }

  @override
  void dispose() {
    _vehicleTypeScrollController.dispose();
    _vehicleModelScrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        body: PopScope(
          canPop: false,
          onPopInvokedWithResult: (canPop, data) {
            if (!vm.isLoading.value) vm.pop();
          },
          child: Padding(
            padding: const EdgeInsets.only(
              left: Dimensions.padding_20,
              right: Dimensions.padding_20,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                HeaderView(
                  title: vm.translation.txt_Vehicle_Information,
                  onBackPressed: () {
                    GoRouter.of(context).pop();
                    AppConstants.tempData = {};
                  },
                ),
                Expanded(
                  child: SingleChildScrollView(
                    child: ChangeNotifierProvider.value(
                      value: vm,
                      child: Consumer<VehicleInformationVm>(
                        builder: (_, vm, child) {
                          return Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (vm.isFetchingVehicleType &&
                                  vm.vehicleTypes.isEmpty)
                                const SizedBox(
                                  height: 105,
                                  child: Center(
                                    child: CircularProgressIndicator(
                                      color: CustomColors.primaryColor,
                                    ),
                                  ),
                                )
                              else if (vm.vehicleTypes.isNotEmpty) ...[
                                Text(
                                  vm.translation.txtVehicleType,
                                  style: Theme.of(context)
                                      .textTheme
                                      .titleMedium
                                      ?.copyWith(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w600,
                                      ),
                                ),
                                const SizedBox(height: 10),
                                SizedBox(
                                  height: 105,
                                  child: ListView.separated(
                                    controller: _vehicleTypeScrollController,
                                    scrollDirection: Axis.horizontal,
                                    itemCount: vm.vehicleTypes.length +
                                        (vm.isFetchingVehicleType ? 1 : 0),
                                    separatorBuilder: (_, __) =>
                                        const SizedBox(width: 15),
                                    itemBuilder: (context, index) {
                                      if (index >= vm.vehicleTypes.length) {
                                        return const Padding(
                                          padding: EdgeInsets.all(8),
                                          child: Center(
                                            child: CircularProgressIndicator(
                                              color: CustomColors.primaryColor,
                                              strokeWidth: 2,
                                            ),
                                          ),
                                        );
                                      }

                                      final vehicle = vm.vehicleTypes[index];
                                      final isSelected =
                                          vm.selectedVehicleType?.sId ==
                                              vehicle.sId;

                                      return GestureDetector(
                                        onTap: () {
                                          if (!vm.isLoading.value) {
                                            vm.onVehicleTypeSelected(vehicle);
                                          }
                                        },
                                        child: Container(
                                          width: 90,
                                          padding: const EdgeInsets.all(6),
                                          decoration: BoxDecoration(
                                            borderRadius:
                                                BorderRadius.circular(10),
                                            color: isSelected
                                                ? CustomColors.tabSelectedColor
                                                : Colors.white,
                                            border: Border.all(
                                              color: isSelected
                                                  ? CustomColors.primaryColor
                                                  : Colors.grey.shade300,
                                              width: 2,
                                            ),
                                          ),
                                          child: Column(
                                            mainAxisAlignment:
                                                MainAxisAlignment.center,
                                            children: [
                                              SizedBox(
                                                width: 70,
                                                height: 60,
                                                child: CachedNetworkImage(
                                                  imageUrl:
                                                      "${AppConstants.imageBaseUrl}${vehicle.image}",
                                                  fit: BoxFit.contain,
                                                  placeholder: (context, url) =>
                                                      const Center(
                                                    child:
                                                        CircularProgressIndicator(
                                                      color: CustomColors
                                                          .primaryColor,
                                                      strokeWidth: 2,
                                                    ),
                                                  ),
                                                  errorWidget:
                                                      (context, url, error) =>
                                                          SvgPicture.asset(
                                                    CustomImages
                                                        .vehicleTypePlaceHolder,
                                                  ),
                                                ),
                                              ),
                                              const SizedBox(height: 6),
                                              Text(
                                                vehicle.vehicleName ?? "",
                                                style: Theme.of(context)
                                                    .textTheme
                                                    .bodySmall
                                                    ?.copyWith(
                                                      fontSize: 11,
                                                      fontWeight: isSelected
                                                          ? FontWeight.w700
                                                          : FontWeight.normal,
                                                      color: isSelected
                                                          ? CustomColors
                                                              .primaryColor
                                                          : Colors.black87,
                                                    ),
                                                overflow: TextOverflow.ellipsis,
                                                maxLines: 1,
                                                textAlign: TextAlign.center,
                                              ),
                                            ],
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                                ),
                              ],
                              //Brand
                              if (vm.selectedVehicleType != null)
                                const SizedBox(height: Dimensions.padding_20),
                              if (vm.selectedVehicleType != null) ...[
                                Text(
                                  vm.translation.txt_Vehicle_Brand,
                                  style: Theme.of(context)
                                      .textTheme
                                      .titleMedium
                                      ?.copyWith(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w600,
                                      ),
                                ),
                                const SizedBox(height: 10),
                                if (vm.isFetchingVehicleBrand &&
                                    vm.vehicleBrand.isEmpty)
                                  const SizedBox(
                                    height: 105,
                                    child: Center(
                                      child: CircularProgressIndicator(
                                        color: CustomColors.primaryColor,
                                      ),
                                    ),
                                  )
                                else if (vm.vehicleBrand.isEmpty)
                                  SizedBox(
                                    height: 80,
                                    child: Center(
                                      child: Text(
                                        vm.translation.txt_no_data_found,
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodyMedium,
                                      ),
                                    ),
                                  )
                                else
                                  SizedBox(
                                    height: 105,
                                    child: ListView.separated(
                                      controller: _vehicleBrandScrollController,
                                      scrollDirection: Axis.horizontal,
                                      itemCount: vm.vehicleBrand.length +
                                          (vm.isFetchingVehicleBrand ? 1 : 0),
                                      separatorBuilder: (_, __) =>
                                          const SizedBox(width: 15),
                                      itemBuilder: (context, index) {
                                        if (index >= vm.vehicleBrand.length) {
                                          return const Padding(
                                            padding: EdgeInsets.all(8),
                                            child: Center(
                                              child: CircularProgressIndicator(
                                                color:
                                                    CustomColors.primaryColor,
                                                strokeWidth: 2,
                                              ),
                                            ),
                                          );
                                        }
                                        final brand = vm.vehicleBrand[index];
                                        final isSelected =
                                            vm.selectedVehicleBrand?.id ==
                                                brand.id;
                                        return GestureDetector(
                                          onTap: () {
                                            if (!vm.isLoading.value) {
                                              vm.onVehicleBrandSelected(brand);
                                            }
                                          },
                                          child: Container(
                                            width: 90,
                                            padding: const EdgeInsets.all(6),
                                            decoration: BoxDecoration(
                                              borderRadius:
                                                  BorderRadius.circular(10),
                                              color: isSelected
                                                  ? CustomColors
                                                      .tabSelectedColor
                                                  : Colors.white,
                                              border: Border.all(
                                                color: isSelected
                                                    ? CustomColors.primaryColor
                                                    : Colors.grey.shade300,
                                                width: 2,
                                              ),
                                            ),
                                            child: Column(
                                              mainAxisAlignment:
                                                  MainAxisAlignment.center,
                                              children: [
                                                SizedBox(
                                                  width: 70,
                                                  height: 60,
                                                  child: CachedNetworkImage(
                                                    imageUrl:
                                                        "${AppConstants.imageBaseUrl}${brand.image}",
                                                    fit: BoxFit.contain,
                                                    placeholder:
                                                        (context, url) =>
                                                            const Center(
                                                      child:
                                                          CircularProgressIndicator(
                                                        color: CustomColors
                                                            .primaryColor,
                                                        strokeWidth: 2,
                                                      ),
                                                    ),
                                                    errorWidget:
                                                        (context, url, error) =>
                                                            SvgPicture.asset(
                                                      CustomImages
                                                          .vehicleTypePlaceHolder,
                                                    ),
                                                  ),
                                                ),
                                                const SizedBox(height: 6),
                                                Text(
                                                  brand.brandName ?? "",
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .bodySmall
                                                      ?.copyWith(
                                                        fontSize: 11,
                                                        fontWeight: isSelected
                                                            ? FontWeight.w700
                                                            : FontWeight.normal,
                                                        color: isSelected
                                                            ? CustomColors
                                                                .primaryColor
                                                            : Colors.black87,
                                                      ),
                                                  overflow:
                                                      TextOverflow.ellipsis,
                                                  maxLines: 1,
                                                  textAlign: TextAlign.center,
                                                ),
                                              ],
                                            ),
                                          ),
                                        );
                                      },
                                    ),
                                  ),
                                if (vm.vehicleBrandError.isNotEmpty)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 6),
                                    child: Text(
                                      vm.vehicleBrandError,
                                      style: const TextStyle(
                                        color: Colors.red,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                              ],
                              //Model
                              if (vm.selectedVehicleBrand != null)
                                const SizedBox(height: Dimensions.padding_20),
                              if (vm.selectedVehicleBrand != null) ...[
                                Text(
                                  vm.translation.txt_Vehicle_model,
                                  style: Theme.of(context)
                                      .textTheme
                                      .titleMedium
                                      ?.copyWith(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w600,
                                      ),
                                ),
                                const SizedBox(height: 10),
                                if (vm.isFetchingVehicleModel &&
                                    vm.vehicleModel.isEmpty)
                                  const SizedBox(
                                    height: 105,
                                    child: Center(
                                      child: CircularProgressIndicator(
                                        color: CustomColors.primaryColor,
                                      ),
                                    ),
                                  )
                                else if (vm.vehicleModel.isEmpty)
                                  SizedBox(
                                    height: 80,
                                    child: Center(
                                      child: Text(
                                        vm.translation.txt_no_data_found,
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodyMedium,
                                      ),
                                    ),
                                  )
                                else
                                  SizedBox(
                                    height: 105,
                                    child: ListView.separated(
                                      controller: _vehicleModelScrollController,
                                      scrollDirection: Axis.horizontal,
                                      itemCount: vm.vehicleModel.length +
                                          (vm.isFetchingVehicleModel ? 1 : 0),
                                      separatorBuilder: (_, __) =>
                                          const SizedBox(width: 15),
                                      itemBuilder: (context, index) {
                                        if (index >= vm.vehicleModel.length) {
                                          return const Padding(
                                            padding: EdgeInsets.all(8),
                                            child: Center(
                                              child: CircularProgressIndicator(
                                                color:
                                                    CustomColors.primaryColor,
                                                strokeWidth: 2,
                                              ),
                                            ),
                                          );
                                        }
                                        final model = vm.vehicleModel[index];
                                        final isSelected =
                                            vm.selectedVehicleModel?.id ==
                                                model.id;

                                        return GestureDetector(
                                          onTap: () {
                                            if (!vm.isLoading.value) {
                                              vm.onVehicleModelSelected(model);
                                            }
                                          },
                                          child: Container(
                                            width: 90,
                                            padding: const EdgeInsets.all(6),
                                            decoration: BoxDecoration(
                                              borderRadius:
                                                  BorderRadius.circular(10),
                                              color: isSelected
                                                  ? CustomColors
                                                      .tabSelectedColor
                                                  : Colors.white,
                                              border: Border.all(
                                                color: isSelected
                                                    ? CustomColors.primaryColor
                                                    : Colors.grey.shade300,
                                                width: 2,
                                              ),
                                            ),
                                            child: Column(
                                              mainAxisAlignment:
                                                  MainAxisAlignment.center,
                                              children: [
                                                SizedBox(
                                                  width: 70,
                                                  height: 60,
                                                  child: CachedNetworkImage(
                                                    imageUrl:
                                                        "${AppConstants.imageBaseUrl}${model.image}",
                                                    fit: BoxFit.contain,
                                                    placeholder:
                                                        (context, url) =>
                                                            const Center(
                                                      child:
                                                          CircularProgressIndicator(
                                                        color: CustomColors
                                                            .primaryColor,
                                                        strokeWidth: 2,
                                                      ),
                                                    ),
                                                    errorWidget:
                                                        (context, url, error) =>
                                                            SvgPicture.asset(
                                                      CustomImages
                                                          .vehicleTypePlaceHolder,
                                                    ),
                                                  ),
                                                ),
                                                const SizedBox(height: 6),
                                                Text(
                                                  model.modelName ?? "",
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .bodySmall
                                                      ?.copyWith(
                                                        fontSize: 11,
                                                        fontWeight: isSelected
                                                            ? FontWeight.w700
                                                            : FontWeight.normal,
                                                        color: isSelected
                                                            ? CustomColors
                                                                .primaryColor
                                                            : Colors.black87,
                                                      ),
                                                  overflow:
                                                      TextOverflow.ellipsis,
                                                  maxLines: 1,
                                                  textAlign: TextAlign.center,
                                                ),
                                              ],
                                            ),
                                          ),
                                        );
                                      },
                                    ),
                                  ),
                                if (vm.vehicleModelError.isNotEmpty)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 6),
                                    child: Text(
                                      vm.vehicleModelError,
                                      style: const TextStyle(
                                        color: Colors.red,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                              ],

                              const SizedBox(height: Dimensions.padding_15),
                              if (vm.selectedVehicleModel != null) ...[
                                const SizedBox(height: Dimensions.padding_15),
                                Text(
                                  vm.translation.txt_Vehicle_Variant,
                                  style: Theme.of(context)
                                      .textTheme
                                      .titleMedium
                                      ?.copyWith(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w600,
                                      ),
                                ),
                                const SizedBox(height: 10),
                                CustomTextField(
                                  controller: vm.vehicleVariantController,
                                  hint: vm.translation.txt_Vehicle_Variant,
                                  errorTxt: vm.vehicleVariantError,
                                  readOnly: true,
                                  suffixIcon:
                                      Icon(Icons.arrow_drop_down_outlined),
                                  onTap: () async {
                                    if (vm.vehicleVariantUi.isNotEmpty) {
                                      vm.preMark(vm.vehicleVariantUi,
                                          vm.selectedVehicleVariant);

                                      final result = await showDialog(
                                        context: context,
                                        builder: (BuildContext context) {
                                          return SelectDialog(
                                            title: vm.translation
                                                .txt_Vehicle_Variant,
                                            customModel: vm.vehicleVariantUi,
                                          );
                                        },
                                      );
                                      if (result != null &&
                                          result is CustomNameModel) {
                                        vm.vehicleVariantController.text =
                                            result.name ?? "";
                                        vm.selectedVehicleVariant = result;
                                        vm.vehicleVariantError = "";
                                        setState(() {});
                                      }
                                    }
                                  },
                                ),
                              ],

                              const SizedBox(height: Dimensions.padding_15),
                              Obx(() => CustomTextField(
                                    controller: vm.vehicleNumberController,
                                    hint: vm.translation.txt_Vehicle_number,
                                    errorTxt: vm.vehicleNumberError,
                                    readOnly: vm.isLoading.value,
                                    inputFormatters: [
                                      FilteringTextInputFormatter.allow(
                                          RegExp(r'[a-zA-Z0-9]')),
                                      TextInputFormatter.withFunction(
                                          (oldValue, newValue) {
                                        return newValue.copyWith(
                                            text: newValue.text.toUpperCase());
                                      }),
                                    ],
                                  )),
                              const SizedBox(height: Dimensions.padding_15),
                              CustomTextField(
                                controller: vm.serviceTypeController,
                                hint: vm.translation.txt_Service_type,
                                errorTxt: vm.serviceTypeError,
                                suffixIcon:
                                    Icon(Icons.arrow_drop_down_outlined),
                                readOnly: true,
                                onTap: () async {
                                  final serviceList = vm.getServiceTypeList();
                                  final result = await showDialog(
                                    context: context,
                                    builder: (BuildContext context) {
                                      return SelectDialog(
                                        title: vm.translation.txt_Service_type,
                                        isMultipleSelect: true,
                                        btnText: vm.translation.txt_Ok,
                                        errorText: vm.translation
                                            .txt_Service_type_required,
                                        showErrorDialog: vm.showErrorDialog,
                                        customModel: serviceList,
                                      );
                                    },
                                  );
                                  if (result != null) {
                                    vm.handleServiceTypeSelection(result);
                                    setState(() {});
                                  }
                                },
                              ),
                              const SizedBox(height: Dimensions.padding_20),
                            ],
                          );
                        },
                      ),
                    ),
                  ),
                ),
                Obx(() => Center(
                      child: ProceedButton(
                        isLoading: vm.isLoading.value,
                        btnTxt: vm.translation.txt_Submit,
                        onPressed: vm.validate,
                      ),
                    )),
                const SizedBox(height: Dimensions.padding_20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
