import 'package:taxiappzpro/network/response_models/advertisement_model.dart';
import 'package:taxiappzpro/utils/custom_colors.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../utils/app_constants.dart';
import '../utils/custom_images.dart';

class DriverBlockScreen extends StatefulWidget {
  final AdvertisementModel? args;
  const DriverBlockScreen({super.key, this.args});

  @override
  State<DriverBlockScreen> createState() => _DriverBlockScreenState();
}

class _DriverBlockScreenState extends State<DriverBlockScreen> {
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
                        "${widget.args?.title}",
                        style: const TextStyle(color: Colors.white),
                      ),
                    ),
                    const SizedBox(height: 5),
                    Expanded(
                      child: Image.network(
                        "${AppConstants.imageBaseUrl}${widget.args?.image}",
                        fit: BoxFit.cover,
                        height: MediaQuery.of(context).size.height / 2,
                        width: MediaQuery.of(context).size.width,

                        // Loader while image is loading
                        loadingBuilder: (context, child, loadingProgress) {
                          if (loadingProgress == null) {
                            // Image loaded successfully
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

              // Show cancel button only after image load/error
              if (isImageLoaded && widget.args?.isPermanent == "temporary")
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

