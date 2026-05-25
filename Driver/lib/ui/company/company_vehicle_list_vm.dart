import 'package:taxiappzpro/utils/app_constants.dart';
import 'package:taxiappzpro/utils/app_urls.dart';
import 'package:taxiappzpro/utils/custom_router_config.dart';
import 'package:go_router/go_router.dart';
import '../../base/base_vm.dart';
import '../../main.dart';
import '../../network/response_models/company_vehicle_model.dart';

class CompanyVehicleListVm extends BaseVm {
  CompanyVehicleModel? companyVehicleModel;
  int? selectedVehicleIndex;
  Vehicle? selectedVehicle;

  void selectVehicle(int index) {
    if (selectedVehicleIndex == index) {
      selectedVehicleIndex = null;
      selectedVehicle = null;
    } else {
      selectedVehicleIndex = index;
      selectedVehicle = companyVehicleModel?.vehicle?[index];
    }
    notifyListeners();
  }


  void getCompanyVehicleList() async {
    showLoader();
    final response = await apiHelper.get(AppUrls.getCompanyVehicle);
    hideLoader();
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      if (r.data != null) {
        final apiNotify = parseData(r.data, CompanyVehicleModel.fromJson);
        if (apiNotify != null) {
          companyVehicleModel = apiNotify;
        }
      }
      notifyListeners();
    });
  }

  void updateVehicleID(String? vehicleID) async {
    showLoader();
    final params = {
      AppConstants.companyVehicleId: vehicleID
    };
    final response = await apiHelper.post(AppUrls.updateCompanyVehicle, params: params);
    hideLoader();
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      if (r.success == true) {
        GoRouter.of(navigatorKey.currentState!.context).pop();
      }
      notifyListeners();
    });
  }

}
