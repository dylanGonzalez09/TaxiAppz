import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';
import '../../../utils/dimensions.dart';
import '../rental_vm.dart';

class SliderViewRental extends StatelessWidget {
  final RentalVm vm;
  const SliderViewRental({super.key, required this.vm});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 20, right: 20),
            child: Text(vm.translation.txt_select_package,
                style: Theme
                    .of(context)
                    .textTheme
                    .bodySmall
                    ?.copyWith(
                  fontSize: 15,
                  overflow: TextOverflow.ellipsis,
                )),
          ),
          const SizedBox(
            height: Dimensions.padding_10,
          ),
          Row(
            mainAxisAlignment:
            MainAxisAlignment
                .spaceEvenly,
            children: [
              InkWell(
                onTap: () {
                  vm.decrementHours();
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
                    '${vm.selectedPackage?.hour?.toString() ?? ""} ${vm.translation.txt_hours}',
                    style: const TextStyle(
                        fontSize: 20,
                        fontWeight:
                        FontWeight
                            .bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${vm.selectedPackage?.km ?? ""} ${vm.translation.txt_km}',
                    style: const TextStyle(
                        fontSize: 15,
                        color: CustomColors
                            .clr_000000),
                  ),
                ],
              ),
              InkWell(
                onTap: () {
                  vm.incrementHours();
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
          // Padding(
          //     padding: const EdgeInsets.only(left: 20, right: 20, top: 18, bottom: 14),
          //     child: SliderTheme(
          //       data: SliderTheme.of(context).copyWith(
          //         trackHeight: 8,
          //         thumbShape: CustomSliderThumbShape(thumbRadius: 16.0),
          //         overlayShape: const RoundSliderOverlayShape(overlayRadius: 0.0),
          //       ),
          //       child: Slider(
          //         inactiveColor: CustomColors.shadeBlack,
          //         activeColor: CustomColors.primaryColor,
          //         label: "",
          //         value:( vm.selectedPackage?.km ?? 0).toDouble(),
          //         onChanged: (value) {
          //           print("dhgjhgjhgjhgf ${value}");
          //           vm.updateKmBySlider(value);
          //         },
          //         min: vm.minKm.toDouble(),
          //         max: vm.maxKm.toDouble(),
          //       ),
          //     )
          // ),
        ],
      ),
    );
  }
}
