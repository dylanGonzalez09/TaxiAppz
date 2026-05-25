import 'dart:convert';

import 'package:flutter/cupertino.dart';
import 'package:taxiappzpro/base/base_vm.dart';
import 'package:taxiappzpro/network/response_models/custom_name_model.dart';
import 'package:taxiappzpro/network/response_models/track_tickets_model.dart';
import 'package:taxiappzpro/utils/app_constants.dart';
import 'package:taxiappzpro/utils/app_urls.dart';
import 'package:taxiappzpro/utils/dimensions.dart';

class TrackTicketsVm extends BaseVm {
  List<CustomNameModel> category = [];
  bool isDisposed = false, isTrackTicketsDataEmpty = false;
  List<TrackTicketsModel> trackTicketsList = [], filteredTrackTicketsList = [];

  void addCustomList() {
    category.clear();
    category.addAll([
      CustomNameModel(
          name: translation.txtAll, id: AppConstants.all, isSelected: true),
      CustomNameModel(
          name: translation.txtActive,
          id: AppConstants.active,
          isSelected: false),
      CustomNameModel(
          name: translation.txtClosed,
          id: AppConstants.closed,
          isSelected: false),
    ]);
  }

  Future<void> getTicketsDetailsList(CustomNameModel c) async {
    isTrackTicketsDataEmpty = false;
    filteredTrackTicketsList.clear();
    notifyListeners();
    if (c.id == AppConstants.all || trackTicketsList.isEmpty) {
      final response = await apiHelper.get(AppUrls.getTicketsDetails);
      response.fold((e) {
        showErrorDialog(errorModel: e);
        isTrackTicketsDataEmpty = true;
      }, (r) {
        if (r.data != null) {
          var jsonString = jsonDecode(json.encode(r.data));
          trackTicketsList.clear();
          trackTicketsList.addAll(List<TrackTicketsModel>.from(
              jsonString.map((m) => TrackTicketsModel.fromJson(m))));
        }
        if (trackTicketsList.isNotEmpty) {
          for (var i in trackTicketsList) {
            i.keys = <String, GlobalKey>{};
            i.heights = <String, double>{};
            if (i.ticketsNotes?.isNotEmpty == true) {
              for (var dispute in i.ticketsNotes!) {
                if (dispute.sId?.isNotEmpty == true &&
                    i.keys?.containsKey(dispute.sId) != true) {
                  i.keys?[dispute.sId!] = GlobalKey();
                  i.heights?[dispute.sId!] = Dimensions.padding_30;
                }
                if (AppConstants.open.toUpperCase() ==
                    dispute.status?.toUpperCase()) {
                  dispute.name = translation.txtOpen;
                } else if (AppConstants.inProgress.toUpperCase() ==
                    dispute.status?.toUpperCase()) {
                  dispute.name = translation.txtInProgress;
                } else if (AppConstants.actionTaken.toUpperCase() ==
                    dispute.status?.toUpperCase()) {
                  dispute.name = translation.txtActionTaken;
                } else if (AppConstants.closed.toUpperCase() ==
                    dispute.status?.toUpperCase()) {
                  dispute.name = translation.txtClosed;
                }
                if ((i.status?.toUpperCase() ==
                            AppConstants.open.toUpperCase() ||
                        i.status?.toUpperCase() ==
                            AppConstants.inProgress.toUpperCase() ||
                        i.status?.toUpperCase() ==
                            AppConstants.actionTaken.toUpperCase() ||
                        i.status?.toUpperCase() ==
                            AppConstants.closed.toUpperCase()) &&
                    AppConstants.open.toUpperCase() ==
                        dispute.status?.toUpperCase()) {
                  dispute.isSelected = true;
                } else if ((i.status?.toUpperCase() ==
                            AppConstants.inProgress.toUpperCase() ||
                        i.status?.toUpperCase() ==
                            AppConstants.actionTaken.toUpperCase() ||
                        i.status?.toUpperCase() ==
                            AppConstants.closed.toUpperCase()) &&
                    AppConstants.inProgress.toUpperCase() ==
                        dispute.status?.toUpperCase()) {
                  dispute.isSelected = true;
                } else if ((i.status?.toUpperCase() ==
                            AppConstants.actionTaken.toUpperCase() ||
                        i.status?.toUpperCase() ==
                            AppConstants.closed.toUpperCase()) &&
                    AppConstants.actionTaken.toUpperCase() ==
                        dispute.status?.toUpperCase()) {
                  dispute.isSelected = true;
                } else if ((i.status?.toUpperCase() ==
                        AppConstants.closed.toUpperCase()) &&
                    AppConstants.closed.toUpperCase() ==
                        dispute.status?.toUpperCase()) {
                  dispute.isSelected = true;
                }
              }
            }
          }
        }
        filteredTrackTicketsList.addAll(trackTicketsList);
      });
    } else if (c.id == AppConstants.closed) {
      filteredTrackTicketsList
          .addAll(trackTicketsList.where((w) => w.status == c.id));
    } else if (c.id == AppConstants.active) {
      filteredTrackTicketsList.addAll(trackTicketsList.where((w) =>
          w.status?.toUpperCase() == AppConstants.open.toUpperCase() ||
          w.status?.toUpperCase() == AppConstants.inProgress.toUpperCase() ||
          w.status?.toUpperCase() == AppConstants.actionTaken.toUpperCase()));
    }
    isTrackTicketsDataEmpty = filteredTrackTicketsList.isEmpty;
    notifyListeners();
  }

  @override
  void notifyListeners() {
    if (!isDisposed) {
      super.notifyListeners();
    }
  }
}

// enum TrackTickets {open, In-Progress, Action-Taken, closed
// }
