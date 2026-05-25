import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:shimmer/shimmer.dart';
import '../destination_vm.dart';


import '../../../utils/custom_colors.dart';
import '../../../utils/dimensions.dart';

class FavouritesView extends StatelessWidget {
  final DestinationVm vm;

  const FavouritesView({super.key, required this.vm});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: Dimensions.padding_15),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(vm.translation.txt_Favourites,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                fontSize: 18,
              )),
          const SizedBox(height: 10),
          Container(
            decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                color: Colors.white,
                border: Border.all(
                    color: CustomColors.textPlaceholderClr, width: 1)),
            padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
            child: vm.isShimmerLoading ? ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: 10, // Number of shimmer items to display
              itemBuilder: (context, index) {
                return Shimmer.fromColors(
                  baseColor: Colors.grey,
                  highlightColor:Colors.white,
                  child: Container(
                    margin: const EdgeInsets.symmetric(
                        vertical: Dimensions.padding_5),
                    height: 25,
                    color: Colors.grey
                        .withValues(alpha: 0.2),
                  ),
                );
              },
            )
                : ListView.separated(
                shrinkWrap: true,
                itemBuilder: (context, index) {
                  return InkWell(
                    onTap: () {
                      vm.onFavouriteSelected(vm.favourites[index]);
                    },
                    child: Row(
                      children: [
                        SvgPicture.asset(
                          vm.getIcon(vm.favourites[index].type),
                          width: 15,
                          height: 14,
                          colorFilter: const ColorFilter.mode(
                              CustomColors.textPlaceholderClr,
                              BlendMode.srcIn),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(vm.favourites[index].address ?? "",
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(
                                fontSize: 15,
                              )),
                        ),
                      ],
                    ),
                  );
                },
                separatorBuilder: (context, index) {
                  return Container(
                    margin: const EdgeInsets.symmetric(
                        vertical: Dimensions.padding_10),
                    height: 0.7,
                    color: CustomColors.clr_AAAAAA,
                  );
                },
                itemCount: vm.favourites.length),
          ),
        ],
      ),
    );
  }
}