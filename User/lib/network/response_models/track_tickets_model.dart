import 'package:flutter/cupertino.dart';

class TrackTicketsModel {
  String? title;
  String? description;
  String? status;
  String? createdAt;
  String? updatedAt;
  String? id;
  String? userId;
  String? requestNumber;
  String? userName;
  String? assignedToId;
  String? assignedToName;
  List<TicketsNotes>? ticketsNotes = [];
  Map<String, GlobalKey>? keys;
  Map<String, double>? heights;

  TrackTicketsModel(
      {this.title,
        this.description,
        this.status,
        this.createdAt,
        this.updatedAt,
        this.id,
        this.userId,
        this.requestNumber,
        this.userName,
        this.assignedToId,
        this.assignedToName,
        this.ticketsNotes,
        this.keys,
        this.heights});

  TrackTicketsModel.fromJson(Map<String, dynamic> json) {
    title = json['title'];
    description = json['description'];
    status = json['status'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    id = json['id'];
    userId = json['userId'];
    requestNumber = json['requestNumber'];
    userName = json['userName'];
    assignedToId = json['assignedToId'];
    assignedToName = json['assignedToName'];
    if (json['notes'] != null && json['notes'] is List<dynamic>) {
      ticketsNotes?.clear();
      ticketsNotes?.addAll(
          List.from(json['notes'].map((m) => TicketsNotes.fromJson(m))));
    }
    if (json['keys'] != null && json['keys'] is Map<String, GlobalKey>) {
      keys = <String, GlobalKey>{};
      keys?.addAll(json['keys']);
    }
    if (json['heights'] != null && json['heights'] is Map<String, double>) {
      heights = <String, double>{};
      heights?.addAll(json['heights']);
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['title'] = title;
    data['description'] = description;
    data['status'] = status;
    data['createdAt'] = createdAt;
    data['updatedAt'] = updatedAt;
    data['id'] = id;
    data['userId'] = userId;
    data['requestNumber'] = requestNumber;
    data['userName'] = userName;
    data['assignedToId'] = assignedToId;
    data['assignedToName'] = assignedToName;
    if (ticketsNotes?.isNotEmpty == true) {
      data['notes'] = List.from(ticketsNotes!.map((m) => m.toJson()));
    }
    if (keys?.isNotEmpty == true) {
      data['keys'] = keys;
    }
    if (heights?.isNotEmpty == true) {
      data['heights'] = heights;
    }
    return data;
  }
}

class TicketsNotes {
  String? note, name;
  String? status;
  String? createdAt;
  String? sId;
  bool? isSelected = false;

  TicketsNotes({
    this.note,
    this.status,
    this.createdAt,
    this.sId,
    this.name,
    this.isSelected,
  });

  TicketsNotes.fromJson(Map<String, dynamic> json) {
    note = json['note'];
    status = json['status'];
    createdAt = json['createdAt'];
    sId = json['_id'];
    name = json['name'];
    isSelected = json['isSelected'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['note'] = note;
    data['status'] = status;
    data['createdAt'] = createdAt;
    data['_id'] = sId;
    data['name'] = name;
    data['isSelected'] = isSelected;
    return data;
  }
}
