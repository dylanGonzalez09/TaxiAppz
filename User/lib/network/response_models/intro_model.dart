class IntroModel {
  String? image;
  bool? status;
  String? clientId;
  String? id;
  String? tittle;
  String? description;

  IntroModel(
      {this.image,
        this.status,
        this.clientId,
        this.id,
        this.tittle,
        this.description});

  IntroModel.fromJson(Map<String, dynamic> json) {
    image = json['image'];
    status = json['status'];
    clientId = json['clientId'];
    id = json['id'];
    tittle = json['title'];
    description = json['description'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['image'] = image;
    data['status'] = status;
    data['clientId'] = clientId;
    data['id'] = id;
    data['title'] = tittle;
    data['description'] = description;
    return data;
  }
}