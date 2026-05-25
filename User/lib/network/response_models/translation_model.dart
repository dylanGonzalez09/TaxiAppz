import 'package:json_annotation/json_annotation.dart';

part 'translation_model.g.dart';

@JsonSerializable()
class TranslationModel {
  TranslationModel();


  /*

    */

  @JsonKey(name: 'txt_no_vehicle', defaultValue: "txt_no_vehicle")
  String txt_no_vehicle = "txt_no_vehicle";



  @JsonKey(
      name: 'txt_maximum_100_characters_allowed', defaultValue: "txt_maximum_100_characters_allowed")
  String txt_maximum_100_characters_allowed = "txt_maximum_100_characters_allowed";


  @JsonKey(
      name: 'txt_please_enter_your_complaint',
      defaultValue: "txt_admin_blocked_title")
  String txt_please_enter_your_complaint = "txt_please_enter_your_complaint";

  @JsonKey(
      name: 'txt_minimum_4_characters_required',
      defaultValue: "txt_minimum_4_characters_required")
  String txt_minimum_4_characters_required = "txt_minimum_4_characters_required";

  @JsonKey(
      name: 'txt_please_enter_meaningful_text',
      defaultValue: "txt_please_enter_meaningful_text")
  String txt_please_enter_meaningful_text = "txt_please_enter_meaningful_text";
  @JsonKey(
      name: 'txt_numbers_only_not_allowed',
      defaultValue: "txt_numbers_only_not_allowed")
  String txt_numbers_only_not_allowed= "txt_numbers_only_not_allowed";
  @JsonKey(
      name: 'txt_please_enter_at_least_2_meaningful_words',
      defaultValue: "txt_please_enter_at_least_2_meaningful_words")
  String txt_please_enter_at_least_2_meaningful_words = "txt_please_enter_at_least_2_meaningful_words";

  @JsonKey(
      name: 'txt_please_avoid_meaningless_symbols',
      defaultValue: "txt_please_avoid_meaningless_symbols")
  String txt_please_avoid_meaningless_symbols = "txt_please_avoid_meaningless_symbols";










  @JsonKey(
      name: 'txt_complaint_submitted_successfully', defaultValue: "txt_complaint_submitted_successfully")
  String txt_complaint_submitted_successfully = "txt_complaint_submitted_successfully";

  @JsonKey(
      name: 'txt_Contact_with_this_name_phone_and_country_already_exists', defaultValue: "txt_Contact_with_this_name_phone_and_country_already_exists")
  String txt_Contact_with_this_name_phone_and_country_already_exists = "txt_Contact_with_this_name_phone_and_country_already_exists";

  @JsonKey(
      name: 'txt_maximum_emergency_contacts_limit_reached', defaultValue: "txt_maximum_emergency_contacts_limit_reached")
  String txt_maximum_emergency_contacts_limit_reached = "txt_maximum_emergency_contacts_limit_reached";

  @JsonKey(
      name: 'txt_contact_added_successfully', defaultValue: "txt_contact_added_successfully")
  String txt_contact_added_successfully = "txt_contact_added_successfully";


  @JsonKey(name: 'txt_joined_date', defaultValue: "txt_joined_date")
  String txt_joined_date = "txt_joined_date";

  @JsonKey(name: 'txt_pick_up_out_of_zone', defaultValue: "txt_pick_up_out_of_zone")
  String txt_pick_up_out_of_zone = "txt_pick_up_out_of_zone";

  @JsonKey(name: 'txt_welcome', defaultValue: "txt_welcome")
  String txt_welcome = "txt_welcome";

  @JsonKey(
      name: 'txt_enter_phone_number', defaultValue: "txt_enter_phone_number")
  String txt_enter_phone_number = "txt_enter_phone_number";

  @JsonKey(name: 'txt_phone_number', defaultValue: "txt_phone_number")
  String txt_phone_number = "txt_phone_number";


  @JsonKey(name: 'txt_destination_time', defaultValue: "txt_destination_time")
  String txt_destination_time = "txt_destination_time";

  @JsonKey(name: 'txt_agree_description', defaultValue: "txt_agree_description")
  String txt_agree_description = "txt_agree_description";

  @JsonKey(name: 'txt_terms_conditions', defaultValue: "txt_terms_conditions")
  String txt_terms_conditions = "txt_terms_conditions";

  @JsonKey(name: 'txt_get_otp', defaultValue: "txt_get_otp")
  String txt_get_otp = "txt_get_otp";

  @JsonKey(name: 'txt_name', defaultValue: "txt_name")
  String txt_name = "txt_name";

  @JsonKey(name: 'txt_Email_optional', defaultValue: "txt_Email_optional")
  String txt_Email_optional = "txt_Email_optional";

  @JsonKey(name: 'txt_Referral_optional', defaultValue: "txt_Referral_optional")
  String txt_Referral_optional = "txt_Referral_optional";

  @JsonKey(name: 'txt_Cancel_Booking', defaultValue: "txt_Cancel_Booking")
  String txt_Cancel_Booking = "txt_Cancel_Booking";

  @JsonKey(name: 'txt_Call_Us', defaultValue: "txt_Call_Us")
  String txt_Call_Us = "Call Us";

  @JsonKey(
      name: 'txt_call_support_desc',
      defaultValue: "Call us for more any support")
  String txt_call_support_desc = "Call us for more any support";

  @JsonKey(
      name: 'txt_trip_assign_desc',
      defaultValue: "Your trip will assign with in 10 min")
  String txt_trip_assign_desc = "Your trip will assign with in 10 min";

  @JsonKey(name: 'txt_due_demand', defaultValue: "Due to high demand")
  String txt_due_demand = "Due to high demand";
  @JsonKey(name: 'txt_Ok', defaultValue: "txt_Ok")
  String txt_Ok = "txt_Ok";

  @JsonKey(
      name: 'txt_Choose_Your_Language',
      defaultValue: "txt_Choose_Your_Language")
  String txt_Choose_Your_Language = "txt_Choose_Your_Language";

  @JsonKey(name: 'txt_Set_Language', defaultValue: "txt_Set_Language")
  String txt_Set_Language = "txt_Set_Language";

  @JsonKey(
      name: 'txt_Select_language_to_proceed',
      defaultValue: "txt_Select_language_to_proceed")
  String txt_Select_language_to_proceed = "txt_Select_language_to_proceed";

  @JsonKey(name: 'txt_Skip', defaultValue: "txt_Skip")
  String txt_Skip = "txt_Skip";

  @JsonKey(
      name: 'txt_Search_for_country', defaultValue: "txt_Search_for_country")
  String txt_Search_for_country = "txt_Search_for_country";

  @JsonKey(name: 'txt_Country_not_found', defaultValue: "txt_Country_not_found")
  String txt_Country_not_found = "txt_Country_not_found";

  @JsonKey(name: 'txt_Get_OTP', defaultValue: "txt_Get_OTP")
  String txt_Get_OTP = "txt_Get_OTP";

  @JsonKey(
      name: 'txt_Enter_your_phone_desc',
      defaultValue: "txt_Enter_your_phone_desc")
  String txt_Enter_your_phone_desc = "txt_Enter_your_phone_desc";

  @JsonKey(name: 'txt_Code', defaultValue: "txt_Code")
  String txt_Code = "txt_Code";

  @JsonKey(name: 'txt_Phone_Number', defaultValue: "txt_Phone_Number")
  String txt_Phone_Number = "txt_Phone_Number";

  @JsonKey(
      name: 'txt_Enter_your_phone_number',
      defaultValue: "txt_Enter_your_phone_number")
  String txt_Enter_your_phone_number = "txt_Enter_your_phone_number";

  @JsonKey(name: 'txt_agree_to_our', defaultValue: "txt_agree_to_our")
  String txt_agree_to_our = "txt_agree_to_our";

  @JsonKey(name: 'txt_Terms_of_Service', defaultValue: "txt_Terms_of_Service")
  String txt_Terms_of_Service = "txt_Terms_of_Service";

  @JsonKey(
      name: 'txt_country_is_required', defaultValue: "txt_country_is_required")
  String txt_country_is_required = "txt_country_is_required";

  @JsonKey(
      name: 'txt_Check_your_sms_message',
      defaultValue: "txt_Check_your_sms_message")
  String txt_Check_your_sms_message = "txt_Check_your_sms_message";

  @JsonKey(
      name: 'txt_SMS_resent_success', defaultValue: "txt_SMS_resent_success")
  String txt_SMS_resent_success = "txt_SMS_resent_success";

  @JsonKey(
      name: 'txt_Phone_number_required',
      defaultValue: "txt_Phone_number_required")
  String txt_Phone_number_required = "txt_Phone_number_required";

  @JsonKey(name: 'Name Required', defaultValue: "Name Required")
  String txt_SOS_Name  = "Name Required";


  @JsonKey(
      name: 'txt_Phone_number_invalid',
      defaultValue: "txt_Phone_number_invalid")
  String txt_Phone_number_invalid = "txt_Phone_number_invalid";

  @JsonKey(name: 'txt_Invalid_otp', defaultValue: "txt_Invalid_otp")
  String txt_Invalid_otp = "txt_Invalid_otp";

  @JsonKey(name: 'txt_Enter_OTP', defaultValue: "txt_Enter_OTP")
  String txt_Enter_OTP = "txt_Enter_OTP";

  @JsonKey(name: 'txt_tomorrow', defaultValue: "txt_tomorrow")
  String txt_tomorrow = "txt_tomorrow";

  @JsonKey(name: 'txt_today', defaultValue: "txt_today")
  String txt_today = "txt_today";

  @JsonKey(name: 'txt_chat', defaultValue: "txt_chat")
  String txt_chat = "txt_chat";

  @JsonKey(name: 'txt_loading_msg', defaultValue: "txt_loading_msg")
  String txt_loading_msg = "txt_loading_msg";

  @JsonKey(name: 'txt_no_msg_found', defaultValue: "txt_no_msg_found")
  String txt_no_msg_found = "txt_no_msg_found";

  @JsonKey(name: 'txt_type_your_message', defaultValue: "txt_type_your_message")
  String txt_type_your_message = "txt_type_your_message";

  @JsonKey(name: 'txt_Add_personal_info', defaultValue: "txt_Add_personal_info")
  String txt_Add_personal_info = "txt_Add_personal_info";

  @JsonKey(name: 'txt_Sign_up', defaultValue: "txt_Sign_up")
  String txt_Sign_up = "txt_Sign_up";

  @JsonKey(name: 'txt_Name_required', defaultValue: "txt_Name_required")
  String txt_Name_required = "txt_Name_required";

  @JsonKey(name: 'txt_Name_invalid', defaultValue: "txt_Name_invalid")
  String txt_Name_invalid = "txt_Name_invalid";

  @JsonKey(name: 'txt_Email_invalid', defaultValue: "txt_Email_invalid")
  String txt_Email_invalid = "txt_Email_invalid";

  @JsonKey(name: 'txt_Invalid_referral', defaultValue: "txt_Invalid_referral")
  String txt_Invalid_referral = "txt_Invalid_referral";

  @JsonKey(name: 'txt_Allow_access', defaultValue: "txt_Allow_access")
  String txt_Allow_access = "txt_Allow_access";

  @JsonKey(
      name: 'txt_camera_permission_permanently_denied',
      defaultValue: "txt_camera_permission_permanently_denied")
  String txt_camera_permission_permanently_denied =
      "txt_camera_permission_permanently_denied";

  @JsonKey(
      name: 'txt_notification_permission_denied_alert',
      defaultValue: "txt_notification_permission_denied_alert")
  String txtNotificationPermissionDeniedAlert =
      "txt_notification_permission_denied_alert";



  @JsonKey(
      name: 'txt_Opening_camera_failed',
      defaultValue: "txt_Opening_camera_failed")
  String txt_Opening_camera_failed = "txt_Opening_camera_failed";

  @JsonKey(
      name: 'txt_Something_went_wrong',
      defaultValue: "txt_Something_went_wrong")
  String txt_Something_went_wrong = "txt_Something_went_wrong";

  @JsonKey(
      name: 'txt_welcome_to_taxi_aapz',
      defaultValue: "txt_welcome_to_taxi_aapz")
  String txt_welcome_to_taxi_aapz = "txt_welcome_to_taxi_aapz";

  @JsonKey(
      name: 'txt_location_permission_description',
      defaultValue: "txt_location_permission_description")
  String txt_location_permission_description =
      "txt_location_permission_description";

  @JsonKey(name: 'txt_Allow', defaultValue: "txt_Allow")
  String txt_Allow = "txt_Allow";

  @JsonKey(
      name: 'txt_Enable_gps_description',
      defaultValue: "txt_Enable_gps_description")
  String txt_Enable_gps_description = "txt_Enable_gps_description";

  @JsonKey(name: 'Txt_Continue', defaultValue: "Txt_Continue")
  String Txt_Continue = "Txt_Continue";

  @JsonKey(
      name: 'txt_agree_to_terms_conditions',
      defaultValue: "txt_agree_to_terms_conditions")
  String txt_agree_to_terms_conditions = "txt_agree_to_terms_conditions";

  @JsonKey(name: 'txt_Read_the', defaultValue: "txt_Read_the")
  String txt_Read_the = "txt_Read_the";

  @JsonKey(name: 'txt_and', defaultValue: "txt_and")
  String txt_and = "txt_and";

  @JsonKey(name: 'txt_Privacy_policy', defaultValue: "txt_Privacy_policy")
  String txt_Privacy_policy = "txt_Privacy_policy";

  @JsonKey(name: 'txt_I_agree', defaultValue: "txt_I_agree")
  String txt_I_agree = "txt_I_agree";

  @JsonKey(name: 'txt_Pickup_location', defaultValue: "txt_Pickup_location")
  String txt_Pickup_location = "txt_Pickup_location";

  @JsonKey(name: 'txt_Drop_location', defaultValue: "txt_Drop_location")
  String txt_Drop_location = "txt_Drop_location";

  @JsonKey(
      name: 'txt_Confirm_pickup_location',
      defaultValue: "txt_Confirm_pickup_location")
  String txt_Confirm_pickup_location = "txt_Confirm_pickup_location";

  @JsonKey(
      name: 'txt_Change_pickup_location',
      defaultValue: "txt_Change_pickup_location")
  String txt_Change_pickup_location = "txt_Change_pickup_location";

  @JsonKey(
      name: 'txt_Search_for_address', defaultValue: "txt_Search_for_address")
  String txt_Search_for_address = "txt_Search_for_address";

  @JsonKey(name: 'txt_Confirm', defaultValue: "txt_Confirm")
  String txt_Confirm = "txt_Confirm";

  @JsonKey(name: 'txt_Favourites', defaultValue: "txt_Favourites")
  String txt_Favourites = "txt_Favourites";

  @JsonKey(name: 'txt_Recent', defaultValue: "txt_Recent")
  String txt_Recent = "txt_Recent";

  @JsonKey(name: 'txt_Submit', defaultValue: "txt_Submit")
  String txt_Submit = "txt_Submit";

  @JsonKey(name: 'txt_Select_from_map', defaultValue: "txt_Select_from_map")
  String txt_Select_from_map = "txt_Select_from_map";

  @JsonKey(
      name: 'txt_Enter_drop_location', defaultValue: "txt_Enter_drop_location")
  String txt_Enter_drop_location = "txt_Enter_drop_location";

  @JsonKey(name: 'txt_Stop_location', defaultValue: "txt_Stop_location")
  String txt_Stop_location = "txt_Stop_location";

  @JsonKey(
      name: 'txt_Enter_stop_location', defaultValue: "txt_Enter_stop_location")
  String txt_Enter_stop_location = "txt_Enter_stop_location";

  @JsonKey(name: 'txt_Select_vehicle', defaultValue: "txt_Select_vehicle")
  String txt_Select_vehicle = "txt_Select_vehicle";

  @JsonKey(name: 'txt_By_signing_up', defaultValue: "txt_By_signing_up")
  String txt_By_signing_up = "txt_By_signing_up";

  @JsonKey(name: 'txt_Privacy', defaultValue: "txt_Privacy")
  String txt_Privacy = "txt_Privacy";

  @JsonKey(name: 'txt_Apply_promo', defaultValue: "txt_Apply_promo")
  String txt_Apply_promo = "txt_Apply_promo";

  @JsonKey(name: 'txt_Payment', defaultValue: "txt_Payment")
  String txt_Payment = "txt_Payment";

  @JsonKey(name: 'txt_Cash', defaultValue: "txt_Cash")
  String txt_Cash = "txt_Cash";

  //new
  @JsonKey(
      name: 'txt_Searching_for_drivers',
      defaultValue: "txt_Searching_for_drivers")
  String txt_Searching_for_drivers = "txt_Searching_for_drivers";

  @JsonKey(name: 'txt_Slide_to_cancel', defaultValue: "txt_Slide_to_cancel")
  String txt_Slide_to_cancel = "txt_Slide_to_cancel";

  @JsonKey(
      name: 'txt_Your_ride_will_start_soon',
      defaultValue: "txt_Your_ride_will_start_soon")
  String txt_Your_ride_will_start_soon = "txt_Your_ride_will_start_soon";

  @JsonKey(
      name: 'txt_press_again_to_exit', defaultValue: "txt_press_again_to_exit")
  String txt_press_again_to_exit = "txt_press_again_to_exit";

  @JsonKey(name: 'txt_booking_id', defaultValue: "txt_booking_id")
  String txt_booking_id = "txt_booking_id";

  @JsonKey(name: 'txt_total', defaultValue: "txt_total")
  String txtTotal = "txt_total";

  @JsonKey(
      name: 'txt_total_fare_by_cash', defaultValue: "txt_total_fare_by_cash")
  String txtTotalFareByCash = "txt_total_fare_by_cash";

  @JsonKey(name: 'txt_distance_cost', defaultValue: "txt_distance_cost")
  String txtDistanceCost = "txt_distance_cost";

  @JsonKey(name: 'txt_waiting_price', defaultValue: "txt_waiting_price")
  String txtWaitingPrice = "txt_waiting_price";

  @JsonKey(name: 'txt_time_cost', defaultValue: "txt_time_cost")
  String txtTimeCost = "txt_time_cost";

  @JsonKey(name: 'txt_referral_bonus', defaultValue: "txt_referral_bonus")
  String txtReferralBonus = "txt_referral_bonus";

  @JsonKey(name: 'txt_promo_bonus', defaultValue: "txt_promo_bonus")
  String txtPromoBonus = "txt_promo_bonus";

  @JsonKey(name: 'txt_service_tax', defaultValue: "txt_service_tax")
  String txtServiceTax = "txt_service_tax";

  @JsonKey(name: 'txt_booking_fee', defaultValue: "txt_booking_fee")
  String txtBookingFee = "txt_booking_fee";

  @JsonKey(
      name: 'txt_your_invoice_has_sent_to_this_mail',
      defaultValue: "txt_your_invoice_has_sent_to_this_mail")
  String txtYourInvoiceHasSentToThisMail =
      "txt_your_invoice_has_sent_to_this_mail";

  @JsonKey(name: 'txt_send_invoice', defaultValue: "txt_send_invoice")
  String txtSendInvoice = "txt_send_invoice";

  @JsonKey(name: 'txt_give_rating', defaultValue: "txt_give_rating")
  String txtGiveRating = "txt_give_rating";

  @JsonKey(name: 'txt_how_is_your_trip', defaultValue: "txt_how_is_your_trip")
  String txtHowIsYourTrip = "txt_how_is_your_trip";

  @JsonKey(name: 'txt_distance_meter', defaultValue: "txt_distance_meter")
  String txtDistanceMeter = "txt_distance_meter";

  @JsonKey(
      name: 'txt_start_distance_unit', defaultValue: "txt_start_distance_unit")
  String txtStartDistanceUnit = "txt_start_distance_unit";

  @JsonKey(name: 'txt_end_distance_unit', defaultValue: "txt_end_distance_unit")
  String txtEndDistanceUnit = "txt_end_distance_unit";

  @JsonKey(name: 'txt_no_driver_found', defaultValue: "txt_no_driver_found")
  String txtNoDriverFound = "txt_no_driver_found";

  @JsonKey(
      name: 'txt_enter_the_demo_key_description',
      defaultValue: "txt_enter_the_demo_key_description")
  String txtEnterTheDemoKeyDescription = "txt_enter_the_demo_key_description";

  @JsonKey(name: 'txt_demo_key', defaultValue: "txt_demo_key")
  String txtDemoKey = "txt_demo_key";

  @JsonKey(name: 'txt_enter_demo_key', defaultValue: "txt_enter_demo_key")
  String txtEnterDemoKey = "txt_enter_demo_key";

  @JsonKey(name: 'txt_next', defaultValue: "txt_next")
  String txtNext = "txt_next";

  @JsonKey(name: 'txt_Invalid_demo_key', defaultValue: "txt_Invalid_demo_key")
  String txtInvalidDemoKey = "txt_Invalid_demo_key";

  @JsonKey(
      name: 'txt_demo_key_is_expired', defaultValue: "txt_demo_key_is_expired")
  String txtDemoKeyIsExpired = "txt_demo_key_is_expired";

  @JsonKey(
      name: 'txt_otp_will_be_received_please_wait_for_few_seconds',
      defaultValue: "txt_otp_will_be_received_please_wait_for_few_seconds")
  String txtOtpWillBeReceivedPleaseWaitForFewSeconds =
      "txt_otp_will_be_received_please_wait_for_few_seconds";

  @JsonKey(name: 'txt_app_version', defaultValue: "txt_app_version")
  String txtAppVersion = "txt_app_version";

  @JsonKey(name: 'txt_rate_the_app', defaultValue: "txt_rate_the_app")
  String txtRateTheApp = "txt_rate_the_app";

  @JsonKey(name: 'txt_facebook', defaultValue: "txt_facebook")
  String txtFacebook = "txt_facebook";

  @JsonKey(name: 'txt_legal', defaultValue: "txt_legal")
  String txt_legal = "txt_legal";

  @JsonKey(name: 'txt_join_driver', defaultValue: "txt_join_driver")
  String txt_join_driver = "txt_join_driver";

  @JsonKey(name: 'txt_dwn_application', defaultValue: "txt_dwn_application")
  String txt_dwn_application = "txt_dwn_application";

  @JsonKey(name: 'txt_download', defaultValue: "txt_download")
  String txt_download = "txt_download";

  @JsonKey(name: 'txt_enter_promo', defaultValue: "txt_enter_promo")
  String txt_enter_promo = "txt_enter_promo";

  @JsonKey(name: 'txt_Applied_promo', defaultValue: "txt_Applied_promo")
  String txt_Applied_promo = "txt_Applied_promo";

  @JsonKey(name: 'txt_clear_promo', defaultValue: "txt_clear_promo")
  String txt_clear_promo = "txt_clear_promo";


  @JsonKey(name: 'txt_required', defaultValue: "txt_required")
  String txt_required = "txt_required";

  @JsonKey(name: 'txt_available_promo', defaultValue: "txt_available_promo")
  String txt_available_promo = "txt_available_promo";

  @JsonKey(name: 'txt_upto', defaultValue: "txt_upto")
  String txt_upto = "txt_upto";

  @JsonKey(name: 'txt_applied', defaultValue: "txt_applied")
  String txt_applied = "txt_applied";

  @JsonKey(name: 'txt_apply', defaultValue: "txt_apply")
  String txt_apply = "txt_apply";

  @JsonKey(name: 'txt_add_card', defaultValue: "txt_add_card")
  String txt_add_card = "txt_add_card";

  @JsonKey(name: 'txt_Card_Number', defaultValue: "txt_Card_Number")
  String txt_Card_Number = "txt_Card_Number";

  @JsonKey(name: 'txt_Card_holder_name', defaultValue: "txt_Card_holder_name")
  String txt_Card_holder_name = "txt_Card_holder_name";

  @JsonKey(name: 'txt_save', defaultValue: "txt_save")
  String txt_save = "txt_save";

  @JsonKey(
      name: 'txt_add_emergency_contact',
      defaultValue: "txt_add_emergency_contact")
  String txt_add_emergency_contact = "txt_add_emergency_contact";

  @JsonKey(name: 'txt_trip_cancelled', defaultValue: "txt_trip_cancelled")
  String txt_trip_cancelled = "txt_trip_cancelled";

  @JsonKey(
      name: 'txt_cancelled_trip_desc', defaultValue: "txt_cancelled_trip_desc")
  String txt_cancelled_trip_desc = "txt_cancelled_trip_desc";

  @JsonKey(name: 'txt_back_to_home', defaultValue: "txt_back_to_home")
  String txt_back_to_home = "txt_back_to_home";

  @JsonKey(name: 'txt_logout', defaultValue: "txt_logout")
  String txt_logout = "txt_logout";

  @JsonKey(
      name: 'txt_are_you_sure_to_logout',
      defaultValue: "txt_are_you_sure_to_logout")
  String txt_are_you_sure_to_logout = "txt_are_you_sure_to_logout";

  @JsonKey(
      name: 'txt_are_you_sure_to_delete',
      defaultValue: "txt_are_you_sure_to_delete")
  String txt_are_you_sure_to_delete = "txt_are_you_sure_to_delete";

  @JsonKey(name: 'txt_cancel', defaultValue: "txt_cancel")
  String txt_cancel = "txt_cancel";

  @JsonKey(name: 'txt_cancel_ride', defaultValue: "txt_cancel_ride")
  String txt_cancel_ride = "txt_cancel_ride";

  @JsonKey(name: 'txt_cancel_ride_desc', defaultValue: "txt_cancel_ride_desc")
  String txt_cancel_ride_desc = "txt_cancel_ride_desc";

  @JsonKey(name: 'txt_yes', defaultValue: "txt_yes")
  String txt_yes = "txt_yes";

  @JsonKey(name: 'txt_no', defaultValue: "txt_no")
  String txt_no = "txt_no";

  @JsonKey(name: 'txt_delete_sos', defaultValue: "txt_delete_sos")
  String txt_delete_sos = "txt_delete_sos";

  @JsonKey(name: 'txt_delete_sos_desc', defaultValue: "txt_delete_sos_desc")
  String txt_delete_sos_desc = "txt_delete_sos_desc";

  @JsonKey(name: 'txt_delete_card', defaultValue: "txt_delete_card")
  String txt_delete_card = "txt_delete_card";

  @JsonKey(name: 'txt_delete_account', defaultValue: "txt_delete_account")
  String txt_delete_account = "txt_delete_account";

  @JsonKey(name: 'txt_delete', defaultValue: "txt_delete")
  String txt_delete = "txt_delete";

  @JsonKey(name: 'txt_delete_card_desc', defaultValue: "txt_delete_card_desc")
  String txt_delete_card_desc = "txt_delete_card_desc";

  @JsonKey(name: 'txt_pickUp_time', defaultValue: "txt_pickUp_time")
  String txt_pickUp_time = "txt_pickUp_time";

  @JsonKey(name: 'txt_reset_now', defaultValue: "txt_reset_now")
  String txt_reset_now = "txt_reset_now";

  @JsonKey(name: 'txt_schedule_ride', defaultValue: "txt_schedule_ride")
  String txt_schedule_ride = "txt_schedule_ride";

  @JsonKey(
      name: 'txt_schedule_ride_time_greater_text',
      defaultValue: "txt_schedule_ride_time_greater_text")
  String txt_schedule_ride_time_greater_text =
      "txt_schedule_ride_time_greater_text";

  @JsonKey(name: 'txt_fare_details', defaultValue: "txt_fare_details")
  String txt_fare_details = "txt_fare_details";

  @JsonKey(name: 'txt_vehicle_type', defaultValue: "txt_vehicle_type")
  String txt_vehicle_type = "txt_vehicle_type";

  @JsonKey(name: 'txt_base_fare', defaultValue: "txt_base_fare")
  String txt_base_fare = "txt_base_fare";

  @JsonKey(name: 'txt_grace_time_charge', defaultValue: "txt_grace_time_charge")
  String txt_grace_time_charge = "txt_grace_time_charge";

  @JsonKey(name: 'txt_extra_km_charge', defaultValue: "txt_extra_km_charge")
  String txt_extra_km_charge = "txt_extra_km_charge";

  @JsonKey(name: 'txt_note', defaultValue: "txt_note")
  String txt_note = "txt_note";

  @JsonKey(name: 'txt_note_desc_one', defaultValue: "txt_note_desc_one")
  String txt_note_desc_one = "txt_note_desc_one";

  @JsonKey(name: 'txt_note_desc_two', defaultValue: "txt_note_desc_two")
  String txt_note_desc_two = "txt_note_desc_two";

  @JsonKey(name: 'txt_note_desc_three', defaultValue: "txt_note_desc_three")
  String txt_note_desc_three = "txt_note_desc_three";

  @JsonKey(name: 'txt_close', defaultValue: "txt_close")
  String txt_close = "txt_close";

  @JsonKey(name: 'txt_total_fare_amount', defaultValue: "txt_total_fare_amount")
  String txt_total_fare_amount = "txt_total_fare_amount";

  @JsonKey(name: 'txt_rate_per_km', defaultValue: "txt_rate_per_km")
  String txt_rate_per_km = "txt_rate_per_km";

  @JsonKey(name: 'txt_ride_time_charge', defaultValue: "txt_ride_time_charge")
  String txt_ride_time_charge = "txt_ride_time_charge";

  @JsonKey(name: 'txt_waiting_charge', defaultValue: "txt_waiting_charge")
  String txt_waiting_charge = "txt_waiting_charge";

  @JsonKey(name: 'txt_pickup_charge', defaultValue: "txt_pickup_charge")
  String txt_pickup_charge = "txt_pickup_charge";

  @JsonKey(name: 'txt_per_minute', defaultValue: "txt_per_minute")
  String txt_per_minute = "txt_per_minute";

  @JsonKey(name: 'txt_payment_methods', defaultValue: "txt_payment_methods")
  String txt_payment_methods = "txt_payment_methods";

  @JsonKey(
      name: 'txt_add_payment_method', defaultValue: "txt_add_payment_method")
  String txt_add_payment_method = "txt_add_payment_method";

  @JsonKey(name: 'txt_myself', defaultValue: "txt_myself")
  String txt_myself = "txt_myself";

  @JsonKey(name: 'txt_others', defaultValue: "txt_others")
  String txt_others = "txt_others";

  @JsonKey(
      name: 'txt_user_name_is_empty', defaultValue: "txt_user_name_is_empty")
  String txt_user_name_is_empty = "txt_user_name_is_empty";

  @JsonKey(
      name: 'txt_phone_number_is_empty',
      defaultValue: "txt_phone_number_is_empty")
  String txt_phone_number_is_empty = "txt_phone_number_is_empty";

  @JsonKey(name: 'txt_pm', defaultValue: "txt_pm")
  String txt_pm = "txt_pm";

  @JsonKey(name: 'txt_am', defaultValue: "txt_am")
  String txt_am = "txt_am";

  @JsonKey(name: 'txt_recharge_wallet', defaultValue: "txt_recharge_wallet")
  String txt_recharge_wallet = "txt_recharge_wallet";

  @JsonKey(name: 'txt_enter_amount', defaultValue: "txt_enter_amount")
  String txt_enter_amount = "txt_enter_amount";

  @JsonKey(name: 'txt_add_case', defaultValue: "txt_add_case")
  String txt_add_case = "txt_add_case";

  @JsonKey(name: 'txt_destination', defaultValue: "txt_destination")
  String txt_destination = "txt_destination";

  @JsonKey(name: 'txt_cancelled', defaultValue: "txt_cancelled")
  String txt_cancelled = "txt_cancelled";

  @JsonKey(name: 'txt_book_again', defaultValue: "txt_book_again")
  String txt_book_again = "txt_book_again";

  @JsonKey(name: 'txt_no_data_found', defaultValue: "txt_no_data_found")
  String txt_no_data_found = "txt_no_data_found";

  @JsonKey(name: 'txt_completed', defaultValue: "txt_completed")
  String txt_completed = "txt_completed";

  @JsonKey(name: 'txt_completed_small', defaultValue: "txt_completed_small")
  String txt_completed_small = "txt_completed_small";

  @JsonKey(name: 'txt_scheduled', defaultValue: "txt_scheduled")
  String txt_scheduled = "txt_scheduled";

  @JsonKey(name: 'txt_myRides', defaultValue: "txt_myRides")
  String txt_myRides = "txt_myRides";

  @JsonKey(name: 'txt_cancelled_small', defaultValue: "txt_cancelled_small")
  String txt_cancelled_small = "txt_cancelled_small";

  @JsonKey(name: 'txt_scheduled_small', defaultValue: "txt_scheduled_small")
  String txt_scheduled_small = "txt_scheduled_small";

  @JsonKey(
      name: 'txt_Choose_Your_Language_head',
      defaultValue: "txt_Choose_Your_Language_head")
  String txt_Choose_Your_Language_head = "txt_Choose_Your_Language_head";

  @JsonKey(name: 'txt_rental', defaultValue: "txt_rental")
  String txt_rental = "txt_rental";

  @JsonKey(name: 'txt_local', defaultValue: "txt_local")
  String txt_local = "txt_local";

  @JsonKey(name: 'txt_km', defaultValue: "txt_km")
  String txt_km = "txt_km";

  @JsonKey(name: 'txt_hours', defaultValue: "txt_hours")
  String txt_hours = "txt_rental";

  @JsonKey(name: 'txt_select_package', defaultValue: "txt_select_package")
  String txt_select_package = "txt_select_package";

  @JsonKey(name: 'txt_map_view', defaultValue: "txt_map_view")
  String txt_map_view = "txt_map_view";

  @JsonKey(name: 'txt_no_internet', defaultValue: "txt_no_internet")
  String txt_no_internet = "txt_no_internet";

  @JsonKey(name: 'txt_no_internet_desc', defaultValue: "txt_no_internet_desc")
  String txt_no_internet_desc = "txt_no_internet_desc";

  @JsonKey(name: 'txt_no_notification', defaultValue: "txt_no_notification")
  String txt_no_notification = "txt_no_notification";

  @JsonKey(name: 'txt_notification', defaultValue: "txt_notification")
  String txt_notification = "txt_notification";

  @JsonKey(name: 'txt_myProfile', defaultValue: "txt_myProfile")
  String txt_myProfile = "txt_myProfile";

  @JsonKey(name: 'txt_myFavorites', defaultValue: "txt_myFavorites")
  String txt_myFavorites = "txt_myFavorites";

  @JsonKey(name: 'txt_delete_favorite', defaultValue: "txt_delete_favorite")
  String txt_delete_favorite = "txt_delete_favorite";

  @JsonKey(name: 'txt_location', defaultValue: "txt_location")
  String txt_location = "txt_location";

  @JsonKey(name: 'txt_addHome', defaultValue: "txt_addHome")
  String txt_addHome = "txt_addHome";

  @JsonKey(name: 'txt_addWork', defaultValue: "txt_addWork")
  String txt_addWork = "txt_addWork";

  @JsonKey(name: 'txt_addOthers', defaultValue: "txt_addOthers")
  String txt_addOthers = "txt_addOthers";

  @JsonKey(name: 'txt_choose_profile', defaultValue: "txt_choose_profile")
  String txt_choose_profile = "txt_choose_profile";

  @JsonKey(name: 'txt_camera', defaultValue: "txt_camera")
  String txt_camera = "txt_camera";

  @JsonKey(name: 'txt_gallery', defaultValue: "txt_gallery")
  String txt_gallery = "txt_gallery";

  @JsonKey(name: 'txt_app_name', defaultValue: "txt_app_name")
  String txt_app_name = "txt_app_name";

  @JsonKey(name: 'txt_share', defaultValue: "txt_share")
  String txt_share = "txt_share";

  @JsonKey(
      name: 'txt_your_referral_code', defaultValue: "txt_your_referral_code")
  String txt_your_referral_code = "txt_your_referral_code";

  @JsonKey(name: 'txt_loading', defaultValue: "txt_loading")
  String txt_loading = "txt_loading";

  @JsonKey(name: 'txt_claim', defaultValue: "txt_claim")
  String txt_claim = "txt_claim";

  @JsonKey(
      name: 'txt_total_referral_amount',
      defaultValue: "txt_total_referral_amount")
  String txt_total_referral_amount = "txt_total_referral_amount";

  @JsonKey(name: 'txt_and_family', defaultValue: "txt_and_family")
  String txt_and_family = "txt_and_family";

  @JsonKey(name: 'txt_invite_friends', defaultValue: "txt_invite_friends")
  String txt_invite_friends = "txt_invite_friends";

  @JsonKey(name: 'txt_refferal_code', defaultValue: "txt_refferal_code")
  String txt_refferal_code = "txt_refferal_code";

  @JsonKey(name: 'txt_copied_to_clip', defaultValue: "txt_copied_to_clip")
  String txt_copied_to_clip = "txt_copied_to_clip";

  @JsonKey(name: 'txt_join_with_my_code', defaultValue: "txt_join_with_my_code")
  String txt_join_with_my_code = "txt_join_with_my_code";

  @JsonKey(name: 'txt_hey_refferal', defaultValue: "txt_hey_refferal")
  String txt_hey_refferal = "txt_hey_refferal";

  @JsonKey(name: 'txt_to_join_app', defaultValue: "txt_to_join_app")
  String txt_to_join_app = "txt_to_join_app";

  @JsonKey(name: 'txt_clear_promo_desc', defaultValue: "txt_clear_promo_desc")
  String txt_clear_promo_desc = "txt_clear_promo_desc";

  @JsonKey(name: 'txt_hr', defaultValue: "txt_hr")
  String txt_hr = "txt_hr";

  @JsonKey(
      name: 'txt_ride_later_success', defaultValue: "txt_ride_later_success")
  String txt_ride_later_success = "txt_ride_later_success";

  @JsonKey(name: 'txt_ride_now', defaultValue: "txt_ride_now")
  String txt_ride_now = "txt_ride_now";

  @JsonKey(name: 'txt_minute', defaultValue: "txt_minute")
  String txt_minute = "txt_minute";

  @JsonKey(name: 'txt_Scheduled_Auto', defaultValue: "txt_Scheduled_Auto")
  String txt_Scheduled_Auto = "txt_Scheduled_Auto";

  @JsonKey(name: 'txt_Complaint', defaultValue: "txt_Complaint")
  String txt_Complaint = "txt_Complaint";

  @JsonKey(
      name: 'txt_Enter_complaints_briefly',
      defaultValue: "txt_Enter_complaints_briefly")
  String txt_Enter_complaints_briefly = "txt_Enter_complaints_briefly";

  @JsonKey(
      name: 'txt_Choose_a_number_to_call',
      defaultValue: "txt_Choose_a_number_to_call")
  String txt_Choose_a_number_to_call = "txt_Choose_a_number_to_call";

  @JsonKey(
      name: 'txt_Head_Office_Number', defaultValue: "txt_Head_Office_Number")
  String txt_Head_Office_Number = "txt_Head_Office_Number";

  @JsonKey(
      name: 'txt_Admin_Phone_Number', defaultValue: "txt_Admin_Phone_Number")
  String txt_Admin_Phone_Number = "txt_Admin_Phone_Number";

  @JsonKey(name: 'txt_support', defaultValue: "txt_support")
  String txt_support = "txt_support";

  @JsonKey(name: 'txt_sos', defaultValue: "txt_sos")
  String txt_sos = "txt_sos";

  @JsonKey(name: 'txt_admin', defaultValue: "txt_admin")
  String txt_admin = "txt_admin";

  @JsonKey(name: 'txt_Need_any_support', defaultValue: "txt_Need_any_support")
  String txt_Need_any_support = "txt_Need_any_support";

  @JsonKey(name: 'txt_cancel_this_ride', defaultValue: "txt_cancel_this_ride")
  String txt_cancel_this_ride = "txt_cancel_this_ride";

  @JsonKey(
      name: 'txt_Cancellation_charge_might_be_applied',
      defaultValue: "txt_Cancellation_charge_might_be_applied")
  String txt_Cancellation_charge_might_be_applied =
      "txt_Cancellation_charge_might_be_applied";

  @JsonKey(name: 'txt_keep_the_booking', defaultValue: "txt_keep_the_booking")
  String txt_keep_the_booking = "txt_keep_the_booking";

  @JsonKey(
      name: 'txt_Please_select_any_reason_for_cancellation',
      defaultValue: "txt_Please_select_any_reason_for_cancellation")
  String txt_Please_select_any_reason_for_cancellation =
      "txt_Please_select_any_reason_for_cancellation";

  @JsonKey(name: 'txt_waiting_time', defaultValue: "txt_waiting_time")
  String txt_waiting_time = "txt_waiting_time";

  @JsonKey(name: 'txt_trip_time', defaultValue: "txt_trip_time")
  String txt_trip_time = "txt_trip_time";

  @JsonKey(name: 'txt_arrived_in', defaultValue: "txt_arrived_in")
  String txt_arrived_in = "txt_arrived_in";

  @JsonKey(name: 'txt_arrived', defaultValue: "txt_arrived")
  String txt_arrived = "txt_arrived";

  @JsonKey(name: 'txt_Enjoy_your_ride', defaultValue: "txt_Enjoy_your_ride")
  String txt_Enjoy_your_ride = "txt_Enjoy_your_ride";

  @JsonKey(
      name: 'txt_We_Found_you_a_driver',
      defaultValue: "txt_We_Found_you_a_driver")
  String txt_We_Found_you_a_driver = "txt_We_Found_you_a_driver";

  @JsonKey(name: 'txt_try_again', defaultValue: "txt_try_again")
  String txtTryAgain = "txt_try_again";
  @JsonKey(
      name: 'txt_Driver_started_to_your_location',
      defaultValue: "txt_Driver_started_to_your_location")
  String txt_Driver_started_to_your_location =
      "txt_Driver_started_to_your_location";

  @JsonKey(name: 'txt_Driver_accepted', defaultValue: "txt_Driver_accepted")
  String txt_Driver_accepted = "txt_Driver_accepted";

  @JsonKey(name: 'txt_Otp', defaultValue: "txt_Otp")
  String txt_Otp = "txt_Otp";

  @JsonKey(
      name: 'txt_user_trip_address_change_description',
      defaultValue: "txt_user_trip_address_change_description")
  String txtUserTripAddressChangeDescription =
      "txt_user_trip_address_change_description";
  @JsonKey(name: 'txt_share_trip', defaultValue: "txt_share_trip")
  String txt_share_trip = "txt_share_trip";

  @JsonKey(name: 'txt_promo', defaultValue: "txt_promo")
  String txt_promo = "txt_promo";

  @JsonKey(name: 'txt_card', defaultValue: "txt_card")
  String txt_card = "txt_card";

  @JsonKey(name: 'txt_add', defaultValue: "txt_add")
  String txt_add = "txt_add";

  @JsonKey(
      name: 'txt_transaction_history', defaultValue: "txt_transaction_history")
  String txt_transaction_history = "txt_transaction_history";

  @JsonKey(name: 'txt_sort_order', defaultValue: "txt_sort_order")
  String txt_sort_order = "txt_sort_order";

  @JsonKey(name: 'txt_purpose', defaultValue: "txt_purpose")
  String txt_purpose = "txt_purpose";

  @JsonKey(name: 'txt_amount', defaultValue: "txt_amount")
  String txt_amount = "txt_amount";

  @JsonKey(name: 'txt_wallet', defaultValue: "txt_wallet")
  String txt_wallet = "txt_wallet";

  @JsonKey(name: 'txt_available_balance', defaultValue: "txt_available_balance")
  String txt_available_balance = "txt_available_balance";

  @JsonKey(name: 'txt_actions', defaultValue: "txt_actions")
  String txt_actions = "txt_actions";

  @JsonKey(name: 'txt_reacharge', defaultValue: "txt_reacharge")
  String txt_reacharge = "txt_reacharge";

  @JsonKey(name: 'txt_home', defaultValue: "txt_home")
  String txt_home = "txt_home";

  @JsonKey(name: 'txt_referral', defaultValue: "txt_referral")
  String txt_referral = "txt_referral";

  @JsonKey(name: 'txt_language', defaultValue: "txt_language")
  String txt_language = "txt_language";

  @JsonKey(name: 'txt_about_us', defaultValue: "txt_about_us")
  String txt_about_us = "txt_about_us";

  @JsonKey(name: 'txt_my_rides', defaultValue: "txt_my_rides")
  String txt_my_rides = "txt_my_rides";

  @JsonKey(name: 'txt_time_to_update', defaultValue: "txt_time_to_update")
  String txt_time_to_update = "txt_time_to_update";

  @JsonKey(
      name: 'txt_time_to_update_desc', defaultValue: "txt_time_to_update_desc")
  String txt_time_to_update_desc = "txt_time_to_update_desc";

  @JsonKey(name: 'txt_update', defaultValue: "txt_update")
  String txt_update = "txt_update";

  @JsonKey(name: 'txt_delete_success', defaultValue: "txt_delete_success")
  String txt_delete_success = "txt_delete_success";

  @JsonKey(name: 'txt_pickup_change', defaultValue: "txt_pickup_change")
  String txt_pickup_change = "txt_pickup_change";

  @JsonKey(name: 'txt_stop_change', defaultValue: "txt_stop_change")
  String txt_stop_change = "txt_stop_change";

  @JsonKey(name: 'txt_drop_change', defaultValue: "txt_drop_change")
  String txt_drop_change = "txt_drop_change";

  @JsonKey(
      name: 'txt_trip_not_completed', defaultValue: "txt_trip_not_completed")
  String txt_trip_not_completed = "txt_trip_not_completed";

  @JsonKey(name: 'txt_clear_all', defaultValue: "txt_clear_all")
  String txt_clear_all = "txt_clear_all";

  @JsonKey(name: 'txt_admin_commission', defaultValue: "txt_admin_commission")
  String txtAdminCommission = "txt_admin_commission";

  @JsonKey(
      name: 'txt_trip_cancelled_by_driver_desc',
      defaultValue: "txt_trip_cancelled_by_driver_desc")
  String txtTripCancelledByDriverDesc = "txt_trip_cancelled_by_driver_desc";
  @JsonKey(name: 'txt_any_dispute', defaultValue: "txt_any_dispute")
  String txtAnyDispute = "txt_any_dispute";

  @JsonKey(name: 'txt_dispute', defaultValue: "txt_dispute")
  String txtDispute = "txt_dispute";

  @JsonKey(name: 'txt_track_tickets', defaultValue: "txt_track_tickets")
  String txtTrackTickets = "txt_track_tickets";

  @JsonKey(name: 'txt_all', defaultValue: "txt_all")
  String txtAll = "txt_all";

  @JsonKey(name: 'txt_active', defaultValue: "txt_active")
  String txtActive = "txt_active";

  @JsonKey(name: 'txt_closed', defaultValue: "txt_closed")
  String txtClosed = "txt_closed";

  @JsonKey(
      name: 'txt_request_registered', defaultValue: "txt_request_registered")
  String txtRequestRegistered = "txt_request_registered";

  @JsonKey(name: 'txt_updated', defaultValue: "txt_updated")
  String txtUpdated = "txt_updated";

  @JsonKey(name: 'txt_work_in_progress', defaultValue: "txt_work_in_progress")
  String txtWorkInProgress = "txt_work_in_progress";

  @JsonKey(name: 'txt_issue_resolved', defaultValue: "txt_issue_resolved")
  String txtIssueResolved = "txt_issue_resolved";

  @JsonKey(
      name: 'txt_request_registered_description',
      defaultValue: "txt_request_registered_description")
  String txtRequestRegisteredDescription = "txt_request_registered_description";

  @JsonKey(
      name: 'txt_updated_description', defaultValue: "txt_updated_description")
  String txtUpdatedDescription = "txt_updated_description";

  @JsonKey(
      name: 'txt_work_in_progress_description',
      defaultValue: "txt_work_in_progress_description")
  String txtWorkInProgressDescription = "txt_work_in_progress_description";

  @JsonKey(
      name: 'txt_issue_resolved_description',
      defaultValue: "txt_issue_resolved_description")
  String txtIssueResolvedDescription = "txt_issue_resolved_description";

  @JsonKey(name: 'txt_view_more', defaultValue: "txt_view_more")
  String txtViewMore = "txt_view_more";

  @JsonKey(name: 'txt_id', defaultValue: "txt_id")
  String txtId = "txt_id";

  @JsonKey(name: 'txt_tickets_details', defaultValue: "txt_tickets_details")
  String txtTicketsDetails = "txt_tickets_details";

  @JsonKey(name: 'txt_description', defaultValue: "txt_description")
  String txtDescription = "txt_description";

  @JsonKey(name: 'txt_ticket_status', defaultValue: "txt_ticket_status")
  String txtTicketStatus = "txt_ticket_status";

  @JsonKey(name: 'txt_open', defaultValue: "txt_open")
  String txtOpen = "txt_open";

  @JsonKey(name: 'txt_in_progress', defaultValue: "txt_in_progress")
  String txtInProgress = "txt_in_progress";

  @JsonKey(name: 'txt_action_taken', defaultValue: "txt_action_taken")
  String txtActionTaken = "txt_action_taken";

  @JsonKey(name: 'txt_user_id', defaultValue: "txt_user_id")
  String txtUserId = "txt_user_id";

  @JsonKey(name: 'txt_trip_id', defaultValue: "txt_trip_id")
  String txt_trip_id = "txt_trip_id";

  @JsonKey(
      name: 'txt_low_wallet_balance_create_trip_desc',
      defaultValue: "txt_low_wallet_balance_create_trip_desc")
  String txtLowWalletBalanceCreateTripDesc =
      "txt_low_wallet_balance_create_trip_desc";

  @JsonKey(
      name: 'txt_total_fare_by_wallet',
      defaultValue: "txt_total_fare_by_wallet")
  String txtTotalFareByWallet = "txt_total_fare_by_wallet";

  @JsonKey(
      name: 'txt_total_fare_by_card', defaultValue: "txt_total_fare_by_card")
  String txtTotalFareByCard = "txt_total_fare_by_card";

  @JsonKey(name: 'txt_make_payment', defaultValue: "txt_make_payment")
  String txtMakePayment = "txt_make_payment";

  @JsonKey(name: 'txt_faq', defaultValue: "txt_faq")
  String txtfaq = "txt_faq";

  @JsonKey(name: 'txt_please_describe_your_reason', defaultValue: "txt_please_describe_your_reason")
  String txt_please_describe_your_reason = "txt_please_describe_your_reason";

  @JsonKey(name: 'txt_Please_describe_your_reason_for_cancellation', defaultValue: "txt_Please_describe_your_reason_for_cancellation")
  String txt_Please_describe_your_reason_for_cancellation = "txt_Please_describe_your_reason_for_cancellation";

  @JsonKey(name: 'txt_reason', defaultValue: "txt_reason")
  String txtReason = "txt_reason";

  @JsonKey(name: 'txt_Cancelled_By', defaultValue: "txt_Cancelled_By")
  String txtCancelledBy = "txt_Cancelled_By";

  @JsonKey(name: 'txt_rating', defaultValue: "txt_rating")
  String txtRating = "txt_rating";


  factory TranslationModel.fromJson(Map<String, dynamic> json) =>
      _$TranslationModelFromJson(json);

  Map<String, dynamic> toJson() => _$TranslationModelToJson(this);
}
