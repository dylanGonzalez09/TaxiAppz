import 'package:flutter/material.dart';
import 'app_constants.dart';
import 'custom_colors.dart';
import 'dimensions.dart';
import 'material_color_generator.dart';

final themeData = ThemeData(
    primaryColor: CustomColors.primaryColor,
    colorScheme: ColorScheme.fromSwatch(
        primarySwatch: MaterialColorGenerator.from(CustomColors.primaryColor),
        brightness: Brightness.light),
    scaffoldBackgroundColor: Colors.white,
    drawerTheme: const DrawerThemeData(
        backgroundColor: Colors.white, shape: RoundedRectangleBorder()),
    textTheme: const TextTheme(
        titleLarge: TextStyle(
            color: Colors.black,
            fontFamily: AppConstants.latoFont,
            fontWeight: FontWeight.w700,
            fontSize: 20),
        titleMedium: TextStyle(
            color: CustomColors.bodyTextColor,
            fontFamily: AppConstants.latoFont,
            fontWeight: FontWeight.w600,
            fontSize: 20),
        titleSmall: TextStyle(
            color: Colors.black,
            fontFamily: AppConstants.latoFont,
            fontWeight: FontWeight.w500,
            fontSize: 20),
        bodyLarge: TextStyle(
            color: CustomColors.bodyTextColor,
            fontFamily: AppConstants.latoFont,
            fontSize: 18,
            fontWeight: FontWeight.w700),
        bodyMedium: TextStyle(
            color: Colors.black,
            fontFamily: AppConstants.latoFont,
            fontSize: 18,
            fontWeight: FontWeight.w600),
        bodySmall: TextStyle(
            color: Colors.black,
            fontFamily: AppConstants.latoFont,
            fontSize: 18,
            fontWeight: FontWeight.w500),
        labelLarge: TextStyle(
            color: Colors.black,
            fontFamily: AppConstants.latoFont,
            fontSize: 16,
            fontWeight: FontWeight.w600),
        labelSmall: TextStyle(
            color: Colors.black,
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
    dialogTheme: DialogThemeData(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(Dimensions.padding_10))),
    progressIndicatorTheme:
        const ProgressIndicatorThemeData(color: CustomColors.primaryColor),
    datePickerTheme: DatePickerThemeData(
      backgroundColor: Colors.white,
      dayStyle: const TextStyle(
          color: Colors.black,
          fontFamily: AppConstants.latoFont,
          fontSize: 14,
          fontWeight: FontWeight.w500),
      elevation: 10,
      weekdayStyle: const TextStyle(
          color: Colors.black,
          fontFamily: AppConstants.latoFont,
          fontSize: 16,
          fontWeight: FontWeight.w700),
      yearStyle: const TextStyle(
          color: Colors.black,
          fontFamily: AppConstants.latoFont,
          fontSize: 16,
          fontWeight: FontWeight.w700),
      cancelButtonStyle: ButtonStyle(
          foregroundColor: WidgetStateProperty.all(Colors.black),
          textStyle: WidgetStateProperty.all(const TextStyle(
              color: Colors.black,
              fontFamily: AppConstants.latoFont,
              fontSize: 16,
              fontWeight: FontWeight.w600))),
      confirmButtonStyle: ButtonStyle(
          foregroundColor: WidgetStateProperty.all(Colors.black),
          textStyle: WidgetStateProperty.all(const TextStyle(
              color: Colors.black,
              fontFamily: AppConstants.latoFont,
              fontSize: 16,
              fontWeight: FontWeight.w600))),
      dayForegroundColor: WidgetStateProperty.resolveWith((state) {
        if (state.contains(WidgetState.disabled)) {
          return CustomColors.clr_888888;
        }
        if (state.contains(WidgetState.selected)) {
          return Colors.white;
        }
        return Colors.black;
      }),
      todayForegroundColor: WidgetStateProperty.resolveWith((state) {
        if (state.contains(WidgetState.selected)) {
          return Colors.white;
        }
        return Colors.black;
      }),
      headerForegroundColor: Colors.white,
      //dayBackgroundColor: WidgetStateProperty.all(Colors.white),
      //todayForegroundColor: WidgetStateProperty.all(Colors.black),
      headerBackgroundColor: CustomColors.primaryColor,
      headerHeadlineStyle: const TextStyle(
          color: Colors.black,
          fontFamily: AppConstants.latoFont,
          fontWeight: FontWeight.w700,
          fontSize: 24),
      headerHelpStyle: const TextStyle(
          color: Colors.black,
          fontFamily: AppConstants.latoFont,
          fontWeight: FontWeight.w700,
          fontSize: 18),
    ));
