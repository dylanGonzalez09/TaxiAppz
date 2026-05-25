import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../utils/dimensions.dart';

class GalleryImageView extends StatefulWidget {
  final Future<Uint8List?> future;
  final File? path;
  final Function(File) onSelected;

  const GalleryImageView({super.key, required this.future, required this.path, required this.onSelected});

  @override
  _GalleryImageViewState createState() => _GalleryImageViewState();
}

class _GalleryImageViewState extends State<GalleryImageView> {

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Uint8List?>(
      future: widget.future,
      builder: (BuildContext context, AsyncSnapshot<Uint8List?> snapshot) {
        if (snapshot.connectionState == ConnectionState.done) {
          return Stack(
            children: [
              Positioned.fill(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(Dimensions.padding_2),
                  child: snapshot.data != null
                      ? InkWell(
                    onTap: () {
                      if (widget.path != null) {
                        widget.onSelected(widget.path!);
                      }
                    },
                    child: Image.memory(
                      snapshot.data!,
                      fit: BoxFit.cover,
                    ),
                  )
                      : const SizedBox(),
                ),
              ),
            ],
          );
        }
        return const SizedBox();
      },
    );
  }
}

