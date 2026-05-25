import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:user/ui/bottomsheets/right_confirm_bs/right_confirm_vm.dart';

import '../../../components/proceed_button.dart';
import '../../../utils/theme_data.dart';
import '../fare_details/fare_details_bs_vm.dart';

import '../../../utils/app_constants.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';
import '../../../utils/custom_router.dart';
import '../../../utils/dimensions.dart';


class RightConfirmBs extends StatefulWidget {
  const RightConfirmBs({super.key});

  @override
  _RightConfirmBs createState() => _RightConfirmBs();
}

class _RightConfirmBs extends State<RightConfirmBs> {
  final vm = RightConfirmVm();
  final vm1 = FareDetailsBsVm();
  final List<String> vehicleName = ['Auto', 'Car', 'Mini','Auto','Auto', 'Car', 'Mini','Auto','Auto', 'Car', 'Mini','Auto',];
  List<int> selectedIndices = [];
  final _sheet = GlobalKey();
  final _controller = DraggableScrollableController();

  @override
  Widget build(BuildContext context) {
    return  DraggableScrollableSheet(
      key: _sheet,
      initialChildSize: 0.7,
      maxChildSize: 1.0,
      expand: false,
      shouldCloseOnMinExtent: true,
      snap: false,
      snapSizes: const [0.7],
      controller: _controller,
      builder: (BuildContext context, ScrollController scrollController) {
        return  PopScope(
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Padding(
                  padding: const EdgeInsets.only(left: 15, right: 15, top: 15, bottom: 15),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      Expanded(
                        flex: 3,
                        child: Container(
                          decoration: const BoxDecoration(
                            borderRadius: BorderRadius.all(Radius.circular(10)),
                            color: Colors.white,
                            boxShadow: [
                              BoxShadow(
                                color: CustomColors.textPlaceholderClr,
                                blurRadius: 2.6,
                                spreadRadius: 0.8,
                                offset: Offset(0, 0),
                              ),
                            ],
                          ),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                            child: Column(
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.start,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Padding(
                                      padding: const EdgeInsets.only(top: 5),
                                      child: SvgPicture.asset(
                                        CustomImages.locationDot,
                                        width: Dimensions.padding_12,
                                        height: Dimensions.padding_12,
                                        colorFilter: const ColorFilter.mode(Colors.green, BlendMode.srcIn),
                                      ),
                                    ),
                                    const SizedBox(width: 5),
                                    Expanded(
                                      child: Stack(
                                        children: [
                                          Padding(
                                            padding: const EdgeInsets.only(right: 15),
                                            child: Text(
                                              '17/40, Coimbatore, Tamil Nadu yyyyyyyyyxxxxxxxxxxxxxxxxxx 641043...',
                                              maxLines: 2,
                                                style: Theme.of(context)
                                                    .textTheme
                                                    .bodySmall
                                                    ?.copyWith(
                                                  fontSize: 15,
                                                  overflow: TextOverflow.ellipsis,
                                                )
                                            ),
                                          ),
                                          Positioned(
                                            bottom: 2,
                                            right: 0,
                                            child: InkWell(
                                              onTap: () {

                                              },
                                              child: SvgPicture.asset(
                                                CustomImages.pencilIcon,
                                                width: 12,
                                                height: 12,
                                                colorFilter: const ColorFilter.mode(
                                                  CustomColors.shadeBlack,
                                                  BlendMode.srcIn,
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Container(
                        height: 56,
                        decoration: const BoxDecoration(
                          borderRadius: BorderRadius.all(Radius.circular(10)),
                          color: Colors.white,
                          boxShadow: [
                            BoxShadow(
                              color: CustomColors.textPlaceholderClr,
                              blurRadius: 2.3,
                              spreadRadius: 0.8,
                              offset: Offset(0, 0),
                            ),
                          ],
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SvgPicture.asset(
                              CustomImages.calendarIcon,
                              width: 14,
                              height: 16,
                              colorFilter: const ColorFilter.mode(
                                CustomColors.shadeBlack,
                                BlendMode.srcIn,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Padding(
                              padding: const EdgeInsets.only(left: 6,right: 6),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  const SizedBox(width: 5,),
                                  const Text(
                                    'Now',
                                    style: TextStyle(
                                      color: Colors.black,
                                      fontSize: 14,
                                      fontFamily: AppConstants.latoFont,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                  const SizedBox(width: 4,),
                                  SvgPicture.asset(
                                    CustomImages.dropDownIcon,
                                    width: 12,
                                    height: 6,
                                    colorFilter:  const ColorFilter.mode(
                                        CustomColors.shadeBlack, BlendMode.srcIn),
                                  ),

                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                ),
                Padding(
                  padding: const EdgeInsets.only(
                      left: 20, right: 20),
                  child: Text('Select  Package',
                      style: Theme.of(context)
                          .textTheme
                          .bodySmall
                          ?.copyWith(
                        fontSize: 15,
                        overflow: TextOverflow.ellipsis,
                      )
                  ),
                ),
                const SizedBox(
                  height: 10,
                ),
                Row(
                  mainAxisAlignment:
                  MainAxisAlignment
                      .spaceEvenly,
                  children: [
                    InkWell(
                      onTap: () {
                        vm.decreaseHour();
                      },
                      child: Container(
                        width: 40,
                        height: 40,
                        alignment:
                        Alignment.center,
                        child: SizedBox(
                          width: 20,
                          height: 20,
                          child:
                          SvgPicture.asset(
                            CustomImages
                                .minusIcon,
                            colorFilter:
                            const ColorFilter
                                .mode(
                              CustomColors
                                  .shadeBlack,
                              BlendMode.srcIn,
                            ),
                          ),
                        ),
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          '${vm.hourPackage} Hours',
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(
                              fontSize: 20,
                              overflow: TextOverflow.ellipsis,
                            )
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${vm.distanceCount} KM',
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(
                              fontSize: 15,
                              overflow: TextOverflow.ellipsis,
                            )
                        ),
                      ],
                    ),
                    InkWell(
                      onTap: () {
                        vm.increaseHour();
                      },
                      child: Container(
                        width: 40,
                        height: 40,
                        alignment:
                        Alignment.center,
                        child: SizedBox(
                          width: 20,
                          height: 20,
                          child:
                          SvgPicture.asset(
                            CustomImages
                                .plusIcon,
                            colorFilter:
                            const ColorFilter
                                .mode(
                              CustomColors
                                  .shadeBlack,
                              BlendMode.srcIn,
                            ),
                          ),
                        ),
                      ),
                    )
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 2,horizontal: 25),
                  child: Column(
                    children: [
                      SizedBox(
                        height: MediaQuery.of(context).size.height * 0.3,
                        child: ListView.builder(
                          shrinkWrap: true,
                          controller: scrollController,
                          itemCount: vehicleName.length,
                          padding: EdgeInsets.zero,
                          itemBuilder: (context, index) {
                            selectedIndices.contains(index);
                            return InkWell(
                              onTap: (){
                               // vm1.showFareDetails();
                              },
                              child: Stack(
                                children: [
                                  Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Padding(
                                        padding: const EdgeInsets.only(top: 20),
                                        child: SvgPicture.asset(
                                          CustomImages
                                              .autoImage,
                                        ),
                                      ),
                                      const SizedBox(width: 20),
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          SizedBox(
                                            width: 60,
                                            child: Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              children: [
                                                Padding(
                                                  padding: const EdgeInsets.only(top: 15),
                                                  child: Text(
                                                    vehicleName[index],
                                                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                                        color: Colors.black, fontSize: 15,fontWeight: FontWeight.w600
                                                    ),
                                                  ),
                                                ),
                                                SvgPicture.asset(
                                                  CustomImages
                                                      .infoVehicleImage,
                                                ),
                                              ],
                                            ),
                                          ),
                                          Text(
                                            '15 min',
                                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                                color: Colors.black, fontSize: 12,fontWeight: FontWeight.w400
                                            ),
                                          ),
                                        ],
                                      ),
                                      const Spacer(),
                                      Padding(
                                        padding: const EdgeInsets.only(top: 22),
                                        child: Text(
                                          '\$ 256',
                                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                              color: Colors.black, fontSize: Dimensions.padding_15,fontWeight: FontWeight.w400
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 10,),
                      const Divider(height: 20, color: CustomColors.clr_AAAAAA, thickness: 0.5),
                      IntrinsicHeight(
                        child: Row(
                          children: [
                            Expanded(
                                child: Center(
                                  child: Padding(
                                    padding: const EdgeInsets.only(
                                        left: 15, right: 20),
                                    child: Column(
                                      children: [
                                        Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            SvgPicture.asset(
                                              CustomImages.cashImage,
                                              height: 14,
                                              width: 20,
                                            ),
                                            const SizedBox(
                                                width: Dimensions.padding_7),
                                            Text("Payment",
                                                style:themeData.textTheme.labelSmall),
                                            const Expanded(child: Icon(Icons.arrow_drop_down,size: 30,))
                                          ],
                                        ),
                                        Text("Cash",
                                            style:themeData.textTheme.labelSmall?.copyWith(
                                                fontSize: 12,color: CustomColors.clr_FE0000
                                            ))
                                      ],
                                    ),
                                  ),
                                )),
                            Container(
                                width: 0.5,
                                color: CustomColors.clr_AAAAAA),
                            Expanded(
                                child: Center(
                                  child: Padding(
                                    padding: const EdgeInsets.only(left: 10, right: 5),
                                    child: InkWell(
                                      onTap: (){
                                        vm.moveAndWait(CustomRouter.applyPromoScreen);
                                      },
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          SvgPicture.asset(
                                              CustomImages.promoImage,
                                              height: 14,
                                              width: 20),
                                          const SizedBox(
                                              width: Dimensions.padding_5),
                                          Text("Apply Promo",
                                              style:themeData.textTheme.labelSmall),
                                          const Expanded(child: Icon(Icons.arrow_drop_down,size: 30,))

                                        ],
                                      ),
                                    ),
                                  ),
                                )),
                          ],
                        ),
                      ),
                      const SizedBox(
                          height: Dimensions.padding_5),
                      ProceedButton(btnTxt: "Book", onPressed: () {
                        vm.moveToNamed(CustomRouter.tripScreen);
                      },),
                      const SizedBox(
                          height: Dimensions.padding_20),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
      );




  }
}
