import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:provider/provider.dart';
import 'package:taxiappzpro/components/drawer_scaffold.dart';
import 'package:taxiappzpro/components/header_view.dart';
import 'package:taxiappzpro/network/response_models/custom_name_model.dart';
import 'package:taxiappzpro/network/response_models/track_tickets_model.dart';
import 'package:taxiappzpro/ui/tracktickets/track_tickets_vm.dart';
import 'package:taxiappzpro/utils/app_constants.dart';
import 'package:taxiappzpro/utils/custom_colors.dart';
import 'package:taxiappzpro/utils/custom_images.dart';
import 'package:taxiappzpro/utils/custom_router_config.dart';
import 'package:taxiappzpro/utils/dimensions.dart';

class TrackTickets extends StatefulWidget {
  static const String tag = "TrackTickets";

  const TrackTickets({super.key});

  @override
  State createState() => TrackTicketsState();
}

class TrackTicketsState extends State<TrackTickets> {
  final GlobalKey<ScaffoldState> navigatorKey = GlobalKey<ScaffoldState>();
  late TrackTicketsVm vm;

  @override
  void initState() {
    vm = TrackTicketsVm();
    vm.addCustomList();
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      vm.getTicketsDetailsList(vm.category.first);
    });
  }

  @override
  Widget build(BuildContext context) => DrawerScaffold(
        scaffoldKey: navigatorKey,
        body: ChangeNotifierProvider<TrackTicketsVm>(
          create: (context) => vm,
          child: Consumer<TrackTicketsVm>(
            builder: (k, vm, c) => Column(
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(
                      horizontal: Dimensions.padding_20),
                  child: HeaderView(title: vm.translation.txtTrackTickets),
                ),
                ticketCategoryList(vm.category),
                ticketList(vm.filteredTrackTicketsList),
              ],
            ),
          ),
        ),
      );

  Widget ticketCategoryList(List<CustomNameModel> category) => GridView.builder(
        padding: const EdgeInsets.symmetric(
            horizontal: Dimensions.padding_20, vertical: Dimensions.padding_15),
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: category.length,
        itemBuilder: (c, p) => GestureDetector(
          onTap: () {
            for (var i in vm.category) {
              i.isSelected = false;
            }
            vm.category[p].isSelected = true;
            vm.getTicketsDetailsList(vm.category[p]);
          },
          child: Container(
            alignment: Alignment.center,
            decoration: vm.category[p].isSelected == true
                ? BoxDecoration(
                    borderRadius: BorderRadius.circular(Dimensions.padding_36),
                    border: Border.all(
                      color: CustomColors.primaryColor,
                    ))
                : null,
            child: Text(
              category[p].name ?? "",
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  fontWeight: FontWeight.bold, overflow: TextOverflow.ellipsis),
              maxLines: 1,
            ),
          ),
        ),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          crossAxisSpacing: Dimensions.padding_15, // horizontal spacing
          mainAxisSpacing: Dimensions.padding_10, // vertical spacing
          childAspectRatio: 3,
        ),
      );

  Widget ticketList(List<TrackTicketsModel> list) => Expanded(
        child: Container(
          color: CustomColors.clr_F0F0F0,
          child: list.isNotEmpty
              ? ListView.builder(
                  padding: const EdgeInsets.only(bottom: Dimensions.padding_20),
                  itemCount: vm.filteredTrackTicketsList.length,
                  itemBuilder: (c, p) => GestureDetector(
                    onTap: () => vm.moveToNamed(
                        CustomRouterConfig.trackTicketsDetails,
                        args: {
                          AppConstants.translation: vm.translation.toJson(),
                          AppConstants.trackTicketsDetails:
                              vm.filteredTrackTicketsList[p].toJson()
                        }),
                    child: Container(
                      decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius:
                              BorderRadius.circular(Dimensions.padding_10)),
                      margin: const EdgeInsets.only(
                          top: Dimensions.padding_20,
                          left: Dimensions.padding_20,
                          right: Dimensions.padding_20),
                      padding: const EdgeInsets.all(Dimensions.padding_15),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        spacing: Dimensions.padding_10,
                        children: [
                          Row(
                            spacing: Dimensions.padding_20,
                            children: [
                              Expanded(
                                child: Text(
                                  vm.filteredTrackTicketsList[p].title ?? "",
                                  style: Theme.of(context)
                                      .textTheme
                                      .labelLarge
                                      ?.copyWith(
                                          overflow: TextOverflow.clip,
                                          fontWeight: FontWeight.bold,
                                          fontSize: Dimensions.padding_16),
                                ),
                              ),
                              GestureDetector(
                                onTap: () => vm.moveToNamed(
                                    CustomRouterConfig.trackTicketsDetails,
                                    args: {
                                      AppConstants.translation:
                                          vm.translation.toJson(),
                                      AppConstants.trackTicketsDetails: vm
                                          .filteredTrackTicketsList[p]
                                          .toJson()
                                    }),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: Dimensions.padding_8,
                                      vertical: Dimensions.padding_4),
                                  decoration: BoxDecoration(
                                      color: CustomColors.selectedColor,
                                      borderRadius: BorderRadius.circular(
                                          Dimensions.padding_20)),
                                  child: Text(
                                    vm.translation.txtViewMore ?? "",
                                    style: Theme.of(context)
                                        .textTheme
                                        .labelSmall
                                        ?.copyWith(
                                            color: CustomColors.primaryColor,
                                            fontSize: Dimensions.padding_12),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          Text(
                            vm.filteredTrackTicketsList[p].requestNumber
                                        ?.isNotEmpty ==
                                    true
                                ? "${vm.translation.txt_trip_id} : ${vm.filteredTrackTicketsList[p].requestNumber}"
                                : "${vm.translation.txtUserId} : ${vm.filteredTrackTicketsList[p].userId}",
                            style: Theme.of(context)
                                .textTheme
                                .labelSmall
                                ?.copyWith(fontSize: Dimensions.padding_14),
                          ),
                          Visibility(
                            visible: vm.filteredTrackTicketsList[p].ticketsNotes
                                    ?.isNotEmpty ==
                                true,
                            child: ListView.builder(
                                physics: const NeverScrollableScrollPhysics(),
                                shrinkWrap: true,
                                itemBuilder: (c, dp) => Row(
                                      spacing: Dimensions.padding_10,
                                      children: [
                                        Column(
                                          children: [
                                            SizedBox(
                                              height: Dimensions.padding_15,
                                              child: Visibility(
                                                visible: dp != 0,
                                                child: VerticalDivider(
                                                  color: vm
                                                              .filteredTrackTicketsList[
                                                                  p]
                                                              .ticketsNotes?[dp]
                                                              .isSelected ==
                                                          true
                                                      ? CustomColors
                                                          .primaryColor
                                                      : CustomColors.clr_AAAAAA,
                                                ),
                                              ),
                                            ),
                                            SvgPicture.asset(vm
                                                        .filteredTrackTicketsList[
                                                            p]
                                                        .ticketsNotes?[dp]
                                                        .isSelected ==
                                                    true
                                                ? CustomImages
                                                    .checkedDisputeStatus
                                                : CustomImages
                                                    .unCheckedDisputeStatus),
                                            SizedBox(
                                              height: Dimensions.padding_15,
                                              child: Visibility(
                                                visible: dp !=
                                                    vm.filteredTrackTicketsList[p]
                                                            .ticketsNotes!.length -
                                                        1,
                                                child: VerticalDivider(
                                                  color: vm
                                                              .filteredTrackTicketsList[
                                                                  p]
                                                              .ticketsNotes?[dp]
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
                                            child: Text(
                                          vm.filteredTrackTicketsList[p]
                                                  .ticketsNotes?[dp].name ??
                                              "",
                                          style: Theme.of(context)
                                              .textTheme
                                              .labelSmall
                                              ?.copyWith(
                                                  color:
                                                      CustomColors.clr_AAAAAA,
                                                  fontSize:
                                                      Dimensions.padding_13),
                                        ))
                                      ],
                                    ),
                                itemCount: vm.filteredTrackTicketsList[p]
                                    .ticketsNotes?.length),
                          )
                        ],
                      ),
                    ),
                  ),
                )
              : Center(
                  child: vm.isTrackTicketsDataEmpty
                      ? Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SvgPicture.asset(
                              CustomImages.notificationNotFound,
                            ),
                            Center(
                              child:
                                  Text(vm.translation.txt_no_data_found ?? ""),
                            ),
                          ],
                        )
                      : const CircularProgressIndicator(
                          strokeWidth: 3,
                        ),
                ),
        ),
      );

  @override
  void dispose() {
    vm.isDisposed = true;
    super.dispose();
  }
}
