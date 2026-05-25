import 'package:taxiappzpro/utils/custom_colors.dart';
import 'package:flutter/material.dart';
import 'package:taxiappzpro/ui/profile/profile_vehicle/profile_vehicle_vm.dart';
import 'package:go_router/go_router.dart';

import '../../../components/common_text_field.dart';
import '../../../components/drawer_scaffold.dart';
import '../../../components/header_view.dart';
import '../../../utils/dimensions.dart';

class ProfileVehicleScreen extends StatefulWidget {
  final Map<String, dynamic> args;

  const ProfileVehicleScreen({super.key, required this.args});

  @override
  State<ProfileVehicleScreen> createState() => _ProfileVehicleScreenState();
}

class _ProfileVehicleScreenState extends State<ProfileVehicleScreen> {
  final vm = ProfileVehicleVm();
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    vm.setData(widget.args);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: DrawerScaffold(
        body: Padding(
          padding: const EdgeInsets.only(
            left: Dimensions.padding_20,
            right: Dimensions.padding_20,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              HeaderView(
                title: vm.translation.txtVehicleDetails,
              ),
              CommonTextField(
                controller: vm.vehicleTypeController,
                hint: vm.translation.txtVehicleType,
                readOnly: true,
              ),
              const SizedBox(height: 15),
              CommonTextField(
                controller: vm.vehicleBrandController,
                hint: vm.translation.txt_Vehicle_Brand,
                readOnly: true,
              ),
              const SizedBox(height: 15),
              CommonTextField(
                controller: vm.vehicleModelController,
                hint: vm.translation.txt_Vehicle_model,
                readOnly: true,
              ),
              const SizedBox(height: 15),
              CommonTextField(
                controller: vm.vehicleVariantController,
                hint: vm.translation.txt_Vehicle_Variant,
                readOnly: true,
              ),
              const SizedBox(height: 15),
              CommonTextField(
                controller: vm.vehicleNumberController,
                hint: vm.translation.txt_Vehicle_number,
                readOnly: true,
              ),
            ],
          ),
        ),
        scaffoldKey: scaffoldKey,
      ),
    );
  }
}
