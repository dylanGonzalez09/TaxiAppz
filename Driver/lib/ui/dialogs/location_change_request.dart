import 'package:flutter/material.dart';
import 'package:taxiappzpro/network/response_models/translation_model.dart';

class LocationChangeRequest extends StatelessWidget {
  final TranslationModel translation;
  final String address;

  const LocationChangeRequest(
      {super.key, required this.translation, required this.address});

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20)
      ),
    );
  }
}
