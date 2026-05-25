import 'package:flutter/material.dart';
import 'package:taxiappzpro/ui/map/map_vm.dart';

import '../../../utils/custom_colors.dart';

class OfflineAllert extends StatelessWidget {
  final MapVm vm;
  const OfflineAllert({super.key, required this.vm});

  @override
  Widget build(BuildContext context) {
    return vm.isOnline
        ? const SizedBox()
        : Positioned(
            top: 90, // Adjust these values to position as needed
            left: 0,
            right: 0,
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 30),
              decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: const [
                    BoxShadow(
                      color: CustomColors.clr_FF8F8F,
                      blurRadius: 6,
                      spreadRadius: 2,
                    ),
                  ],
                  borderRadius: BorderRadius.circular(10)),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(vertical: 10, horizontal: 20),
                width: double.infinity,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      vm.translation.txtYouAreOffline,
                      style: Theme.of(context)
                          .textTheme
                          .titleLarge
                          ?.copyWith(fontSize: 18),
                    ),
                    const SizedBox(
                      height: 5,
                    ),
                    Text(
                      vm.translation.txtGoOnlineToEarnMoney,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          fontSize: 14, color: CustomColors.clr_303030),
                    )
                  ],
                ),
              ),
            ),
          );
  }
}
