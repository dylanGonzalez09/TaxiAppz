import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import '../../../utils/dimensions.dart';
import '../destination_vm.dart';

import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';

class RecentView extends StatelessWidget {
  final DestinationVm vm;

  const RecentView({super.key, required this.vm});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: Dimensions.padding_15),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(vm.translation.txt_Recent,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                fontSize: 18,
              )),
          const SizedBox(height: Dimensions.padding_10),
          Container(
              decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(10),
                  color: Colors.white,
                  border: Border.all(
                      color: CustomColors.textPlaceholderClr, width: 1)),
              padding: const EdgeInsets.symmetric(
                  horizontal: Dimensions.padding_10,
                  vertical: Dimensions.padding_12),
              child: ListView.separated(
                shrinkWrap: true,
                itemCount: vm.recent.length > 2 ? 2 : vm.recent.length,
                physics: const NeverScrollableScrollPhysics(),
                itemBuilder: (context, index) {
                  final recent = vm.recent[index];
                  final isFavorite = vm.favourites.any((favourite) => favourite.address == recent.dropAddress);
                  return InkWell(
                    onTap: () {
                      vm.onRecentSelected(vm.recent[index]);
                    },
                    child: Row(
                      children: [
                        const Icon(
                          Icons.history_outlined,
                          color: CustomColors.textPlaceholderClr,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                              vm.recent[index].dropAddress ?? "",
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(
                                fontSize: 15,
                              )),
                        ),
                        InkWell(
                          onTap: () {
                            vm.addFavorite(vm.recent[index]);
                          },
                          child: SvgPicture.asset(
                            CustomImages.heartIcon,
                            width: 15,
                            height: 15,
                            colorFilter: ColorFilter.mode(
                                isFavorite ? CustomColors.primaryColor : CustomColors.textPlaceholderClr,
                                BlendMode.srcIn),
                          ),
                        ),
                      ],
                    ),
                  );
                },
                separatorBuilder: (BuildContext context, int index) {
                  return Container(
                    margin: const EdgeInsets.symmetric(
                        vertical: Dimensions.padding_10),
                    height: 0.7,
                    color: CustomColors.clr_AAAAAA,
                  );
                },
              ))
        ],
      ),
    );
  }
}