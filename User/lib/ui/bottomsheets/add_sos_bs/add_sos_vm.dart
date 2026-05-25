import 'dart:convert';

import 'package:flutter/cupertino.dart';
import '../../../main.dart';
import '../../../modeldata/app_enum.dart';
import '../../../network/response_models/config_model.dart';
import '../../../network/response_models/country_model.dart';
import '../../../network/response_models/sos_model.dart';
import '../../../utils/base_vm.dart';
import '../../../utils/preference_helper.dart';

class AddSosVm extends BaseVm {
  final TextEditingController countryCodeController = TextEditingController();
  final TextEditingController sosNameController = TextEditingController();
  final TextEditingController sosPhoneController = TextEditingController();
  CountryModel? country;
  List<SOSModel> sosList = [];
  String sosNameError = "";
  String sosPhoneError = "";
  bool isAvailable = false;

  AddSosVm() {
    final data = preference.getString(PreferenceHelper.countryList) ?? "";
    if (data.isNotEmpty) {
      final response = jsonDecode(data);
      var jsonString = jsonDecode(json.encode(response));
      final countryList = List<CountryModel>.from(
          jsonString.map((model) => CountryModel.fromJson(model)));
      final rawConfig = preference.getString(PreferenceHelper.config);
      if (rawConfig != null && rawConfig.isNotEmpty == true) {
        final config = ConfigModel.fromJson(jsonDecode(rawConfig));
        String countryCode = "";
        config.settings?.forEach((settings) {
          if (settings.name == SettingsEnum.general.name) {
            countryCode = settings.settings?.defaultCountry ?? "";
          }
        });
        for (var country in countryList) {
          if (country.id == countryCode) {
            this.country = country;
            countryCodeController.text = country.dialCode ?? "";
          }
        }
      }
    }
  }

  bool sosValidate() {
    bool isValid = true;
    // Name validation
    final name = sosNameController.text.trim();
    if (name.isEmpty || name.length < 2) {
      sosNameError = translation.txt_name;
      isValid = false;
    } else if (validateName(name) != null) {
      sosNameError = validateName(name)!;
      isValid = false;
    } else {
      sosNameError = "";
    }
    // Phone validation
    final phone = sosPhoneController.text.trim();
    if (phone.isEmpty) {
      sosPhoneError = translation.txt_Phone_number_required;
      isValid = false;
    } else if (!validateSosPhoneNumberLength(phone)) {
      sosPhoneError = translation.txt_Phone_number_invalid;
      isValid = false;
    } else if (_isRepeated(phone)) {
      sosPhoneError = translation.txt_Phone_number_required;
      isValid = false;
    } else {
      sosPhoneError = "";
    }
    // Country code validation
    final countryCode = country?.id ?? countryCodeController.text.trim();
    if (countryCode.isEmpty) {
      isValid = false;
    }

    return isValid;
  }

  bool _isRepeated(String phone) {
    // All digits same (1111111111)
    if (RegExp(r'^(\d)\1+$').hasMatch(phone)) return true;
    // Too many consecutive repeats (7777)
    if (RegExp(r'(\d)\1{3,}').hasMatch(phone)) return true;
    // Sequential numbers (1234567890 / 9876543210)
    if (_isSequential(phone)) return true;
    return false;
  }

  bool _isSequential(String number) {
    const asc = "0123456789";
    const desc = "9876543210";
    return asc.contains(number) || desc.contains(number);
  }

  String? validateName(String? name) {
    if (name == null || name.trim().isEmpty) {
      return translation.txt_SOS_Name;
    }

    final text = name.trim().toLowerCase();

    // Only letters and spaces allowed
    if (!RegExp(r'^[a-z\s]+$').hasMatch(text)) {
      return translation.txt_please_avoid_meaningless_symbols;
    }

    // Split words
    final words = text.split(RegExp(r'\s+'));

    // At least 1 word required
    if (words.isEmpty) {
      return translation.txt_Name_invalid;
    }

    int meaningfulWords = 0;
    int junkWords = 0;

    for (String word in words) {
      if (word.trim().isEmpty) continue;

      // Minimum 2 letters
      if (word.length < 2) {
        junkWords++;
        continue;
      }

      // Must contain vowel
      if (!RegExp(r'[aeiou]').hasMatch(word)) {
        junkWords++;
        continue;
      }

      // Reject repeated chars like aaaa / hhhh
      if (RegExp(r'(.)\1{2,}').hasMatch(word)) {
        junkWords++;
        continue;
      }

      // Reject random keyboard words
      if (RegExp(
        r'^(ghj|hgj|jhg|dfg|kjh|asd|qwe|zxc|poi|lkj)',
        caseSensitive: false,
      ).hasMatch(word)) {
        junkWords++;
        continue;
      }

      meaningfulWords++;
    }

    // Need at least 1 meaningful word
    if (meaningfulWords < 1) {
      return translation.txt_please_enter_meaningful_text;
    }

    // If junk words more than meaningful words → reject
    if (junkWords >= meaningfulWords) {
      return translation.txt_please_enter_meaningful_text;
    }

    // Max length
    if (text.length > 50) {
      return translation.txt_Name_invalid;
    }

    return null;
  }
  bool validateSosPhoneNumberLength(String phone) {
    if (country == null) return false;
    final int maxLen = int.tryParse(country!.phoneNumberLength.toString()) ?? 0;
    return phone.length == maxLen;
  }

  void sosPhoneChanged(String value) {
    if (value.isEmpty) {
      sosPhoneError = translation.txt_Phone_number_required;
    } else if (!validateSosPhoneNumberLength(value)) {
      sosPhoneError = translation.txt_Phone_number_invalid;
    } else {
      sosPhoneError = "";
      if (country != null &&
          value.length == int.parse(country!.phoneNumberLength.toString())) {
        FocusManager.instance.primaryFocus?.unfocus();
      }
    }
  }
}
