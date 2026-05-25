import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../utils/dimensions.dart';

class GalleryImageView extends StatelessWidget {
  final Future<Uint8List?> future;
  final File? path;
  final Function(File) onSelected;
  const GalleryImageView({super.key, required this.future, required this.path, required this.onSelected});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Uint8List?>(
      future: future,
      //resolution of thumbnail
      builder: (BuildContext context, AsyncSnapshot<Uint8List?> snapshot) {
        if (snapshot.connectionState == ConnectionState.done) {
          return Stack(
            children:[
              Positioned.fill(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(Dimensions.padding_2),
                  child: snapshot.data != null
                      ? InkWell(
                    onTap: (){
                      print("hellow world $path");
                      if(path != null){
                        onSelected(path!);
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
        return Container();
      },
    );
  }
}
