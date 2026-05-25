import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:taxiappzpro/components/drawer_scaffold.dart';
import 'package:taxiappzpro/network/response_models/track_tickets_model.dart';
import 'package:taxiappzpro/network/response_models/translation_model.dart';
import 'package:taxiappzpro/utils/app_constants.dart';
import '../../components/header_view.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../../utils/dimensions.dart';

class TrackTicketDetails extends StatefulWidget {
  final Map<String, dynamic> data;

  const TrackTicketDetails({super.key, required this.data});

  @override
  State createState() => TrackTicketDetailsState();
}

class TrackTicketDetailsState extends State<TrackTicketDetails> {
  late final TranslationModel translationModel;
  late final TrackTicketsModel trackTicketsModel;

  @override
  void initState() {
    translationModel =
        TranslationModel.fromJson(widget.data[AppConstants.translation]);
    trackTicketsModel = TrackTicketsModel.fromJson(
        widget.data[AppConstants.trackTicketsDetails]);

    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (trackTicketsModel.keys?.isNotEmpty == true) {
        trackTicketsModel.keys!.forEach((k, v) {
          final context = v.currentContext;
          if (context != null) {
            final box = context.findRenderObject() as RenderBox;
            trackTicketsModel.heights?[k] =
                box.size.height + Dimensions.padding_20;
          }
        });
        setState(() {});
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return DrawerScaffold(
        body: Column(
          children: [
            Padding(
              padding:
                  const EdgeInsets.symmetric(horizontal: Dimensions.padding_20),
              child:
                  HeaderView(title: translationModel.txtTicketsDetails ?? ""),
            ),
            Expanded(
              child: Container(
                color: CustomColors.clr_F0F0F0,
                child: SingleChildScrollView(
                  child: Container(
                    decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius:
                            BorderRadius.circular(Dimensions.padding_10)),
                    margin: const EdgeInsets.all(Dimensions.padding_20),
                    padding: const EdgeInsets.all(Dimensions.padding_15),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      spacing: Dimensions.padding_10,
                      children: [
                        Text(
                          trackTicketsModel.title ?? "",
                          style: Theme.of(context)
                              .textTheme
                              .labelLarge
                              ?.copyWith(
                                  overflow: TextOverflow.clip,
                                  fontWeight: FontWeight.bold,
                                  fontSize: Dimensions.padding_17),
                        ),
                        Text(
                          trackTicketsModel.requestNumber?.isNotEmpty == true
                              ? "${translationModel.txt_trip_id} : ${trackTicketsModel.requestNumber}"
                              : "${translationModel.txtUserId} : ${trackTicketsModel.userId}",
                          style: Theme.of(context)
                              .textTheme
                              .labelSmall
                              ?.copyWith(fontSize: Dimensions.padding_16),
                        ),
                        Text(
                          "${translationModel.txtDescription} : ${trackTicketsModel.description ?? ""}",
                          style: Theme.of(context)
                              .textTheme
                              .labelSmall
                              ?.copyWith(
                                  fontSize: Dimensions.padding_15,
                                  overflow: TextOverflow.clip),
                        ),
                        const SizedBox(
                          height: Dimensions.padding_10,
                        ),
                        Visibility(
                          visible: trackTicketsModel.ticketsNotes?.isNotEmpty ==
                              true,
                          child: Column(
                            spacing: Dimensions.padding_15,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                translationModel.txtTicketStatus ?? "",
                                style: Theme.of(context)
                                    .textTheme
                                    .labelLarge
                                    ?.copyWith(
                                        overflow: TextOverflow.clip,
                                        fontWeight: FontWeight.bold,
                                        fontSize: Dimensions.padding_16),
                              ),
                              ListView.builder(
                                  physics: const NeverScrollableScrollPhysics(),
                                  shrinkWrap: true,
                                  itemBuilder: (c, p) {
                                    return Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      spacing: Dimensions.padding_10,
                                      children: [
                                        Column(
                                          children: [
                                            Visibility(
                                              visible: p != 0,
                                              child: SizedBox(
                                                height: Dimensions.padding_30,
                                                child: VerticalDivider(
                                                  thickness:
                                                      Dimensions.padding_2,
                                                  color: trackTicketsModel
                                                              .ticketsNotes?[p]
                                                              .isSelected ==
                                                          true
                                                      ? CustomColors
                                                          .primaryColor
                                                      : CustomColors.clr_AAAAAA,
                                                ),
                                              ),
                                            ),
                                            SvgPicture.asset(
                                              trackTicketsModel.ticketsNotes?[p]
                                                          .isSelected ==
                                                      true
                                                  ? CustomImages
                                                      .checkedDisputeStatus
                                                  : CustomImages
                                                      .unCheckedDisputeStatus,
                                              height: Dimensions.padding_20,
                                              width: Dimensions.padding_20,
                                            ),
                                            Visibility(
                                              visible: trackTicketsModel
                                                          .ticketsNotes
                                                          ?.isNotEmpty ==
                                                      true
                                                  ? p !=
                                                      trackTicketsModel
                                                              .ticketsNotes!
                                                              .length -
                                                          1
                                                  : false,
                                              child: SizedBox(
                                                height: trackTicketsModel
                                                                .ticketsNotes?[
                                                                    p]
                                                                .note
                                                                ?.isNotEmpty ==
                                                            true &&
                                                        trackTicketsModel
                                                                .heights
                                                                ?.isNotEmpty ==
                                                            true
                                                    ? trackTicketsModel
                                                            .heights![
                                                        trackTicketsModel
                                                            .ticketsNotes?[p]
                                                            .sId]
                                                    : Dimensions.padding_30,
                                                child: VerticalDivider(
                                                  thickness:
                                                      Dimensions.padding_2,
                                                  color: trackTicketsModel
                                                              .ticketsNotes?[p]
                                                              .isSelected ==
                                                          true
                                                      ? CustomColors
                                                          .primaryColor
                                                      : CustomColors.clr_AAAAAA,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                        Expanded(
                                          child: Container(
                                            margin: EdgeInsets.only(
                                                top: p != 0
                                                    ? Dimensions.padding_30
                                                    : 0,
                                                right: MediaQuery.of(context)
                                                        .size
                                                        .width /
                                                    5),
                                            padding: const EdgeInsets.all(
                                                Dimensions.padding_12),
                                            decoration: BoxDecoration(
                                                borderRadius:
                                                    BorderRadius.circular(
                                                        Dimensions.padding_5),
                                                color: trackTicketsModel
                                                            .ticketsNotes?[p]
                                                            .status
                                                            ?.toUpperCase() ==
                                                        trackTicketsModel.status
                                                            ?.toUpperCase()
                                                    ? CustomColors.primaryColor
                                                    : trackTicketsModel
                                                                .ticketsNotes?[
                                                                    p]
                                                                .isSelected ==
                                                            true
                                                        ? CustomColors
                                                            .selectedColor
                                                        : CustomColors
                                                            .clr_AAAAAA),
                                            child: trackTicketsModel
                                                        .ticketsNotes?[p]
                                                        .note
                                                        ?.isNotEmpty ==
                                                    true
                                                ? Column(
                                                    key: trackTicketsModel
                                                            .keys?[
                                                        trackTicketsModel
                                                            .ticketsNotes?[p]
                                                            .sId],
                                                    spacing:
                                                        Dimensions.padding_3,
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .start,
                                                    children: [
                                                      Text(
                                                        trackTicketsModel
                                                                .ticketsNotes?[
                                                                    p]
                                                                .name ??
                                                            "",
                                                        style: Theme.of(context).textTheme.labelMedium?.copyWith(
                                                            color: trackTicketsModel
                                                                        .status
                                                                        ?.toUpperCase() ==
                                                                    trackTicketsModel
                                                                        .ticketsNotes?[
                                                                            p]
                                                                        .status
                                                                        ?.toUpperCase()
                                                                ? CustomColors
                                                                    .buttonTxtColor
                                                                : CustomColors
                                                                    .primaryColor,
                                                            fontSize: Dimensions
                                                                .padding_14),
                                                      ),
                                                      Text(
                                                        trackTicketsModel
                                                                .ticketsNotes?[
                                                                    p]
                                                                .note ??
                                                            "",
                                                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                                            overflow:
                                                                TextOverflow
                                                                    .clip,
                                                            color: trackTicketsModel
                                                                        .status
                                                                        ?.toUpperCase() ==
                                                                    trackTicketsModel
                                                                        .ticketsNotes?[
                                                                            p]
                                                                        .status
                                                                        ?.toUpperCase()
                                                                ? CustomColors
                                                                    .buttonTxtColor
                                                                : Colors.black,
                                                            fontSize: Dimensions
                                                                .padding_12),
                                                      )
                                                    ],
                                                  )
                                                : Text(
                                                    trackTicketsModel
                                                            .ticketsNotes?[p]
                                                            .name ??
                                                        "",
                                                    style: Theme.of(context)
                                                        .textTheme
                                                        .labelSmall
                                                        ?.copyWith(
                                                            color: trackTicketsModel
                                                                        .ticketsNotes?[
                                                                            p]
                                                                        .status
                                                                        ?.toUpperCase() ==
                                                                    trackTicketsModel
                                                                        .status
                                                                        ?.toUpperCase()
                                                                ? CustomColors
                                                                    .buttonTxtColor
                                                                : trackTicketsModel
                                                                            .ticketsNotes?[
                                                                                p]
                                                                            .isSelected ==
                                                                        true
                                                                    ? CustomColors
                                                                        .primaryColor
                                                                    : Colors
                                                                        .white,
                                                            fontSize: Dimensions
                                                                .padding_13),
                                                  ),
                                          ),
                                        )
                                      ],
                                    );
                                  },
                                  itemCount:
                                      trackTicketsModel.ticketsNotes?.length),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
        scaffoldKey: GlobalKey<ScaffoldState>());
  }
}
