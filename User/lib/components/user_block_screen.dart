import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:user/utils/app_constants.dart';
import 'package:user/utils/custom_images.dart';

import '../network/response_models/advertisement_model.dart';
import '../utils/custom_colors.dart';

class UserBlockScreen extends StatefulWidget {
  final AdvertisementModel args;

  const UserBlockScreen({
    super.key, required this.args,

  });

  @override
  State<UserBlockScreen> createState() => _UserBlockScreenState();
}

class _UserBlockScreenState extends State<UserBlockScreen> {
  bool isImageLoaded = false;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: Padding(
          padding: const EdgeInsets.symmetric(vertical: 160, horizontal: 20),
          child: Stack(
            children: [
              Container(
                color: CustomColors.clr_3F3F3F,
                child: Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(top: 5),
                      child: Text(
                        "${widget.args.title}",
                        style: const TextStyle(color: Colors.white),
                      ),
                    ),
                    const SizedBox(height: 5),
                    Expanded(
                      child: Image.network(
                        "${AppConstants.imageBaseUrl}${widget.args.image}",
                        fit: BoxFit.cover,
                        height: MediaQuery.of(context).size.height / 2,
                        width: MediaQuery.of(context).size.width,

                        loadingBuilder: (context, child, loadingProgress) {
                          if (loadingProgress == null) {
                            if (!isImageLoaded) {
                              WidgetsBinding.instance.addPostFrameCallback((_) {
                                setState(() => isImageLoaded = true);
                              });
                            }
                            return child;
                          }
                          return const Center(
                            child: CircularProgressIndicator(),
                          );
                        },

                        // Fallback image on error
                        errorBuilder: (context, error, stackTrace) {
                          if (!isImageLoaded) {
                            WidgetsBinding.instance.addPostFrameCallback((_) {
                              setState(() => isImageLoaded = true);
                            });
                          }
                          return SvgPicture.asset(
                            CustomImages.dummyImage,
                            fit: BoxFit.cover,
                            height: MediaQuery.of(context).size.height,
                            width: MediaQuery.of(context).size.width,
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),

              if (isImageLoaded && widget.args.isPermanent == "temporary")
                Align(
                  alignment: Alignment.topRight,
                  child: InkWell(
                    onTap: () {
                      Navigator.of(context).pop();
                    },
                    child: Container(
                      decoration: const BoxDecoration(
                        borderRadius: BorderRadius.all(Radius.zero),
                        color: Colors.black,
                      ),
                      child: const Padding(
                        padding: EdgeInsets.all(6.0),
                        child: Icon(
                          Icons.clear,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}