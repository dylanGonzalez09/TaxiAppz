import 'package:taxiappzpro/base/base_vm.dart';
import 'package:taxiappzpro/models/enums.dart';
import 'package:taxiappzpro/network/response_models/documents_model.dart' as unused;
import 'package:taxiappzpro/utils/app_urls.dart';
import 'package:taxiappzpro/utils/custom_router_config.dart';

class DocumentsVm extends BaseVm {
  bool isDisposed = false;
  String? currentVehicleId;

  final List<dynamic> documents = [];

  bool isDocumentsUploaded = false, isSubmitBtnEnabled = false;

  Future<void> getDocumentList({
    bool isRefresh = false,
    bool show = false,
    String? vehicleId,
  }) async {
    if (!isRefresh && show) showLoader();


    if (vehicleId != null) {
      currentVehicleId = vehicleId;
    }

    final url = currentVehicleId != null
        ? "${AppUrls.docslistvehicle}$currentVehicleId"
        : AppUrls.documenttype;
    print(" Fetching documents from: $url");

    final response = await apiHelper.get(url);

    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      print(" Documents API Response: ${r.data}");


      final dataMap =
      (r.data is Map) ? Map<String, dynamic>.from(r.data) : <String, dynamic>{};


      List<unused.DocumentsModel> parseGroupList(dynamic list) {
        if (list is! List) return [];
        return list
            .map((e) => e is Map<String, dynamic>
            ? unused.DocumentsModel.fromJson(e)
            : unused.DocumentsModel.fromJson(Map<String, dynamic>.from(e)))
            .toList();
      }

      final driverList = parseGroupList(dataMap['driver']);
      final vehicleList = parseGroupList(dataMap['vehicle']);

      final apiDocs = <unused.DocumentsModel>[];


      if (currentVehicleId != null) {

        apiDocs.addAll(vehicleList);
      } else {

        apiDocs.addAll(driverList);
        apiDocs.addAll(vehicleList);
      }


      documents.clear();
      isDocumentsUploaded = true;

      for (var i in apiDocs) {
        if (i.uploadStatus == false) {
          isDocumentsUploaded = false;
        }
        if (i.getDocument != null) {
          for (var j in i.getDocument!) {
            if (j.expiryStatus == true) {
              i.isExpired = true;
            }
            if (j.isRequired == true) {
              i.isRequired = true;
            }

            if (j.documentStatus != DriverBlockedReason.APPROVED.name) {
              final matchedStatus = DriverBlockedReason.values.firstWhere(
                    (value) {
                  final normalizedEnumName = value.name
                      .replaceAll('DOCUMENT_', '')
                      .replaceAll('_', '')
                      .toUpperCase();
                  final normalizedDocumentStatus = j.documentStatus?.toUpperCase();
                  return normalizedEnumName == normalizedDocumentStatus;
                },
                orElse: () {
                  return DriverBlockedReason.DOCUMENT_NOT_UPLOADED;
                },
              );

              if (matchedStatus == DriverBlockedReason.DENIED) {
                i.approveStatus = DriverBlockedReason.DENIED;
                break;
              }

              i.approveStatus = matchedStatus;
            }
          }
        }
      }


      if (currentVehicleId != null) {

        if (vehicleList.isNotEmpty) {
          documents.add(unused.DocumentHeader("Vehicle Documents"));
          documents.addAll(vehicleList);
        } else {
          // If no vehicle documents found
          print(" No vehicle documents found for vehicle ID: $currentVehicleId");
        }
      } else {
        // For general document view, show both driver and vehicle sections
        if (driverList.isNotEmpty) {
          documents.add(unused.DocumentHeader("Driver Documents"));
          documents.addAll(driverList);
        }

        if (vehicleList.isNotEmpty) {
          documents.add(unused.DocumentHeader("Vehicle Documents"));
          documents.addAll(vehicleList);
        }
      }

      // Calculate submit button enablement:
      final uploadedData = apiDocs
          .where((g) => !g.isExpired && g.uploadStatus == true)
          .map((m) => !m.isExpired && m.uploadStatus == true)
          .toList();
      isSubmitBtnEnabled =
          uploadedData.isNotEmpty &&
              !uploadedData.contains(false) &&
              (uploadedData.length == apiDocs.length);

      print("Documents loaded: ${documents.length} items");
      print("Submit button enabled: $isSubmitBtnEnabled");

      notifyListeners();
    });
    if (!isRefresh) hideLoader();
  }

  @override
  void notifyListeners() {
    if (!isDisposed) {
      super.notifyListeners();
    }
  }

  String documentStatus(DriverBlockedReason reason) {
    if (reason == DriverBlockedReason.DENIED) {
      return translation.txt_Denied;
    }
    return "";
  }

  Future<void> getDemoUpdateStatus() async {
    showLoader();
    final response = await apiHelper.put(AppUrls.demoUpdatesStatus);
    response.fold((e) => showErrorDialog(errorModel: e), (r) {
      popAndMove(CustomRouterConfig.mapScreen);
    });
    hideLoader();
    notifyListeners();
  }

  void clearVehicleContext() {
    currentVehicleId = null;
    notifyListeners();
  }
}