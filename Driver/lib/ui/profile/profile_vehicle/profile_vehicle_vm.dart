
import 'package:flutter/cupertino.dart';
import 'package:taxiappzpro/network/response_models/vehicle_type_model.dart';
import 'package:flutter/material.dart';

import '../../../base/base_vm.dart';

class ProfileVehicleVm extends BaseVm{
  final TextEditingController vehicleTypeController = TextEditingController();
  final TextEditingController vehicleModelController = TextEditingController();
  final TextEditingController vehicleBrandController = TextEditingController();
  final TextEditingController vehicleVariantController = TextEditingController();
  final TextEditingController vehicleNumberController = TextEditingController();
  final TextEditingController zoneNameController = TextEditingController();

  void setData(Map<String, dynamic> vehicleData) {
    if (vehicleData.isNotEmpty) {
      vehicleTypeController.text = vehicleData['vehicleType'] ?? '';
      vehicleBrandController.text = vehicleData['vehicleBrand'] ?? '';
      vehicleModelController.text = vehicleData['vehicleModel'] ?? '';
      vehicleVariantController.text = vehicleData['vehicleVariant'] ?? '';
      vehicleNumberController.text = vehicleData['vehicleNumber'] ?? '';
      zoneNameController.text = vehicleData['zoneName'] ?? '';
    }
  }

}
