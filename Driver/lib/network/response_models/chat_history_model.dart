

class ChatHistoryModel {
  String? sId;
  String? senderId;
  String? receiverId;
  String? senderType;
  String? receiverType;
  String? message;
  bool? delivered;
  bool? read;
  String? createdAt;
  String? updatedAt;
  int? iV;

  ChatHistoryModel(
      {this.sId,
        this.senderId,
        this.receiverId,
        this.senderType,
        this.receiverType,
        this.message,
        this.delivered,
        this.read,
        this.createdAt,
        this.updatedAt,
        this.iV});

  ChatHistoryModel.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    senderId = json['senderId'];
    receiverId = json['receiverId'];
    senderType = json['senderType'];
    receiverType = json['receiverType'];
    message = json['message'];
    delivered = json['delivered'];
    read = json['read'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    iV = json['__v'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['senderId'] = this.senderId;
    data['receiverId'] = this.receiverId;
    data['senderType'] = this.senderType;
    data['receiverType'] = this.receiverType;
    data['message'] = this.message;
    data['delivered'] = this.delivered;
    data['read'] = this.read;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['__v'] = this.iV;
    return data;
  }
}
