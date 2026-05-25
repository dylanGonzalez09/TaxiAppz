import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import '../utils/dimensions.dart';

class DashboardDescription extends StatelessWidget {
  final String header;
  final String? picture;
  final String descOne;
  final String descTwo;
  final String valueOne;
  final String valueTwo;
  final TextStyle? descOneTextStyle;
  final TextStyle? descTwoTextStyle;

  const DashboardDescription(
      {super.key,
      required this.header,
      this.picture,
      required this.descOne,
      required this.descTwo,
      required this.valueOne,
      required this.valueTwo,
      this.descOneTextStyle,
      this.descTwoTextStyle});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(Dimensions.padding_10),
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: Colors.grey,
            blurRadius: 2,
            spreadRadius: 0.5,
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                  child: Text(
                header,
                style: Theme.of(context).textTheme.bodyMedium,
                overflow: TextOverflow.ellipsis,
              )),
              const SizedBox(height: Dimensions.padding_5),
              if (picture != null) SvgPicture.asset(picture!)
            ],
          ),
          const SizedBox(height: Dimensions.padding_16),
          Row(
            children: [
              Expanded(
                  child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    descOne,
                    style:descOneTextStyle?? Theme.of(context)
                        .textTheme
                        .bodySmall
                        ?.copyWith(fontSize: 13),
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: Dimensions.padding_5),
                  Text(valueOne,
                      style: Theme.of(context).textTheme.bodySmall,
                      overflow: TextOverflow.ellipsis)
                ],
              )),
              const SizedBox(width: Dimensions.padding_5),
              Expanded(
                  child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    descTwo,
                    style: Theme.of(context)
                        .textTheme
                        .bodySmall
                        ?.copyWith(fontSize: 13),
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: Dimensions.padding_5),
                  Text(valueTwo,
                      style: Theme.of(context)
                          .textTheme
                          .bodySmall
                          ?.copyWith(fontSize: 18),
                      overflow: TextOverflow.ellipsis)
                ],
              ))
            ],
          ),
        ],
      ),
    );
  }
}
