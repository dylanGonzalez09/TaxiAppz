// lib/models/documents_model.dart
import 'dart:io';
import 'package:taxiappzpro/models/enums.dart';

/// Simple header class used to render section headers in the list
class DocumentHeader {
  final String title;
  DocumentHeader(this.title);
}

class DocumentsData {
  List<DocumentsModel> driver;
  List<DocumentsModel> vehicle;

  DocumentsData({required this.driver, required this.vehicle});

  DocumentsData.fromJson(Map<String, dynamic> json)
      : driver = (json['driver'] as List?)
      ?.map((e) => DocumentsModel.fromJson(
      e is Map<String, dynamic> ? e : Map<String, dynamic>.from(e)))
      .toList() ??
      [],
        vehicle = (json['vehicle'] as List?)
            ?.map((e) => DocumentsModel.fromJson(
            e is Map<String, dynamic> ? e : Map<String, dynamic>.from(e)))
            .toList() ??
            [];
}

class DocumentsModel {
  String? id;
  String? zoneId;
  String? name;
  String? documentFor;
  int? status;
  int? documentCount;
  bool? uploadStatus;
  List<GetDocument>? getDocument;
  bool isRequired = false;
  bool isExpired = false;
  DriverBlockedReason approveStatus = DriverBlockedReason.APPROVED;

  DocumentsModel(
      {this.id,
        this.zoneId,
        this.name,
        this.documentFor,
        this.status,
        this.documentCount,
        this.uploadStatus,
        this.getDocument});

  DocumentsModel.fromJson(Map<String, dynamic> json) {
    id = json['id'] as String?;
    zoneId = json['zone_id'] as String?;
    name = json['name'] as String?;
    documentFor = json['document_for'] as String?;
    status = json['status'] is int ? json['status'] as int : null;
    documentCount =
    json['document_count'] is int ? json['document_count'] as int : null;
    uploadStatus =
    json['upload_status'] is bool ? json['upload_status'] as bool : null;

    if (json['get_document'] != null && json['get_document'] is List) {
      getDocument = <GetDocument>[];
      for (var v in json['get_document']) {
        if (v is Map<String, dynamic>) {
          getDocument!.add(GetDocument.fromJson(v));
        } else if (v is Map) {
          getDocument!.add(GetDocument.fromJson(Map<String, dynamic>.from(v)));
        }
      }
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['id'] = id;
    data['zone_id'] = zoneId;
    data['name'] = name;
    data['document_for'] = documentFor;
    data['status'] = status;
    data['document_count'] = documentCount;
    data['upload_status'] = uploadStatus;
    if (getDocument != null) {
      data['get_document'] = getDocument!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class GetDocument {
  String? id;
  String? documentName;
  String? zoneId;
  bool? isRequired;
  bool? isIdentifierRequired;
  bool? isExpiryDateRequired;
  bool? isIssueDateRequired;
  bool? status;
  String? groupBy;
  bool? isUploaded;
  String? documentImage;
  String? expiryDate;
  String? issueDate;
  String? identifier;
  bool? expiryStatus;
  File? imageFile;
  bool? isImageRequired;
  String? documentStatus;

  GetDocument(
      {this.id,
        this.documentName,
        this.zoneId,
        this.isRequired,
        this.isIdentifierRequired,
        this.isExpiryDateRequired,
        this.isIssueDateRequired,
        this.status,
        this.groupBy,
        this.isUploaded,
        this.documentImage,
        this.expiryDate,
        this.issueDate,
        this.identifier,
        this.expiryStatus,
        this.isImageRequired,
        this.documentStatus});

  GetDocument.fromJson(Map<String, dynamic> json) {
    id = json['id'] as String?;
    documentName = json['document_name'] as String?;
    zoneId = json['zone_id'] as String?;
    isRequired = json['isRequired'] as bool?;
    isIdentifierRequired = json['isIdentifierRequired'] as bool?;
    isExpiryDateRequired = json['isExpiryDateRequired'] as bool?;
    isIssueDateRequired = json['isIssueDateRequired'] as bool?;
    status = json['status'] as bool?;
    groupBy = json['group_by'] as String?;
    isUploaded = json['is_uploaded'] as bool?;
    documentImage = json['document_image'] as String?;
    expiryDate = json['expiryDate'] as String?;
    issueDate = json['issueDate'] as String?;
    identifier = json['identifier'] as String?;
    expiryStatus = json['expiryStatus'] as bool?;
    isImageRequired = json['isImageRequired'] as bool?;
    documentStatus = json['documentStatus'] as String?;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['id'] = id;
    data['document_name'] = documentName;
    data['zone_id'] = zoneId;
    data['isRequired'] = isRequired;
    data['isIdentifierRequired'] = isIdentifierRequired;
    data['isExpiryDateRequired'] = isExpiryDateRequired;
    data['isIssueDateRequired'] = isIssueDateRequired;
    data['status'] = status;
    data['group_by'] = groupBy;
    data['is_uploaded'] = isUploaded;
    data['document_image'] = documentImage;
    data['expiryDate'] = expiryDate;
    data['issueDate'] = issueDate;
    data['identifier'] = identifier;
    data['expiryStatus'] = expiryStatus;
    data['isImageRequired'] = isImageRequired;
    data['documentStatus'] = documentStatus;
    return data;
  }
}
