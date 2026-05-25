import 'dart:io';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:photo_manager/photo_manager.dart';


import '../../../components/gallery_image_view.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/dimensions.dart';

class ImageSelectorBs extends StatefulWidget {
  final List<Widget> images;
  final int pageCount;
  final List<AssetPathEntity> paths;
  final int currentPathIndex;

  const ImageSelectorBs(
      {super.key,
      required this.images,
      required this.pageCount,
      required this.paths,
      required this.currentPathIndex});

  @override
  State<ImageSelectorBs> createState() => _ImageSelectorBsState();
}

class _ImageSelectorBsState extends State<ImageSelectorBs> {
  int pageCount = 0;
  int currentPathIndex = 0;
  final List<Widget> images = [];
  bool isListenerAdded = false;
  bool isLoading = false;
  bool isLastPage = false;

  @override
  void initState() {
    images.addAll(widget.images);
    pageCount = widget.pageCount;
    currentPathIndex = widget.currentPathIndex;
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.5,
      minChildSize: 0.3,
      maxChildSize: 0.9,
      expand: false,
      builder: (_, controller) {
        if (!isListenerAdded) {
          controller.addListener(() {
            isListenerAdded = true;
            handlePagination(controller);
          });
        }
        return ClipRRect(
          borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(Dimensions.padding_20)),
          child: Padding(
            padding: const EdgeInsets.symmetric(
                vertical: Dimensions.padding_15,
                horizontal: Dimensions.padding_15),
            child: Column(
              children: <Widget>[
                Container(
                  height: 3,
                  width: 120,
                  decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(10),
                      color: CustomColors.clr_ADADAD),
                ),
                const SizedBox(
                  height: Dimensions.padding_15,
                ),
                Expanded(
                  child: GridView.builder(
                    shrinkWrap: true,
                    controller: controller,
                    itemCount: images.length,
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 3,
                            crossAxisSpacing: 5,
                            mainAxisSpacing: 5,
                            childAspectRatio: 0.8),
                    itemBuilder: (_, index) {
                      return images[index];
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void handlePagination(ScrollController controller) async {
    if (controller.position.pixels >=
        controller.position.maxScrollExtent - 100) {
      isLoading = true;
      if (currentPathIndex <= widget.paths.length) {
        pageCount += 1;
        List<AssetEntity> media = await widget.paths[currentPathIndex]
            .getAssetListPaged(size: 60, page: pageCount);
        if (media.isEmpty) {
          pageCount = 0;
          currentPathIndex += 1;
          media = await widget.paths[currentPathIndex]
              .getAssetListPaged(size: 60, page: pageCount);
        }
        List<Widget> temp = [];
        for (var i in media) {
          temp.add(GalleryImageView(
            future: i.thumbnailDataWithSize(const ThumbnailSize(200, 200),
                format: ThumbnailFormat.jpeg),
            path:await i.file,
            onSelected: onItemSelected,
          ));
        }
        setState(() {
          images.addAll(temp);
        });

        isLoading = false;
      }
    }
  }

  void onItemSelected(File image) {
    GoRouter.of(context).pop(image);
  }
}
