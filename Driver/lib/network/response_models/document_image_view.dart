import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:taxiappzpro/network/response_models/documents_model.dart';
import 'package:taxiappzpro/utils/app_constants.dart';

import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../../utils/dimensions.dart';

class DocumentImageView extends StatelessWidget {
  final GetDocument document;

  const DocumentImageView({super.key, required this.document,});

  @override
  Widget build(BuildContext context) {
    return Container(
        width: double.infinity,
        height: 120,
        margin: const EdgeInsets.symmetric(horizontal: Dimensions.padding_60),
        decoration: BoxDecoration(
            color: CustomColors.clr_E9E9E9,
            borderRadius: BorderRadius.circular(Dimensions.padding_5)),
        child: document.documentImage != null &&
                document.documentImage?.isNotEmpty == true
            ? ClipRRect(
                borderRadius: BorderRadius.circular(Dimensions.padding_5),
                child: Image.network(
                    "${AppConstants.imageBaseUrl}${document.documentImage}",
                    height: 120,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                  return Center(
                    child: SizedBox(
                      height: 32,
                      child: SvgPicture.asset(
                        CustomImages.icCloud,
                      ),
                    ),
                  );
                }, loadingBuilder: (context, widget, progress) {
                  if (progress != null) {
                    return const Center(
                      child: SizedBox(
                          width: 32,
                          height: 32,
                          child: CircularProgressIndicator()),
                    );
                  }
                  return widget;
                }),
              )
            : document.imageFile == null
                ? Center(
                    child: SizedBox(
                      height: 32,
                      child: SvgPicture.asset(
                        CustomImages.icCloud,
                      ),
                    ),
                  )
                : ClipRRect(
                    borderRadius: BorderRadius.circular(Dimensions.padding_5),
                    child: Image.file(
                      document.imageFile!,
                      fit: BoxFit.cover,
                      height: 120,
                    ),
                  ));
  }
}
