import 'package:flutter/material.dart';
import 'package:taxiappzpro/utils/utils.dart';

// class MaterialColorGenerator {
//   static MaterialColor from(Color color) {
//     return MaterialColor(color.value, <int, Color>{
//       50: color.withOpacity(0.1),
//       100: color.withOpacity(0.2),
//       200: color.withOpacity(0.3),
//       300: color.withOpacity(0.4),
//       400: color.withOpacity(0.5),
//       500: color.withOpacity(0.6),
//       600: color.withOpacity(0.7),
//       700: color.withOpacity(0.8),
//       800: color.withOpacity(0.9),
//       900: color.withOpacity(1.0),
//     });
//   }
// }

class MaterialColorGenerator {
  static MaterialColor from(Color color) {
    return MaterialColor(Utils.colorToInt(color), <int, Color>{
      50: color.withValues(alpha: 0.1),
      100: color.withValues(alpha: 0.2),
      200: color.withValues(alpha: 0.3),
      300: color.withValues(alpha: 0.4),
      400: color.withValues(alpha: 0.5),
      500: color.withValues(alpha: 0.6),
      600: color.withValues(alpha: 0.7),
      700: color.withValues(alpha: 0.8),
      800: color.withValues(alpha: 0.9),
      900: color.withValues(alpha: 1.0),
    });
  }
}
