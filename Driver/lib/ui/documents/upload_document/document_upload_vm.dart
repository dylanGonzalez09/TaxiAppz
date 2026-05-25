import 'dart:io';

import 'package:device_info_plus/device_info_plus.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:fpdart/fpdart.dart';
import 'package:http_parser/http_parser.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:taxiappzpro/base/base_vm.dart';
import 'package:taxiappzpro/main.dart';
import 'package:taxiappzpro/network/response_models/documents_model.dart';
import 'package:taxiappzpro/utils/app_constants.dart';
import 'package:taxiappzpro/utils/app_urls.dart';

import '../../../network/response_models/base_response.dart';
import '../../../network/response_models/custom_error_model.dart';
import '../../../utils/preference_helper.dart';

class DocumentUploadVm extends BaseVm {
  final TextEditingController documentIdController = TextEditingController();
  final TextEditingController expireDateController = TextEditingController();
  final TextEditingController issueDateController = TextEditingController();
  late DocumentsModel document;

  bool isIssueDateHintEnabled = false;
  bool isExpiryDateHintEnabled = false;

  bool showIdentifier = false;
  bool showExpiryDate = false;
  bool showIssueDate = false;
  bool showImage = false;
  bool isFirstChange = true;
  String? currentVehicleId;

  String identifierError = "";
  String issueDateError = "";
  String expiryDateError = "";

  void setData(Map<String, dynamic> map) {
    document = map[AppConstants.document];
    print(" check: ${document.getDocument != null && document.getDocument?.isNotEmpty == true}");
    notifyListeners();
    if (document.getDocument != null &&
        document.getDocument?.isNotEmpty == true) {
      showIdentifier = document.getDocument![0].isIdentifierRequired == true;
      showExpiryDate = document.getDocument![0].isExpiryDateRequired == true;
      showIssueDate = document.getDocument![0].isIssueDateRequired == true;
      showImage = document.getDocument![0].isImageRequired == true;
      documentIdController.text = document.getDocument![0].identifier ?? "";
      try {
        expireDateController.text = document.getDocument != null &&
                document.getDocument!.isNotEmpty &&
                document.getDocument![0].expiryDate != null
            ? DateFormat('dd/MM/yyyy').format(DateFormat('dd/MM/yyyy')
                .parse(document.getDocument![0].expiryDate!))
            : "";
      } catch (e) {
        expireDateController.text = document.getDocument != null &&
                document.getDocument!.isNotEmpty &&
                document.getDocument![0].expiryDate != null
            ? document.getDocument![0].expiryDate!
            : "";
      }
      try {
        issueDateController.text = document.getDocument != null &&
                document.getDocument!.isNotEmpty &&
                document.getDocument![0].issueDate != null
            ? DateFormat('dd/MM/yyyy').format(DateFormat('dd/MM/yyyy')
                .parse(document.getDocument![0].issueDate!))
            : "";
      } catch (e) {
        issueDateController.text = document.getDocument != null &&
                document.getDocument!.isNotEmpty &&
                document.getDocument![0].issueDate != null
            ? document.getDocument![0].issueDate! : "";
      }
    }
  }

  void selectDate(bool isIssueDate) async {
    if (navigatorKey.currentState != null) {
      DateTime? pickedDate = await showDatePicker(
        context: navigatorKey.currentState!.context,
        initialDate: DateTime.now(),
        firstDate: isIssueDate ? DateTime(1900) : DateTime.now(),
        lastDate: isIssueDate ? DateTime.now() : DateTime(2050),
      );
      if (pickedDate != null) {
        String formattedDate = DateFormat('dd/MM/yyyy').format(pickedDate);
        if (isIssueDate) {
          issueDateController.text = formattedDate;
          issueDateError = "";
          notifyListeners();
        } else {
          expireDateController.text = formattedDate;
          expiryDateError = "";
          notifyListeners();
        }
      }
    }
  }

  Future<void> pickImageFromGallery(int index) async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(source: ImageSource.gallery);

      if (image != null) {
        final file = File(image.path);
        if (document.getDocument != null) {
          document.getDocument![index].documentImage = null;
          document.getDocument![index].imageFile = file;
          notifyListeners();
        }
      } else {
        // User cancelled picker
        return;
      }
    } catch (e) {
      showErrorDialog(message: "Failed to pick image: $e");
    }
  }

  void validate() async {
    if (showIdentifier && documentIdController.text.isEmpty) {
      identifierError = translation.txt_DocumentId_required;
      notifyListeners();
    } else if (showIssueDate && issueDateController.text.isEmpty) {
      identifierError = "";
      issueDateError = translation.txt_Expiry_date_required;
      notifyListeners();
    } else if (showExpiryDate && expireDateController.text.isEmpty) {
      identifierError = "";
      issueDateError = "";
      expiryDateError = translation.txt_Issue_date_error;
      notifyListeners();
    } else {
      identifierError = "";
      issueDateError = "";
      expiryDateError = "";
      notifyListeners();
      if (document.getDocument != null && document.getDocument!.isNotEmpty) {
        bool isDocumentUploaded = true;
        documentLoop:
        for (var i in document.getDocument!) {
          if (i.isRequired == true &&
              (i.imageFile == null && i.documentImage == null) &&
              i.isImageRequired == true) {
            isDocumentUploaded = false;
            showErrorDialog(
                message:
                    "${i.documentName ?? ""} ${translation.txt_image_not_uploaded}");
            break documentLoop;
          }
        }

        if (isDocumentUploaded) {
          uploadDocument();
        }
      }
    }
  }


  bool isValidFileType(File file) {
    final validExtensions = ['jpg', 'jpeg', 'png'];
    final fileExtension = file.path.split('.').last.toLowerCase();
    return validExtensions.contains(fileExtension);
  }

  MediaType getMimeType(String filePath) {
    final fileExtension = filePath.split('.').last.toLowerCase();
    switch (fileExtension) {
      case 'jpg':
      case 'jpeg':
        return MediaType('image', 'jpeg');
      case 'png':
        return MediaType('image', 'png');
      default:
        return MediaType('application', 'octet-stream');
    }
  }

  Future<void> uploadDocument() async {
    showLoader();
    final futures = <Future<Either<ErrorModel, BaseResponse>>>[];
    for (var i in document.getDocument!) {
      if (i.imageFile != null && isValidFileType(i.imageFile!)) {
        final mimeType = getMimeType(i.imageFile!.path);
        print("object555555555555555555555555555  mimeType ${mimeType}");
        print(
            "object555555555555555555555555555  mimeType 3333333 ${i.imageFile!.path}");
        print("sanasdmnsm,dn${currentVehicleId}");
        final formData = FormData.fromMap({
          AppConstants.documentId: i.id,

          if (showIdentifier)
            AppConstants.identifier: documentIdController.text,

          if (showExpiryDate)
            AppConstants.expiryDate:
            convertDateFormat(expireDateController.text, null),

          if (showIssueDate)
            AppConstants.issueDate:
            convertDateFormat(issueDateController.text, null),

          if (currentVehicleId != null)
            "driverVehicleId": currentVehicleId,

          AppConstants.documentImage: await MultipartFile.fromFile(
            i.imageFile!.path,
            contentType: mimeType,
          ),
        });


        print("Form Data Fields: ${formData.fields}");
        print("Form Data Fields11111111111111: ${i.imageFile!.path}");

        final apiCall =
            apiHelper.post(AppUrls.uploadDriverDocument, params: formData);
        futures.add(apiCall);
      } else {
        print("Invalid file type: ${i.imageFile?.path}");
      }
    }

    final response = await Future.wait(futures);
    bool isUploaded = true;
    loop:
    for (var i in response) {
      i.fold((e) {
        showErrorDialog(errorModel: e);
        isUploaded = false;
      }, (r) {
        isUploaded = true;
      });
      if (!isUploaded) {
        break loop;
      }
    }
    hideLoader();
    if (isUploaded) {
      pop(args: true);
    }
  }
}
