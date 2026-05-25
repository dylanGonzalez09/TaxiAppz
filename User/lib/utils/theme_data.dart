import 'package:flutter/material.dart';

import 'app_constants.dart';
import 'custom_colors.dart';

ThemeData themeData = ThemeData(
    progressIndicatorTheme:
        const ProgressIndicatorThemeData(color: CustomColors.primaryColor),
    primaryColor: CustomColors.primaryColor,
    scaffoldBackgroundColor: Colors.white,
    drawerTheme: const DrawerThemeData(
        backgroundColor: Colors.white, shape: RoundedRectangleBorder()),
    textTheme: const TextTheme(
        titleLarge: TextStyle(
            overflow: TextOverflow.ellipsis,
            color: CustomColors.titleColor,
            fontFamily: AppConstants.latoFont,
            fontWeight: FontWeight.w700,
            fontSize: 20),
        titleMedium: TextStyle(
            overflow: TextOverflow.ellipsis,
            color: CustomColors.bodyTextColor,
            fontFamily: AppConstants.latoFont,
            fontWeight: FontWeight.w600,
            fontSize: 20),
        titleSmall: TextStyle(
            overflow: TextOverflow.ellipsis,
            color: CustomColors.clr_000000,
            fontFamily: AppConstants.latoFont,
            fontWeight: FontWeight.w500,
            fontSize: 20),
        bodyLarge: TextStyle(
            overflow: TextOverflow.ellipsis,
            color: Colors.black,
            fontFamily: AppConstants.latoFont,
            fontSize: 18,
            fontWeight: FontWeight.w700),
        bodyMedium: TextStyle(
            overflow: TextOverflow.ellipsis,
            color: CustomColors.clr_000000,
            fontFamily: AppConstants.latoFont,
            fontSize: 18,
            fontWeight: FontWeight.w600),
        bodySmall: TextStyle(
            overflow: TextOverflow.ellipsis,
            color: CustomColors.clr_000000,
            fontFamily: AppConstants.latoFont,
            fontSize: 18,
            fontWeight: FontWeight.w500),
        labelLarge: TextStyle(
            overflow: TextOverflow.ellipsis,
            color: CustomColors.clr_000000,
            fontFamily: AppConstants.latoFont,
            fontSize: 16,
            fontWeight: FontWeight.w700),
        labelMedium: TextStyle(
            overflow: TextOverflow.ellipsis,
            color: CustomColors.clr_000000,
            fontFamily: AppConstants.latoFont,
            fontSize: 16,
            fontWeight: FontWeight.w600),
        labelSmall: TextStyle(
            overflow: TextOverflow.ellipsis,
            color: CustomColors.clr_000000,
            fontFamily: AppConstants.latoFont,
            fontSize: 16,
            fontWeight: FontWeight.w400)),
    highlightColor: Colors.transparent,
    hoverColor: Colors.transparent,
    splashColor: Colors.transparent,
    splashFactory: NoSplash.splashFactory,
    elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
            surfaceTintColor: CustomColors.primaryColor,
            backgroundColor: CustomColors.primaryColor,
            foregroundColor: CustomColors.buttonTxtColor,
            textStyle: const TextStyle(
                color: CustomColors.buttonTxtColor,
                fontFamily: AppConstants.latoFont,
                fontWeight: FontWeight.w700,
                fontSize: 18),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(26)),
            elevation: 10,
            minimumSize: const Size(100, 38))),
    cardTheme: const CardThemeData(
        surfaceTintColor: Colors.white, color: Colors.white),
    indicatorColor: CustomColors.primaryColor,
    inputDecorationTheme: const InputDecorationTheme(
      border: InputBorder.none,
      isDense: true,
      focusedBorder: InputBorder.none,
      disabledBorder: InputBorder.none,
      errorBorder: InputBorder.none,
      enabledBorder: InputBorder.none,
      hintStyle: TextStyle(
          overflow: TextOverflow.ellipsis,
          color: CustomColors.clr_AAAAAA,
          fontFamily: AppConstants.latoFont,
          fontSize: 18,
          fontWeight: FontWeight.w500),
    ),
    textSelectionTheme: const TextSelectionThemeData(
      cursorColor: CustomColors.primaryColor,
    ),
    dialogTheme: const DialogThemeData(backgroundColor: Colors.white));
