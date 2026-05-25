class FaqModel {
  String? question;
  String? answer;
  String? category;
  bool? status;
  String? language;
  String? clientId;
  String? id;

  FaqModel(
      {this.question,
        this.answer,
        this.category,
        this.status,
        this.language,
        this.clientId,
        this.id});

  FaqModel.fromJson(Map<String, dynamic> json) {
    question = json['question'];
    answer = json['answer'];
    category = json['category'];
    status = json['status'];
    language = json['language'];
    clientId = json['clientId'];
    id = json['id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['question'] = question;
    data['answer'] = answer;
    data['category'] = category;
    data['status'] = status;
    data['language'] = language;
    data['clientId'] = clientId;
    data['id'] = id;
    return data;
  }
}