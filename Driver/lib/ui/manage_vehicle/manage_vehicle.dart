import 'package:taxiappzpro/utils/custom_images.dart';
import 'package:taxiappzpro/utils/custom_router_config.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../utils/app_constants.dart';
import '../../utils/utils.dart';
import 'manage_vehicle_vm.dart';

class ManageVehicle extends StatefulWidget {
  const ManageVehicle({super.key});

  @override
  State<ManageVehicle> createState() => _ManageVehicleState();
}

class _ManageVehicleState extends State<ManageVehicle> {
  late ManageVehicleVm vm;

  @override
  void initState() {
    super.initState();
    vm = ManageVehicleVm();

    vm.addListener(() {
      if (mounted) setState(() {});
    });

    vm.getVehicleList();

    Future.delayed(const Duration(milliseconds: 5000), () {
      Utils.showToast("Drag down to refresh the page");
    });
  }

  @override
  void dispose() {
    vm.removeListener(() {});
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        body: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 18.0, vertical: 12),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    GestureDetector(
                      onTap: () {
                        Navigator.pop(context, {"refresh": true});
                      },
                      child: const Icon(Icons.arrow_back_ios_rounded, size: 20),
                    ),
                    Text(
                      vm.translation.txt_managaevehicle,
                      style: const TextStyle(
                          fontSize: 20, fontWeight: FontWeight.w600),
                    ),
                    GestureDetector(
                      onTap: () {
                        vm.moveToNamed(
                          CustomRouterConfig.vehicleInformationScreen,
                          args: {"fromManageVehicle": true},
                        );
                      },
                      child: SvgPicture.asset(CustomImages.addvehicle, height: 26),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              Expanded(
                child: RefreshIndicator(
                  onRefresh: () async {
                    await vm.getVehicleList();
                  },
                  child: vm.isLoadingVehicles
                      ? const Center(child: CircularProgressIndicator())
                      : vm.vehicleList.isEmpty
                      ? ListView(
                    children: [
                      SizedBox(
                        height: MediaQuery.of(context).size.height * 0.6,
                        child: Center(
                          child: Text(
                            vm.translation.txt_novehicles_found,
                            style: const TextStyle(
                                fontSize: 16, color: Color(0xFF9B9B9B)),
                          ),
                        ),
                      ),
                    ],
                  )
                      : ListView.builder(
                    physics: const AlwaysScrollableScrollPhysics(),
                    itemCount: vm.vehicleList.length,
                    itemBuilder: (context, index) {
                      return Column(
                        children: [
                          _buildVehicleRow(vm.vehicleList[index]),
                          const SizedBox(height: 10),
                          const Divider(
                              height: 35, color: Color(0xFFEDEDED)),
                        ],
                      );
                    },
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildVehicleRow(vehicle) {
    final approved = vehicle.isApprove == true;
    final enabled = vehicle.status ?? false;
    final canShowSwitch =
        vehicle.vehicleId != null &&
            vehicle.vehicleModelId != null &&
            (vehicle.vehicleId?.vehicleName?.isNotEmpty ?? false);

    return InkWell(
      onTap: () {
        vm.moveToNamed(
          CustomRouterConfig.documentsScreen,
          args: {
            "vehicleId": vehicle.sId ?? "",
            "fromManageVehicle": true,
          },
        );
      },
      child: SizedBox(
        height: 95,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            _buildLeftSide(vehicle),
            const SizedBox(width: 12),
            Expanded(child: _buildMiddleSide(vehicle, canShowSwitch)),
            _buildRightSide(vehicle, approved, enabled, canShowSwitch),
          ],
        ),
      ),
    );
  }

  Widget _buildLeftSide(vehicle) {
    return SizedBox(
      width: 85,
      height: 70,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(
            decoration: BoxDecoration(boxShadow: [
              if (vehicle.vehicleColor?.toLowerCase() == "#ffffff" ||
                  vehicle.vehicleColor?.toLowerCase() == "white")
                BoxShadow(
                  color: Colors.black.withOpacity(0.15),
                  blurRadius: 20,
                  spreadRadius: 2,
                ),
            ]),
            child: SvgPicture.asset(
              CustomImages.colorchangecar,
              height: 32,
              colorFilter: vehicle.vehicleColor != null
                  ? ColorFilter.mode(
                _parseColor(vehicle.vehicleColor!),
                BlendMode.srcIn,
              )
                  : null,
            ),
          ),
          Positioned(
            left: 0,
            child: Container(
              height: 40,
              width: 40,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2),
                image: DecorationImage(
                  image: AppConstants.driverProfilePicture.isNotEmpty
                      ? NetworkImage(AppConstants.driverProfilePicture)
                      : AssetImage(CustomImages.driverprofile) as ImageProvider,
                  fit: BoxFit.cover,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMiddleSide(vehicle, bool canShowSwitch) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (canShowSwitch)
          Text(
            vehicle.vehicleId?.vehicleName ?? "",
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),

        Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFF4F4F4),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                vehicle.vehicleModelName ?? "N/A",
                style: const TextStyle(fontSize: 10),
              ),
            ),
            const SizedBox(width: 5),
            Row(
              children: [
                SvgPicture.asset(CustomImages.seat, height: 15, width: 15),
                Text(
                  " ${vehicle.passengerCapacity ?? 'N/A'}",
                  style: const TextStyle(fontSize: 12, color: Color(0xFF9B9B9B)),
                ),
              ],
            ),
          ],
        ),

        const SizedBox(height: 5),

        Text(
          "${vm.translation.txtNo}: ${vehicle.licensePlateNumber}",
          style: const TextStyle(fontSize: 13, color: Color(0xFF9B9B9B)),
        ),

        const SizedBox(height: 4),

        Text(
          "${vm.translation.txt_year}: ${vehicle.manufactureYear ?? 'N/A'}",
          style: const TextStyle(fontSize: 12, color: Color(0xFF9B9B9B)),
        ),
      ],
    );
  }

  Widget _buildRightSide(vehicle, bool approved, bool enabled, bool canShowSwitch) {
    return SizedBox(
      width: 80,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                approved ? vm.translation.txt_approved : vm.translation.txt_inprogress,
                style: TextStyle(
                  fontSize: 10,
                  color: approved ? Colors.green : const Color(0xFFFF8A00),
                ),
              ),
              const SizedBox(width: 2),
              SvgPicture.asset(
                approved ? CustomImages.approved : CustomImages.pending,
                height: 12,
                width: 12,
              ),
            ],
          ),

          Column(
            children: [
              if (approved && canShowSwitch)
                Transform.scale(
                  scale: 0.75,
                  child: GestureDetector(
                    onTap: () {}, // <- prevents row tap from triggering documents screen
                    child: Switch(
                      value: enabled,
                      activeColor: Colors.white,
                      activeTrackColor: Colors.green,
                      inactiveThumbColor: Colors.white,
                      inactiveTrackColor: Colors.red,
                      onChanged: (_) {
                        vm.handleVehicleSwitch(vehicle);
                      },
                    ),
                  ),
                ),

              const SizedBox(height: 6),

              if ((vehicle.status ?? false) == false)
                GestureDetector(
                  onTap: () {
                    vm.deleteVehicle(vehicle.sId ?? "");
                  },
                  child: const Icon(
                    Icons.delete_outline,
                    color: Colors.red,
                    size: 20,
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Color _parseColor(String hexColor) {
    try {
      return Color(int.parse(hexColor.replaceFirst('#', '0xFF')));
    } catch (e) {
      return Colors.grey;
    }
  }
}
