import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../../../components/custom_shape.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';
import '../../../utils/dimensions.dart';
import '../map_vm.dart';

class SliderView extends StatelessWidget {
  final MapVm vm;
  const SliderView({super.key, required this.vm});

  @override
  Widget build(BuildContext context) {
    if (vm.rentalPackages.isNotEmpty && vm.selectedPackage == null) {
      vm.selectedPackage = vm.rentalPackages.first;
      vm.selectedHours = vm.selectedPackage?.hour ?? 0;
      vm.selectedKm = vm.selectedPackage?.km ?? 0;
    }

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(10, 10, 10, 15),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(10),
                      color: Colors.white,
                      boxShadow: [
                        BoxShadow(
                          color: CustomColors.clr_414141.withValues(alpha: 0.2),
                          spreadRadius: 1,
                          blurRadius: 2,
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(8),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.only(top: 5),
                          child: SvgPicture.asset(
                            CustomImages.locationDot,
                            width: Dimensions.padding_12,
                            height: Dimensions.padding_12,
                            colorFilter: const ColorFilter.mode(
                                Colors.green, BlendMode.srcIn),
                          ),
                        ),
                        const SizedBox(width: 5),
                        Expanded(
                          child: Text(
                            vm.pickupLocation.isEmpty
                                ? vm.translation.txt_Pickup_location
                                : vm.pickupLocation,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: Theme.of(context)
                                .textTheme
                                .bodySmall
                                ?.copyWith(fontSize: 15),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          /// 🔹 Title
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Text(
              vm.translation.txt_select_package,
              style: Theme.of(context)
                  .textTheme
                  .bodySmall
                  ?.copyWith(fontSize: 15),
            ),
          ),

          const SizedBox(height: 10),

          if (vm.rentalPackages.isEmpty)
            const Padding(
              padding: EdgeInsets.all(20),
              child: Center(
                child: Text(
                  "No packages available",
                  style: TextStyle(fontSize: 16),
                ),
              ),
            )
          else ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                InkWell(
                  onTap: vm.decrementHours,
                  child: _iconButton(CustomImages.minusIcon),
                ),

                Column(
                  children: [
                    Text(
                      '${vm.selectedPackage?.hour ?? "--"} ${vm.translation.txt_hours}',
                      style: const TextStyle(
                          fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${vm.selectedPackage?.km ?? "--"} ${vm.translation.txt_km}',
                      style: const TextStyle(fontSize: 15),
                    ),
                  ],
                ),

                InkWell(
                  onTap: vm.incrementHours,
                  child: _iconButton(CustomImages.plusIcon),
                ),
              ],
            ),

            Padding(
              padding: const EdgeInsets.fromLTRB(20, 34, 20, 24),
              child: SliderTheme(
                data: SliderTheme.of(context).copyWith(
                  trackHeight: 8,
                  thumbShape: CustomSliderThumbShape(thumbRadius: 16.0),
                  overlayShape:
                  const RoundSliderOverlayShape(overlayRadius: 0.0),
                ),
                child: Slider(
                  inactiveColor: CustomColors.shadeBlack,
                  activeColor: CustomColors.primaryColor,

                  value: _getSafeSliderValue(),

                  min: 0,
                  max: (vm.rentalPackages.length - 1).toDouble(),

                  divisions: vm.rentalPackages.length > 1
                      ? vm.rentalPackages.length - 1
                      : 1,

                  onChanged: vm.rentalPackages.length <= 1
                      ? null
                      : (value) {
                    int index = value.round();

                    if (index >= 0 &&
                        index < vm.rentalPackages.length) {
                      vm.selectedPackage = vm.rentalPackages[index];
                      vm.selectedHours =
                          vm.selectedPackage?.hour ?? 0;
                      vm.selectedKm =
                          vm.selectedPackage?.km ?? 0;

                      vm.notifyListeners();
                    }
                  },
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  double _getSafeSliderValue() {
    if (vm.rentalPackages.isEmpty || vm.selectedPackage == null) {
      return 0;
    }

    int index = vm.rentalPackages.indexOf(vm.selectedPackage!);

    if (index < 0) return 0;

    return index.toDouble();
  }

  Widget _iconButton(String asset) {
    return SizedBox(
      width: 20,
      height: 20,
      child: SvgPicture.asset(
        asset,
        width: 10,
        height: 10,
        fit: BoxFit.contain,
        colorFilter: const ColorFilter.mode(
          CustomColors.shadeBlack,
          BlendMode.srcIn,
        ),
      ),
    );
  }
}