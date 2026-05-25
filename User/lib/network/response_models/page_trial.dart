

import 'package:user/network/response_models/trip_model.dart';

class PageTrial{
  String? month;
  List<Trip>? dataList;
  int? page;
  int? limit;
  int? totalPages;
  int? totalResults;


  PageTrial(
      {
        this.month,
        this.dataList,
        this.page,
        this.limit,
        this.totalPages,
        this.totalResults
      });

}