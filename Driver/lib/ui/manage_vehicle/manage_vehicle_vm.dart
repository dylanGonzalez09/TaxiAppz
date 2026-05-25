import 'package:taxiappzpro/base/base_vm.dart';
import 'package:taxiappzpro/utils/app_constants.dart';
import '../../main.dart';
import '../../network/response_models/manage_vehilce_listmodel.dart';
import '../../utils/app_urls.dart';
import 'package:flutter/material.dart';

class ManageVehicleVm extends BaseVm {
  List<ManageVehicleListModel> vehicleList = [];
  bool isLoadingVehicles = false;

  // ---------------------------------------------------------------------------
  // 🔥 RESTRICTION LOGIC FOR ONLINE VEHICLE
  // ---------------------------------------------------------------------------

  void handleVehicleSwitch(ManageVehicleListModel vehicle) {
    // 1️⃣ If THIS vehicle is online → block user
    if (vehicle.isOnline == true) {
      showErrorDialog(
        message:
        "${translation.txt_vehicle_online_descone}\n${translation.txt_vehicle_online_desctwo}",
      );
      return;
    }

    // 2️⃣ If ANY other vehicle is online → block user
    bool anotherOnline = vehicleList.any(
          (v) => v.sId != vehicle.sId && v.isOnline == true,
    );

    if (anotherOnline) {
      showErrorDialog(
        message:
        "Another vehicle is currently online.\nYou must go offline before switching vehicles.",
      );
      return;
    }

    // 3️⃣ All conditions clear → allow toggle
    toggleVehicleStatus(vehicle.sId ?? "", vehicle.status ?? false);
  }

  // ---------------------------------------------------------------------------
  // 🚮 DELETE VEHICLE
  // ---------------------------------------------------------------------------

  Future<void> _confirmDeleteVehicle(String vehicleId) async {
    showLoader();

    try {
      final response =
      await apiHelper.post("${AppUrls.vehicledelete}/$vehicleId");

      response.fold(
            (error) {
          showErrorDialog(errorModel: error);
        },
            (result) async {
          await getVehicleList(); // refresh list
        },
      );
    } catch (e) {
      showErrorDialog(message: AppConstants.someThingWentWrong);
    } finally {
      hideLoader();
    }
  }

  Future<void> deleteVehicle(String vehicleId) async {
    BuildContext context = navigatorKey.currentState!.context;

    await showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text(translation.txt_deletevehicle),
        content: Text(translation.txt_deletevehicle_desc),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(translation.txt_cancel),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _confirmDeleteVehicle(vehicleId);
            },
            child: Text(translation.txt_Ok),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 🚗 GET VEHICLE LIST
  // ---------------------------------------------------------------------------

  Future<void> getVehicleList() async {
    vehicleList.clear();
    isLoadingVehicles = true;
    notifyListeners();

    try {
      final response = await apiHelper.get(AppUrls.vehiclelist);

      response.fold(
            (error) {
          showErrorDialog(errorModel: error);
        },
            (result) {
          final responseData = result.data;

          List<dynamic>? dataList;

          if (responseData is Map &&
              responseData.containsKey('data') &&
              responseData['data'] is List) {
            dataList = responseData['data'];
          } else if (responseData is List) {
            dataList = responseData;
          }

          if (dataList != null && dataList.isNotEmpty) {
            vehicleList = dataList
                .map((json) =>
                ManageVehicleListModel.fromJson(json as Map<String, dynamic>))
                .toList();
          }
        },
      );
    } catch (e) {
      showErrorDialog(message: AppConstants.someThingWentWrong);
    } finally {
      isLoadingVehicles = false;
      notifyListeners();
    }
  }

  // ---------------------------------------------------------------------------
  // 🔄 TOGGLE VEHICLE STATUS
  // ---------------------------------------------------------------------------

  Future<void> toggleVehicleStatus(
      String vehicleId, bool currentStatus) async {
    final index = vehicleList.indexWhere((v) => v.sId == vehicleId);

    if (index != -1) {
      vehicleList[index].status = !currentStatus;
      notifyListeners();
    }

    showLoader();

    try {
      final params = {AppConstants.status: !currentStatus};

      final response = await apiHelper.put(
        "${AppUrls.drivestatus}$vehicleId",
        params: params,
      );

      response.fold(
            (error) {
          // revert UI on failure
          if (index != -1) {
            vehicleList[index].status = currentStatus;
            notifyListeners();
          }

          showErrorDialog(errorModel: error);
        },
            (result) {},
      );
    } catch (e) {
      if (index != -1) {
        vehicleList[index].status = currentStatus;
        notifyListeners();
      }

      showErrorDialog(message: AppConstants.someThingWentWrong);
    } finally {
      hideLoader();
    }
  }
}
