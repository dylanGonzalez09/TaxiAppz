import 'package:json_annotation/json_annotation.dart';

part 'translation_model.g.dart';

@JsonSerializable()
class TranslationModel {
  TranslationModel();

  /*
  "txt_no_subscription_plan_found" : "No Subscription Plan Available.",
  "txt_are_you_sure_to_subscribe" : "Are you sure to Subscribe this plan",
  "txt_choose_your_plan" : "Choose your plan",
  "txt_valid_for" : "Valid for",
  "txt_choose_plan" : "Choose Plan",
  "txt_subscription" : "Subscription",
  "txt_subscribe" : "Subscribe",
  "txt_subscription_plan" : "Subscription Plan",
  "txt_plan" : "Plan",
  "txt_days" : "Days",

  "txt_subscription_remaining_days" : "Subscription Remaining Days",


  "txt_vehicle_type_disable_desc" : "Your vehicle type has been disabled by admin so please contact them for further details.",
  "txt_zone_disable_desc" : "Your Service Zone has been disabled by admin so please contact them for further details.",
   "txt_zone_disable_title" : "Service Zone Disabled",
  "txt_vehicle_type_disable_title" : "Vehicle Type disabled",


  "txt_invalid_vehicle_number" : "Please enter valid vehicle number to proceed",
  "txt_admin_blocked_title" : "Admin Blocked You",
  "txt_admin_blocked_desc" : "For some reason our admin has blocked you please contact admin.",
"txt_please_enter_your_complaint" : "Please enter your complaint",

"txt_minimum_4_characters_required": "Minimum 4 characters required"
"txt_please_enter_meaningful_text": "Please enter meaningful text"
"txt_numbers_only_not_allowed": "Numbers only not allowed",
"txt_enter_the_meaningful_complaint": "enter the meaningful complaint",
"txt_please_enter_at_least_2_meaningful_words": "Please enter at least 2 meaningful words",
"txt_please_avoid_meaningless_symbols": "Please avoid meaningless symbols",
"txt_maximum_100_characters_allowed": "Maximum 100 characters allowed",
"txt_complaint_submitted_successfully":"Complaint submitted successfully"
"txt_delete_sos":"Delete SOS",
"txt_are_you_sure_want_to_delete_this_contact?":"Are you sure want to delete this contact?",
"txt_yes":"Yes",
"txt_no":No",
"txt_Contact_with_this_name_phone_and_country_already_exists":"Contact with this name, phone, and country already exists",
"txt_maximum_emergency_contacts_limit_reached":"Maximum emergency contacts limit reached",
"txt_contact_added_successfully":"Contact added successfully"





   */

  @JsonKey(
      name: 'txt_admin_blocked_title', defaultValue: "txt_admin_blocked_title")
  String txt_admin_blocked_title = "txt_admin_blocked_title";

  @JsonKey(
      name: 'txt_Contact_with_this_name_phone_and_country_already_exists', defaultValue: "txt_Contact_with_this_name_phone_and_country_already_exists")
  String txt_Contact_with_this_name_phone_and_country_already_exists = "txt_Contact_with_this_name_phone_and_country_already_exists";

  @JsonKey(
      name: 'txt_maximum_emergency_contacts_limit_reached', defaultValue: "txt_maximum_emergency_contacts_limit_reached")
  String txt_maximum_emergency_contacts_limit_reached = "txt_maximum_emergency_contacts_limit_reached";

  @JsonKey(
      name: 'txt_contact_added_successfully', defaultValue: "txt_contact_added_successfully")
  String txt_contact_added_successfully = "txt_contact_added_successfully";





  @JsonKey(
      name: 'txt_delete_sos', defaultValue: "txt_delete_sos")
  String txt_delete_sos = "txt_delete_sos";
  @JsonKey(
      name: 'txt_are_you_sure_want_to_delete_this_contact?', defaultValue: "txt_are_you_sure_want_to_delete_this_contact?")
  String txt_are_you_sure_want_to_delete_this_contact = "txt_are_you_sure_want_to_delete_this_contact?";
  @JsonKey(
      name: 'txt_yes', defaultValue: "txt_yes")
  String txt_yes = "txt_yes";
  @JsonKey(
      name: 'txt_no', defaultValue: "txt_no")
  String txt_no = "txt_no";




  @JsonKey(
      name: 'txt_maximum_100_characters_allowed', defaultValue: "txt_maximum_100_characters_allowed")
  String txt_maximum_100_characters_allowed = "txt_maximum_100_characters_allowed";

  @JsonKey(
      name: 'txt_complaint_submitted_successfully', defaultValue: "txt_complaint_submitted_successfully")
  String txt_complaint_submitted_successfully = "txt_complaint_submitted_successfully";

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
      name: 'txt_admin_blocked_desc', defaultValue: "txt_admin_blocked_desc")
  String txt_admin_blocked_desc = "txt_admin_blocked_desc";

  @JsonKey(
      name: 'txt_invalid_vehicle_number',
      defaultValue: "txt_invalid_vehicle_number")
  String txt_invalid_vehicle_number = "txt_invalid_vehicle_number";

  @JsonKey(
      name: 'txt_zone_disable_title', defaultValue: "txt_zone_disable_title")
  String txt_zone_disable_title = "txt_zone_disable_title";

  @JsonKey(
      name: 'txt_vehicle_type_disable_title',
      defaultValue: "txt_vehicle_type_disable_title")
  String txt_vehicle_type_disable_title = "txt_vehicle_type_disable_title";

  @JsonKey(name: 'txt_zone_disable_desc', defaultValue: "txt_zone_disable_desc")
  String txt_zone_disable_desc = "txt_zone_disable_desc";

  @JsonKey(
      name: 'txt_vehicle_type_disable_desc',
      defaultValue: "txt_vehicle_type_disable_desc")
  String txt_vehicle_type_disable_desc = "txt_vehicle_type_disable_desc";

  @JsonKey(
      name: 'txt_no_subscription_plan_found',
      defaultValue: "txt_no_subscription_plan_found")
  String txtNoSubscriptionPlanFound = "txt_no_subscription_plan_found";

  @JsonKey(
      name: 'txt_are_you_sure_to_subscribe',
      defaultValue: "txt_are_you_sure_to_subscribe")
  String txtAreYouSureToSubscribe = "txt_are_you_sure_to_subscribe";

  @JsonKey(name: 'txt_choose_your_plan', defaultValue: "txt_choose_your_plan")
  String txtChooseYourPlan = "txt_choose_your_plan";

  @JsonKey(name: 'txt_valid_for', defaultValue: "txt_valid_for")
  String txtValidFor = "txt_valid_for";

  @JsonKey(name: 'txt_choose_plan', defaultValue: "txt_choose_plan")
  String txtChoosePlan = "txt_choose_plan";

  @JsonKey(name: 'txt_subscription', defaultValue: "txt_subscription")
  String txtSubscription = "txt_subscription";

  @JsonKey(name: 'txt_subscription_plan', defaultValue: "txt_subscription_plan")
  String txtSubscriptionPlan = "txt_subscription_plan";

  @JsonKey(
      name: 'txt_subscription_remaining_days',
      defaultValue: "txt_subscription_remaining_days")
  String txtSubscriptionRemainingDays = "txt_subscription_remaining_days";

  @JsonKey(name: 'txt_subscribe', defaultValue: "txt_subscribe")
  String txtSubscribe = "txt_subscribe";

  @JsonKey(name: 'txt_plan', defaultValue: "txt_plan")
  String txtPlan = "txt_plan";

  @JsonKey(name: 'txt_days', defaultValue: "txt_days")
  String txtDays = "txt_days";

  @JsonKey(name: 'txtMinShort', defaultValue: "txtMinShort")
  String txtMinShort = "txtMinShort";

  @JsonKey(name: 'txtpayment', defaultValue: "txtpayment")
  String txtpayment = "txtpayment";

  @JsonKey(name: 'txtHrShort', defaultValue: "txtHrShort")
  String txtHrShort = "txtHrShort";

  @JsonKey(name: 'txt_joined_date', defaultValue: "txt_joined_date")
  String txt_joined_date = "txt_joined_date";

  @JsonKey(name: 'txtManageRides', defaultValue: "txtManageRides")
  String txtManageRides = "txtManageRides";

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

  @JsonKey(name: 'txt_select_vehicle', defaultValue: "txt_select_vehicle")
  String txtSelectVehicle = "txt_select_vehicle";

  @JsonKey(name: 'txt_Ok', defaultValue: "txt_Ok")
  String txt_Ok = "txt_Ok";

  @JsonKey(
      name: 'txt_Choose_Your_Language',
      defaultValue: "txt_Choose_Your_Language")
  String txt_Choose_Your_Language = "txt_Choose_Your_Language";

  @JsonKey(
      name: 'txt_Choose_Your_Language_head',
      defaultValue: "txt_Choose_Your_Language_head")
  String txt_Choose_Your_Language_head = "txt_Choose_Your_Language_head";

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

  @JsonKey(name: 'txt_terms_of_services', defaultValue: "txt_terms_of_services")
  String txt_terms_of_services = "txt_terms_of_services";

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

  @JsonKey(name: 'txt_next', defaultValue: "txt_next")
  String txtNext = "txt_next";

  @JsonKey(name: 'txt_Name', defaultValue: "txt_Name")
  String txt_Name = "txt_Name";

  @JsonKey(name: 'txt_Name_is_invalid', defaultValue: "txt_Name_is_invalid")
  String txt_Name_is_invalid = "txt_Name_is_invalid";

  @JsonKey(name: 'txt_Email_invalid', defaultValue: "txt_Email_invalid")
  String txt_Email_invalid = "txt_Email_invalid";

  @JsonKey(
      name: 'txt_Service_location_is_required',
      defaultValue: "txt_Service_location_is_required")
  String txt_Service_location_is_required = "txt_Service_location_is_required";

  @JsonKey(name: 'txt_Email', defaultValue: "txt_Email")
  String txt_Email = "txt_Email";

  @JsonKey(name: 'txt_Email_optional', defaultValue: "txt_Email_optional")
  String txt_Email_optional = "txt_Email_optional";

  @JsonKey(name: 'txt_referral_optional', defaultValue: "txt_referral_optional")
  String txt_referral_optional = "txt_referral_optional";

  @JsonKey(
      name: 'txt_Vehicle_Information', defaultValue: "txt_Vehicle_Information")
  String txt_Vehicle_Information = "txt_Vehicle_Information";

  @JsonKey(name: 'txt_Vehicle_model', defaultValue: "txt_Vehicle_model")
  String txt_Vehicle_model = "txt_Vehicle_model";

  @JsonKey(
      name: 'txt_Select_vehicle_model',
      defaultValue: "txt_Select_vehicle_model")
  String txt_Select_vehicle_model = "txt_Select_vehicle_model";

  @JsonKey(name: 'txt_Service_type', defaultValue: "txt_Service_type")
  String txt_Service_type = "txt_Service_type";

  @JsonKey(
      name: 'txt_Select_service_type', defaultValue: "txt_Select_service_type")
  String txt_Select_service_type = "txt_Select_service_type";

  @JsonKey(name: 'txt_Submit', defaultValue: "txt_Submit")
  String txt_Submit = "txt_Submit";

  @JsonKey(
      name: 'txt_location_denied_description',
      defaultValue: "txt_location_denied_description")
  String txt_location_denied_description = "txt_location_denied_description";

  @JsonKey(
      name: 'txt_system_alert_denied_description',
      defaultValue: "txt_system_alert_denied_description")
  String txt_system_alert_denied_description =
      "txt_system_alert_denied_description";

  @JsonKey(
      name: 'txt_system_window_permission_description',
      defaultValue: "txt_system_window_permission_description")
  String txt_system_window_permission_description =
      "txt_system_window_permission_description";

  @JsonKey(
      name: 'txt_Secondary_location', defaultValue: "txt_Secondary_location")
  String txt_Secondary_location = "txt_Secondary_location";

  @JsonKey(
      name: 'txt_Select_secondary_location',
      defaultValue: "txt_Select_secondary_location")
  String txt_Select_secondary_location = "txt_Select_secondary_location";

  @JsonKey(name: 'txt_Category', defaultValue: "txt_Category")
  String txt_Category = "txt_Category";

  @JsonKey(name: 'txt_Individual', defaultValue: "txt_Individual")
  String txt_Individual = "txt_Individual";

  @JsonKey(name: 'txt_Company', defaultValue: "txt_Company")
  String txt_Company = "txt_Company";

  @JsonKey(name: 'txt_Select_company', defaultValue: "txt_Select_company")
  String txt_Select_company = "txt_Select_company";

  @JsonKey(name: 'txt_Register', defaultValue: "txt_Register")
  String txt_Register = "txt_Register";

  @JsonKey(
      name: 'txt_Primary_zone_is_required',
      defaultValue: "txt_Primary_zone_is_required")
  String txt_Primary_zone_is_required = "txt_Primary_zone_is_required";

  @JsonKey(
      name: 'txt_Secondary_location_required',
      defaultValue: "txt_Secondary_location_required")
  String txt_Secondary_location_required = "txt_Secondary_location_required";

  @JsonKey(name: 'txt_Company_required', defaultValue: "txt_Company_required")
  String txt_Company_required = "txt_Company_required";

  @JsonKey(
      name: 'txt_Vehicle_type_required',
      defaultValue: "txt_Vehicle_type_required")
  String txt_Vehicle_type_required = "txt_Vehicle_type_required";

  @JsonKey(
      name: 'txt_Vehicle_model_required',
      defaultValue: "txt_Vehicle_model_required")
  String txt_Vehicle_model_required = "txt_Vehicle_model_required";

  @JsonKey(
      name: 'txt_Please_select_vehicle_variant',
      defaultValue: "txt_Please_select_vehicle_variant")
  String txt_Please_select_vehicle_variant =
      "txt_Please_select_vehicle_variant";

  @JsonKey(
      name: 'txt_Select_category_types',
      defaultValue: "txt_Select_category_types")
  String txt_Select_category_types = "txt_Select_category_types";

  @JsonKey(name: 'txt_Vehicle_Variant', defaultValue: "txt_Vehicle_Variant")
  String txt_Vehicle_Variant = "txt_Vehicle_Variant";

  @JsonKey(
      name: 'txt_Vehicle_brand_required',
      defaultValue: "txt_Vehicle_brand_required")
  String txt_Vehicle_brand_required = "txt_Vehicle_brand_required";

  @JsonKey(name: 'txt_Vehicle_Brand', defaultValue: "txt_Vehicle_Brand")
  String txt_Vehicle_Brand = "txt_Vehicle_Brand";

  @JsonKey(
      name: 'txt_Vehicle_number_required',
      defaultValue: "txt_Vehicle_number_required")
  String txt_Vehicle_number_required = "txt_Vehicle_number_required";

  @JsonKey(name: 'txt_Vehicle_number', defaultValue: "txt_Vehicle_number")
  String txt_Vehicle_number = "txt_Vehicle_number";

  @JsonKey(
      name: 'txt_Service_type_required',
      defaultValue: "txt_Service_type_required")
  String txt_Service_type_required = "txt_Service_type_required";

  @JsonKey(
      name: 'txt_Thanks_for_your_time',
      defaultValue: "txt_Thanks_for_your_time")
  String txt_Thanks_for_your_time = "txt_Thanks_for_your_time";

  @JsonKey(
      name: 'txt_document_not_uploaded_title',
      defaultValue: "txt_document_not_uploaded_title")
  String txt_document_not_uploaded_title = "txt_document_not_uploaded_title";

  @JsonKey(
      name: 'txt_document_not_uploaded_description',
      defaultValue: "txt_document_not_uploaded_description")
  String txt_document_not_uploaded_description =
      "txt_document_not_uploaded_description";

  @JsonKey(name: 'txt_Upload_documents', defaultValue: "txt_Upload_documents")
  String txt_Upload_documents = "txt_Upload_documents";

  @JsonKey(name: 'txt_Documents', defaultValue: "txt_Documents")
  String txt_Documents = "txt_Documents";

  @JsonKey(
      name: 'txt_Please_fill_required_steps',
      defaultValue: "txt_Please_fill_required_steps")
  String txt_Please_fill_required_steps = "txt_Please_fill_required_steps";

  @JsonKey(name: 'txt_Expired', defaultValue: "txt_Expired")
  String txt_Expired = "txt_Expired";

  @JsonKey(name: 'txt_number', defaultValue: "txt_number")
  String txt_number = "txt_number";

  @JsonKey(name: 'txt_Upload', defaultValue: "txt_Upload")
  String txt_Upload = "txt_Upload";

  @JsonKey(name: 'txt_Issue_Date', defaultValue: "txt_Issue_Date")
  String txt_Issue_Date = "txt_Issue_Date";

  @JsonKey(name: 'txt_Expiry_Date', defaultValue: "txt_Expiry_Date")
  String txt_Expiry_Date = "txt_Expiry_Date";

  @JsonKey(name: 'txt_image', defaultValue: "txt_image")
  String txt_image = "txt_image";

  @JsonKey(name: 'txt_Gallery', defaultValue: "txt_Gallery")
  String txt_Gallery = "txt_Gallery";

  @JsonKey(name: 'txt_Take_Photo', defaultValue: "txt_Take_Photo")
  String txt_Take_Photo = "txt_Take_Photo";

  @JsonKey(
      name: 'txt_Gallery_permission_permanently_denied_desc',
      defaultValue: "txt_Gallery_permission_permanently_denied_desc")
  String txt_Gallery_permission_permanently_denied_desc =
      "txt_Gallery_permission_permanently_denied_desc";

  @JsonKey(
      name: 'txt_Gallery_permission_denied_desc',
      defaultValue: "txt_Gallery_permission_denied_desc")
  String txt_Gallery_permission_denied_desc =
      "txt_Gallery_permission_denied_desc";

  @JsonKey(
      name: 'txt_DocumentId_required', defaultValue: "txt_DocumentId_required")
  String txt_DocumentId_required = "txt_DocumentId_required";
  @JsonKey(
      name: 'txt_Issue_date_required', defaultValue: "txt_Issue_date_required")
  String txt_Issue_date_required = "txt_Issue_date_required";

  @JsonKey(
      name: 'txt_Expiry_date_required',
      defaultValue: "txt_Expiry_date_required")
  String txt_Expiry_date_required = "txt_Expiry_date_required";

  @JsonKey(name: 'txt_Issue_date_error', defaultValue: "txt_Issue_date_error")
  String txt_Issue_date_error = "txt_Issue_date_error";

  @JsonKey(
      name: 'txt_image_not_uploaded', defaultValue: "txt_image_not_uploaded")
  String txt_image_not_uploaded = "txt_image_not_uploaded";

  @JsonKey(
      name: 'txt_camera_permission_denied',
      defaultValue: "txt_camera_permission_denied")
  String txt_camera_permission_denied = "txt_camera_permission_denied";

  @JsonKey(
      name: 'txt_camera_permission_permanently_denied',
      defaultValue: "txt_camera_permission_permanently_denied")
  String txt_camera_permission_permanently_denied =
      "txt_camera_permission_permanently_denied";

  @JsonKey(
      name: 'txt_Waiting_for_approval',
      defaultValue: "txt_Waiting_for_approval")
  String txt_Waiting_for_approval = "txt_Waiting_for_approval";

  @JsonKey(
      name: 'txt_waiting_for_approval_desc',
      defaultValue: "txt_waiting_for_approval_desc")
  String txt_waiting_for_approval_desc = "txt_waiting_for_approval_desc";

  @JsonKey(
      name: 'txt_camera_permanently_denied_desc',
      defaultValue: "txt_camera_permanently_denied_desc")
  String txt_camera_permanently_denied_desc =
      "txt_camera_permanently_denied_desc";

  @JsonKey(
      name: 'txt_camera_permission_denied_desc',
      defaultValue: "txt_camera_permission_denied_desc")
  String txt_camera_permission_denied_desc =
      "txt_camera_permission_denied_desc";

  @JsonKey(
      name: 'txt_Opening_camera_failed',
      defaultValue: "txt_Opening_camera_failed")
  String txt_Opening_camera_failed = "txt_Opening_camera_failed";

  @JsonKey(
      name: 'txt_Something_went_wrong',
      defaultValue: "txt_Something_went_wrong")
  String txt_Something_went_wrong = "txt_Something_went_wrong";

  @JsonKey(name: 'txt_Call_admin', defaultValue: "txt_Call_admin")
  String txt_Call_admin = "txt_Call_admin";

  @JsonKey(name: 'Txt_Continue', defaultValue: "Txt_Continue")
  String Txt_Continue = "Txt_Continue";

  @JsonKey(
      name: 'txt_Phone_number_required',
      defaultValue: "txt_Phone_number_required")
  String txt_Phone_number_required = "txt_Phone_number_required";

  @JsonKey(
      name: 'txt_Phone_number_invalid',
      defaultValue: "txt_Phone_number_invalid")
  String txt_Phone_number_invalid = "txt_Phone_number_invalid";

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

  @JsonKey(name: 'txt_Service_location', defaultValue: "txt_Service_location")
  String txt_Service_location = "txt_Service_location";

  @JsonKey(
      name: 'txt_Document_denied_title',
      defaultValue: "txt_Document_denied_title")
  String txt_Document_denied_title = "txt_Document_denied_title";

  @JsonKey(
      name: 'txt_Document_denied_description',
      defaultValue: "txt_Document_denied_description")
  String txt_Document_denied_description = "txt_Document_denied_description";

  @JsonKey(name: 'txt_Denied', defaultValue: "txt_Denied")
  String txt_Denied = "txt_Denied";

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
      name: 'txt_Document_expired_title',
      defaultValue: "txt_Document_expired_title")
  String txt_Document_expired_title = "txt_Document_expired_title";

  @JsonKey(
      name: 'txt_Document_expired_description',
      defaultValue: "txt_Document_expired_description")
  String txt_Document_expired_description = "txt_Document_expired_description";

  @JsonKey(name: 'txt_expired', defaultValue: "txt_expired")
  String txt_expired = "txt_expired";

  //new
  @JsonKey(name: 'txt_Accept', defaultValue: "txt_Accept")
  String txt_Accept = "txt_Accept";

  @JsonKey(name: 'txt_Slide_to_reject', defaultValue: "txt_Slide_to_reject")
  String txt_Slide_to_reject = "txt_Slide_to_reject";

  @JsonKey(
      name: 'txt_Location_denied_description',
      defaultValue: "txt_Location_denied_description")
  String txt_Location_denied_description = "txt_Location_denied_description";

  @JsonKey(
      name: 'txt_Location_permission_is_permanently_denied_ios',
      defaultValue: "txt_Location_permission_is_permanently_denied_ios")
  String txt_Location_permission_is_permanently_denied_ios =
      "txt_Location_permission_is_permanently_denied_ios";

  @JsonKey(name: 'txt_Arrived', defaultValue: "txt_Arrived")
  String txt_Arrived = "txt_Arrived";

  @JsonKey(
      name: 'txt_meter_image_not_uploaded',
      defaultValue: "txt_meter_image_not_uploaded")
  String txt_meter_image_not_uploaded = "txt_meter_image_not_uploaded";

  @JsonKey(name: 'txt_enter_meter_value', defaultValue: "txt_enter_meter_value")
  String txt_enter_meter_value = "txt_enter_meter_value";

  @JsonKey(
      name: 'txt_press_again_to_exit', defaultValue: "txt_press_again_to_exit")
  String txt_press_again_to_exit = "txt_press_again_to_exit";

  @JsonKey(name: 'txt_booking_id', defaultValue: "txt_booking_id")
  String txtBookingId = "txt_booking_id";

  @JsonKey(name: 'txt_total', defaultValue: "txt_total")
  String txtTotal = "txt_total";

  @JsonKey(name: 'txt_book_again', defaultValue: "txt_book_again")
  String txt_book_again = "txt_book_again";

  @JsonKey(name: 'txt_cancelled', defaultValue: "txt_cancelled")
  String txt_cancelled = "txt_cancelled";

  @JsonKey(name: 'txt_no_data_found', defaultValue: "txt_no_data_found")
  String txt_no_data_found = "txt_no_data_found";

  @JsonKey(
      name: 'txt_total_fare_by_cash', defaultValue: "txt_total_fare_by_cash")
  String txtTotalFareByCash = "txt_total_fare_by_cash";

  @JsonKey(name: 'txt_base_fare', defaultValue: "txt_base_fare")
  String txtBaseFare = "txt_base_fare";

  @JsonKey(name: 'txt_distance_cost', defaultValue: "txt_distance_cost")
  String txtDistanceCost = "txt_distance_cost";

  @JsonKey(name: 'txt_time_cost', defaultValue: "txt_time_cost")
  String txtTimeCost = "txt_time_cost";

  @JsonKey(name: 'txt_referral_bonus', defaultValue: "txt_referral_bonus")
  String txtReferralBonus = "txt_referral_bonus";

  @JsonKey(name: 'txt_promo_bonus', defaultValue: "txt_promo_bonus")
  String txtPromoBonus = "txt_promo_bonus";

  @JsonKey(name: 'txt_service_tax', defaultValue: "txt_service_tax")
  String txtServiceTax = "txt_service_tax";

  @JsonKey(name: 'txt_total_fare_amount', defaultValue: "txt_total_fare_amount")
  String txtTotalFareAmount = "txt_total_fare_amount";

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

  @JsonKey(name: 'txt_information', defaultValue: "txt_information")
  String txtInformation = "txt_information";

  @JsonKey(name: 'txt_vehicle_details', defaultValue: "txt_vehicle_details")
  String txtVehicleDetails = "txt_vehicle_details";

  @JsonKey(name: 'txt_vehicle_type', defaultValue: "txt_vehicle_type")
  String txtVehicleType = "txt_vehicle_type";

  @JsonKey(name: 'txt_zone_name', defaultValue: "txt_zone_name")
  String txtZoneName = "txt_zone_name";

  @JsonKey(name: 'txt_profile_details', defaultValue: "txt_profile_details")
  String txtProfileDetails = "txt_profile_details";

  @JsonKey(name: 'txt_sort_order', defaultValue: "txt_sort_order")
  String txtSortOrder = "txt_sort_order";

  @JsonKey(name: 'txt_no_records_found', defaultValue: "txt_no_records_found")
  String txtNoRecordsFound = "txt_no_records_found";

  @JsonKey(name: 'txt_wallet', defaultValue: "txt_wallet")
  String txtWallet = "txt_wallet";

  @JsonKey(name: 'txt_available_balance', defaultValue: "txt_available_balance")
  String txtAvailableBalance = "txt_available_balance";

  @JsonKey(
      name: 'txt_transaction_history', defaultValue: "txt_transaction_history")
  String txtTransactionHistory = "txt_transaction_history";

  @JsonKey(
      name: 'txt_end_km_must_be_greater_than_start_km',
      defaultValue: "txt_end_km_must_be_greater_than_start_km")
  String txtEndKmMustBeGreaterThanStartKm =
      "txt_end_km_must_be_greater_than_start_km";

  @JsonKey(name: 'txt_actions', defaultValue: "txt_actions")
  String txtActions = "txt_actions";

  @JsonKey(name: 'txt_recharge', defaultValue: "txt_recharge")
  String txtRecharge = "txt_recharge";

  @JsonKey(name: 'txt_my_rides', defaultValue: "txt_my_rides")
  String txtMyRides = "txt_my_rides";

  @JsonKey(name: 'txt_scheduled', defaultValue: "txt_scheduled")
  String txtScheduled = "txt_scheduled";

  @JsonKey(name: 'txt_completed', defaultValue: "txt_completed")
  String txtCompleted = "txt_completed";

  @JsonKey(name: 'txt_todays_status', defaultValue: "txt_todays_status")
  String txtTodaysStatus = "txt_todays_status";

  @JsonKey(name: 'txt_earnings', defaultValue: "txt_earnings")
  String txtEarnings = "txt_earnings";

  @JsonKey(name: 'txt_you_are_offline', defaultValue: "txt_you_are_offline")
  String txtYouAreOffline = "txt_you_are_offline";

  @JsonKey(
      name: 'txt_go_online_to_earn_money',
      defaultValue: "txt_go_online_to_earn_money")
  String txtGoOnlineToEarnMoney = "txt_go_online_to_earn_money";

  @JsonKey(name: 'txt_online', defaultValue: "txt_online")
  String txtOnline = "txt_online";

  @JsonKey(name: 'txt_offline', defaultValue: "txt_offline")
  String txtOffline = "txt_offline";

  @JsonKey(name: 'txt_referral_code', defaultValue: "txt_referral_code")
  String txtReferralCode = "txt_referral_code";

  @JsonKey(name: 'txt_invite_friends', defaultValue: "txt_invite_friends")
  String txtInviteFriends = "txt_invite_friends";

  @JsonKey(
      name: 'txt_invite_friends_and_families_to_earn',
      defaultValue: "txt_invite_friends_and_families_to_earn")
  String txtInviteFriendsAndFamiliesToEarn =
      "txt_invite_friends_and_families_to_earn";

  @JsonKey(
      name: 'txt_total_referral_amount',
      defaultValue: "txt_total_referral_amount")
  String txtTotalReferralAmount = "txt_total_referral_amount";

  @JsonKey(name: 'txt_claim', defaultValue: "txt_claim")
  String txtClaim = "txt_claim";

  @JsonKey(name: 'txt_share', defaultValue: "txt_share")
  String txtShare = "txt_share";

  @JsonKey(
      name: 'txt_your_referral_code', defaultValue: "txt_your_referral_code")
  String txtYourReferralCode = "txt_your_referral_code";

  @JsonKey(name: 'txt_notification', defaultValue: "txt_notification")
  String txtNotification = "txt_notification";

  @JsonKey(
      name: 'txt_no_notification_found',
      defaultValue: "txt_no_notification_found")
  String txtNoNotificationFound = "txt_no_notification_found";

  @JsonKey(name: 'txt_support', defaultValue: "txt_support")
  String txtSupport = "txt_support";

  @JsonKey(name: 'txt_complaint', defaultValue: "txt_complaint")
  String txtComplaint = "txt_complaint";

  @JsonKey(name: 'txt_faq', defaultValue: "txt_faq")
  String txtfaq = "txt_faq";

  @JsonKey(name: 'txt_admin', defaultValue: "txt_admin")
  String txtAdmin = "txt_admin";

  @JsonKey(name: 'txt_need_any_support', defaultValue: "txt_need_any_support")
  String txtNeedAnySupport = "txt_need_any_support";

  @JsonKey(name: 'txt_home', defaultValue: "txt_home")
  String txtHome = "txt_home";

  @JsonKey(name: 'txt_my_profile', defaultValue: "txt_my_profile")
  String txtMyProfile = "txt_my_profile";

  @JsonKey(name: 'txt_dashboard', defaultValue: "txt_dashboard")
  String txtDashboard = "txt_dashboard";

  @JsonKey(name: 'txt_referral', defaultValue: "txt_referral")
  String txtReferral = "txt_referral";

  @JsonKey(name: 'txt_language', defaultValue: "txt_language")
  String txtLanguage = "txt_language";

  @JsonKey(name: 'txt_logout', defaultValue: "txt_logout")
  String txtLogout = "txt_logout";

  @JsonKey(
      name: 'txt_are_you_sure_to_logout',
      defaultValue: "txt_are_you_sure_to_logout")
  String txtAreYouSureToLogout = "txt_are_you_sure_to_logout";

  @JsonKey(name: 'txt_waiting_time', defaultValue: "txt_waiting_time")
  String txtWaitingTime = "txt_waiting_time";

  @JsonKey(name: 'txt_trip_time', defaultValue: "txt_trip_time")
  String txtTripTime = "txt_trip_time";

  @JsonKey(name: 'txt_distance', defaultValue: "txt_distance")
  String txtDistance = "txt_distance";

  @JsonKey(name: 'txt_map', defaultValue: "txt_map")
  String txtMap = "txt_map";

  @JsonKey(name: 'txt_upload_end_meter', defaultValue: "txt_upload_end_meter")
  String txtUploadEndMeter = "txt_upload_end_meter";

  @JsonKey(name: 'txt_slide_to_end_trip', defaultValue: "txt_slide_to_end_trip")
  String txtSlideToEndTrip = "txt_slide_to_end_trip";

  @JsonKey(name: 'txt_slide_to_cancel', defaultValue: "txt_slide_to_cancel")
  String txtSlideToCancel = "txt_slide_to_cancel";

  @JsonKey(name: 'txt_start_trip', defaultValue: "txt_start_trip")
  String txtStartTrip = "txt_start_trip";

  @JsonKey(
      name: 'txt_upload_start_meter', defaultValue: "txt_upload_start_meter")
  String txtUploadStartMeter = "txt_upload_start_meter";

  @JsonKey(name: 'txt_cancel_this_ride', defaultValue: "txt_cancel_this_ride")
  String txtCancelThisRide = "txt_cancel_this_ride";

  @JsonKey(
      name: 'txt_cancellation_charge_might_be_applied',
      defaultValue: "txt_cancellation_charge_might_be_applied")
  String txtCancellationChargeMightBeApplied =
      "txt_cancellation_charge_might_be_applied";

  @JsonKey(name: 'txt_keep_the_booking', defaultValue: "txt_keep_the_booking")
  String txtKeepTheBooking = "txt_keep_the_booking";

  @JsonKey(name: 'txt_cancel_ride', defaultValue: "txt_cancel_ride")
  String txtCancelRide = "txt_cancel_ride";

  @JsonKey(
      name: 'txt_please_select_any_reason_for_cancellation',
      defaultValue: "txt_please_select_any_reason_for_cancellation")
  String txtPleaseSelectAnyReasonForCancellation =
      "txt_please_select_any_reason_for_cancellation";

  @JsonKey(
      name: 'txt_enter_the_demo_key_description',
      defaultValue: "txt_enter_the_demo_key_description")
  String txtEnterTheDemoKeyDescription = "txt_enter_the_demo_key_description";

  @JsonKey(name: 'txt_demo_key', defaultValue: "txt_demo_key")
  String txtDemoKey = "txt_demo_key";

  @JsonKey(name: 'txt_enter_demo_key', defaultValue: "txt_enter_demo_key")
  String txtEnterDemoKey = "txt_enter_demo_key";

  @JsonKey(name: 'txt_purpose', defaultValue: "txt_purpose")
  String txt_purpose = "txt_purpose";

  @JsonKey(name: 'txt_amount', defaultValue: "txt_amount")
  String txt_amount = "txt_amount";

  @JsonKey(name: 'txt_Invalid_demo_key', defaultValue: "txt_Invalid_demo_key")
  String txtInvalidDemoKey = "txt_Invalid_demo_key";

  @JsonKey(
      name: 'txt_demo_key_is_expired', defaultValue: "txt_demo_key_is_expired")
  String txtDemoKeyIsExpired = "txt_demo_key_is_expired";

  @JsonKey(
      name: 'txt_location_change_request',
      defaultValue: "txt_location_change_request")
  String txtLocationChangeRequest = "txt_location_change_request";

  @JsonKey(
      name: 'txt_pickup_address_change_description',
      defaultValue: "txt_pickup_address_change_description")
  String txtPickupAddressChangeDescription =
      "txt_pickup_address_change_description";

  @JsonKey(
      name: 'txt_drop_address_change_description',
      defaultValue: "txt_drop_address_change_description")
  String txtDropAddressChangeDescription =
      "txt_drop_address_change_description";

  @JsonKey(
      name: 'txt_stop_address_change_description',
      defaultValue: "txt_stop_address_change_description")
  String txtStopAddressChangeDescription =
      "txt_stop_address_change_description";

  @JsonKey(name: 'txt_yes', defaultValue: "txt_yes")
  String txtYes = "txt_yes";

  @JsonKey(name: 'txt_no', defaultValue: "txt_no")
  String txtNo = "txt_no";

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

  @JsonKey(name: 'txt_payment_methods', defaultValue: "txt_payment_methods")
  String txt_payment_methods = "txt_payment_methods";

  @JsonKey(
      name: 'txt_add_payment_method', defaultValue: "txt_add_payment_method")
  String txt_add_payment_method = "txt_add_payment_method";

  @JsonKey(name: 'txt_name', defaultValue: "txt_name")
  String txt_name = "txt_name";

  @JsonKey(name: 'txt_recharge_wallet', defaultValue: "txt_recharge_wallet")
  String txt_recharge_wallet = "txt_recharge_wallet";

  @JsonKey(name: 'txt_enter_amount', defaultValue: "txt_enter_amount")
  String txt_enter_amount = "txt_enter_amount";

  @JsonKey(name: 'txt_add_case', defaultValue: "txt_add_case")
  String txt_add_case = "txt_add_case";

  @JsonKey(name: 'txt_phone_number', defaultValue: "txt_phone_number")
  String txt_phone_number = "txt_phone_number";

  @JsonKey(name: 'txt_Terms_of_Service', defaultValue: "txt_Terms_of_Service")
  String txt_Terms_of_Service = "txt_Terms_of_Service";

  @JsonKey(name: 'txt_trip_count', defaultValue: "txt_trip_count")
  String txt_trip_count = "txt_trip_count";

  @JsonKey(name: 'txt_income', defaultValue: "txt_income")
  String txt_income = "txt_income";

  @JsonKey(name: 'txt_sos', defaultValue: "txt_sos")
  String txt_sos = "txt_sos";

  @JsonKey(name: 'txt_Disable', defaultValue: "txt_Disable")
  String txt_Disable = "txt_Disable";

  @JsonKey(name: 'txt_oops', defaultValue: "txt_oops")
  String txt_oops = "txt_oops";

  @JsonKey(
      name: 'txt_Please_disable_Battery_Optimization',
      defaultValue: "txt_Please_disable_Battery_Optimization")
  String txt_Please_disable_Battery_Optimization =
      "txt_Please_disable_Battery_Optimization";

  @JsonKey(
      name: 'txt_Battery_Optimization_is_enabled',
      defaultValue: "txt_Battery_Optimization_is_enabled")
  String txt_Battery_Optimization_is_enabled =
      "txt_Battery_Optimization_is_enabled";

  @JsonKey(
      name: 'txt_Battery_Optimization',
      defaultValue: "txt_Battery_Optimization")
  String txt_Battery_Optimization = "txt_Battery_Optimization";

  @JsonKey(name: 'txt_GPS_is_disabled', defaultValue: "txt_GPS_is_disabled")
  String txt_GPS_is_disabled = "txt_GPS_is_disabled";

  @JsonKey(name: 'txt_GPS_is_enabled', defaultValue: "txt_GPS_is_enabled")
  String txt_GPS_is_enabled = "txt_GPS_is_enabled";

  @JsonKey(name: 'txt_Network', defaultValue: "txt_Network")
  String txt_Network = "txt_Network";

  @JsonKey(name: 'txt_Gps', defaultValue: "txt_Gps")
  String txt_Gps = "txt_Gps";

  @JsonKey(
      name: 'txt_You_have_slow_internet_connection',
      defaultValue: "txt_You_have_slow_internet_connection")
  String txt_You_have_slow_internet_connection =
      "txt_You_have_slow_internet_connection";

  @JsonKey(
      name: 'txt_You_are_connected_to_the_internet',
      defaultValue: "txt_You_are_connected_to_the_internet")
  String txt_You_are_connected_to_the_internet =
      "txt_You_are_connected_to_the_internet";

  @JsonKey(name: 'txt_Network_status', defaultValue: "txt_Network_status")
  String txt_Network_status = "txt_Network_status";

  @JsonKey(name: 'txt_Last_Updated_At', defaultValue: "txt_Last_Updated_At")
  String txt_Last_Updated_At = "txt_Last_Updated_At";

  @JsonKey(name: 'txt_app_status', defaultValue: "txt_app_status")
  String txt_app_status = "txt_app_status";

  @JsonKey(name: 'txt_current_month', defaultValue: "txt_current_month")
  String txt_current_month = "txt_current_month";

  @JsonKey(name: 'txt_Earnings', defaultValue: "txt_Earnings")
  String txt_Earnings = "txt_Earnings";

  @JsonKey(name: 'txt_Trips', defaultValue: "txt_Trips")
  String txt_Trips = "txt_Trips";

  @JsonKey(name: 'txt_Trip', defaultValue: "txt_Trip")
  String txt_Trip = "txt_Trip";

  @JsonKey(name: 'txt_Previous_Month', defaultValue: "txt_Previous_Month")
  String txt_Previous_Month = "txt_Previous_Month";

  @JsonKey(
      name: 'txt_Total_Earnings_of_the_Week',
      defaultValue: "txt_Total_Earnings_of_the_Week")
  String txt_Total_Earnings_of_the_Week = "txt_Total_Earnings_of_the_Week";

  @JsonKey(name: 'txt_Today_s', defaultValue: "txt_Today_s")
  String txt_Today_s = "txt_Today_s";

  @JsonKey(name: 'txt_Yesterday_s', defaultValue: "txt_Yesterday_s")
  String txt_Yesterday_s = "txt_Yesterday_s";

  @JsonKey(name: 'txt_Current_Week', defaultValue: "txt_Current_Week")
  String txt_Current_Week = "txt_Current_Week";

  @JsonKey(name: 'txt_Send', defaultValue: "txt_Send")
  String txt_Send = "txt_Send";

  @JsonKey(name: 'txt_edit', defaultValue: "txt_edit")
  String txt_edit = "txt_edit";

  @JsonKey(
      name: 'txt_enter_meter_desc_uplode',
      defaultValue: "txt_enter_meter_desc_uplode")
  String txt_enter_meter_desc_uplode = "txt_enter_meter_desc_uplode";

  @JsonKey(name: 'txt_meter_proceed', defaultValue: "txt_meter_proceed")
  String txt_meter_proceed = "txt_meter_proceed";

  @JsonKey(name: 'txt_TaxiAppz_Driver', defaultValue: "txt_TaxiAppz_Driver")
  String txt_TaxiAppz_Driver = "txt_TaxiAppz_Driver";

  @JsonKey(name: 'txt_Start_Trip', defaultValue: "txt_Start_Trip")
  String txt_Start_Trip = "txt_Start_Trip";

  @JsonKey(
      name: 'txt_Enter_OTP_for_ride', defaultValue: "txt_Enter_OTP_for_ride")
  String txt_Enter_OTP_for_ride = "txt_Enter_OTP_for_ride";

  @JsonKey(name: 'txt_Enter_OTP', defaultValue: "txt_Enter_OTP")
  String txt_Enter_OTP = "txt_Enter_OTP";

  @JsonKey(name: 'txt_cancel', defaultValue: "txt_cancel")
  String txt_cancel = "txt_cancel";

  @JsonKey(
      name: 'txt_Pickup_Location_changed',
      defaultValue: "txt_Pickup_Location_changed")
  String txt_Pickup_Location_changed = "txt_Pickup_Location_changed";

  @JsonKey(
      name: 'txt_customer_details_share',
      defaultValue: "txt_customer_details_share")
  String txt_customer_details_share = "txt_customer_details_share";

  @JsonKey(name: 'txt_Call_to_Customer', defaultValue: "txt_Call_to_Customer")
  String txt_Call_to_Customer = "txt_Call_to_Customer";

  @JsonKey(name: 'txt_assigned', defaultValue: "txt_assigned")
  String txt_assigned = "txt_assigned";

  @JsonKey(name: 'txt_not_assigned', defaultValue: "txt_not_assigned")
  String txt_not_assigned = "txt_not_assigned";

  @JsonKey(name: 'txt_time_to_update', defaultValue: "txt_time_to_update")
  String txt_time_to_update = "txt_time_to_update";

  @JsonKey(
      name: 'txt_time_to_update_desc', defaultValue: "txt_time_to_update_desc")
  String txt_time_to_update_desc = "txt_time_to_update_desc";

  @JsonKey(name: 'txt_update', defaultValue: "txt_update")
  String txt_update = "txt_update";

  @JsonKey(name: 'txt_try_again', defaultValue: "txt_try_again")
  String txtTryAgain = "txt_try_again";

  @JsonKey(name: 'txt_reason', defaultValue: "txt_reason")
  String txtReason = "txt_reason";

  @JsonKey(name: 'txt_Cancelled_By', defaultValue: "txt_Cancelled_By")
  String txtCancelledBy = "txt_Cancelled_By";

  @JsonKey(name: 'txt_delete_account', defaultValue: "txt_delete_account")
  String txt_delete_account = "txt_delete_account";

  @JsonKey(name: 'txt_delete_success', defaultValue: "txt_delete_success")
  String txt_delete_success = "txt_delete_success";

  @JsonKey(name: 'txt_delete', defaultValue: "txt_delete")
  String txt_delete = "txt_delete";

  @JsonKey(name: 'txt_card', defaultValue: "txt_card")
  String txt_card = "txt_card";

  @JsonKey(name: 'txt_add', defaultValue: "txt_add")
  String txt_add = "txt_add";

  @JsonKey(name: 'txt_Scheduled_Trip', defaultValue: "txt_Scheduled_Trip")
  String txt_Scheduled_Trip = "txt_Scheduled_Trip";

  @JsonKey(name: 'txt_Invalid_otp', defaultValue: "txt_Invalid_otp")
  String txt_Invalid_otp = "txt_Invalid_otp";

  @JsonKey(
      name: 'txt_Are_you_want_to_cancel_this_ride',
      defaultValue: "txt_Are_you_want_to_cancel_this_ride")
  String txt_Are_you_want_to_cancel_this_ride =
      "txt_Are_you_want_to_cancel_this_ride";

  @JsonKey(
      name: 'txt_A_trip_has_been_assigned_to_you',
      defaultValue: "txt_A_trip_has_been_assigned_to_you")
  String txt_A_trip_has_been_assigned_to_you =
      "txt_A_trip_has_been_assigned_to_you";

  @JsonKey(name: 'txt_Reject', defaultValue: "txt_Reject")
  String txt_Reject = "txt_Reject";

  @JsonKey(
      name: 'txt_Scheduled_Trip_Starts_with',
      defaultValue: "txt_Scheduled_Trip_Starts_with")
  String txt_Scheduled_Trip_Starts_with = "txt_Scheduled_Trip_Starts_with";

  @JsonKey(name: 'txt_Tap_to_Start_trip', defaultValue: "txt_Tap_to_Start_trip")
  String txt_Tap_to_Start_trip = "txt_Tap_to_Start_trip";

  @JsonKey(name: 'txt_minute', defaultValue: "txt_minute")
  String txt_minute = "txt_minute";

  @JsonKey(name: 'txt_away', defaultValue: "txt_away")
  String txt_away = "txt_away";

  @JsonKey(name: 'txt_created', defaultValue: "txt_created")
  String txt_created = "txt_created";

  @JsonKey(name: 'txt_ago', defaultValue: "txt_ago")
  String txt_ago = "txt_ago";

  @JsonKey(name: 'txt_trip_id', defaultValue: "txt_trip_id")
  String txt_trip_id = "txt_trip_id";

  @JsonKey(name: 'txt_View_Details', defaultValue: "txt_View_Details")
  String txt_View_Details = "txt_View_Details";

  @JsonKey(name: 'txt_One_Click_Away', defaultValue: "txt_One_Click_Away")
  String txt_One_Click_Away = "txt_One_Click_Away";

  @JsonKey(
      name: 'txt_Enter_your_meter_reading_to_proceed',
      defaultValue: "txt_Enter_your_meter_reading_to_proceed")
  String txt_Enter_your_meter_reading_to_proceed =
      "txt_Enter_your_meter_reading_to_proceed";

  @JsonKey(
      name: 'txt_upload_the_meter_image_to_start_trip',
      defaultValue: "txt_upload_the_meter_image_to_start_trip")
  String txt_upload_the_meter_image_to_start_trip =
      "txt_upload_the_meter_image_to_start_trip";

  @JsonKey(name: 'txt_no_internet', defaultValue: "txt_no_internet")
  String txt_no_internet = "txt_no_internet";

  @JsonKey(name: 'txt_no_internet_desc', defaultValue: "txt_no_internet_desc")
  String txt_no_internet_desc = "txt_no_internet_desc";

  @JsonKey(name: 'txt_OTP_desc', defaultValue: "txt_OTP_desc")
  String txt_OTP_desc = "txt_OTP_desc";

  @JsonKey(name: 'txt_terms_conditions', defaultValue: "txt_terms_conditions")
  String txt_terms_conditions = "txt_terms_conditions";

  @JsonKey(name: 'txt_continue', defaultValue: "txt_continue")
  String txt_continue = "txt_continue";

  @JsonKey(name: 'txt_clear_all', defaultValue: "txt_clear_all")
  String txt_clear_all = "txt_clear_all";

  @JsonKey(
      name: 'txt_are_you_sure_to_delete',
      defaultValue: "txt_are_you_sure_to_delete")
  String txt_are_you_sure_to_delete = "txt_are_you_sure_to_delete";

  @JsonKey(
      name: 'txt_select_service_location',
      defaultValue: "txt_select_service_location")
  String txt_select_service_location = "txt_select_service_location";

  @JsonKey(name: 'txt_admin_commission', defaultValue: "txt_admin_commission")
  String txtAdminCommission = "txt_admin_commission";

  @JsonKey(
      name: 'txt_get_another_code_in', defaultValue: "txt_get_another_code_in")
  String txtGetAnotherCodeIn = "txt_get_another_code_in";

  @JsonKey(name: 'txt_By_signing_up', defaultValue: "txt_By_signing_up")
  String txt_By_signing_up = "txt_By_signing_up";

  @JsonKey(
      name: 'txt_check_network_connetivity',
      defaultValue: "txt_check_network_connetivity")
  String txt_check_network_connetivity = "txt_check_network_connetivity";

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

  @JsonKey(
      name: 'txt_notification_permission_denied_alert',
      defaultValue: "txt_notification_permission_denied_alert")
  String txtNotificationPermissionDeniedAlert =
      "txt_notification_permission_denied_alert";

  @JsonKey(
      name: 'txt_Company_Vehicle_Information',
      defaultValue: "txt_Company_Vehicle_Information")
  String txt_Company_Vehicle_Information = "txt_Company_Vehicle_Information";

  @JsonKey(name: 'txt_due_amount', defaultValue: "txt_due_amount")
  String txt_due_amount = "txt_due_amount";

  @JsonKey(name: 'txt_your_due_amount', defaultValue: "txt_your_due_amount")
  String yourDueAmount = "txt_your_due_amount";

  @JsonKey(
      name: 'txt_wallet_payment_failed_desc',
      defaultValue: "txt_wallet_payment_failed_desc")
  String txtWalletPaymentFailedDesc = "txt_wallet_payment_failed_desc";

  @JsonKey(
      name: 'txt_user_changed_payment_card_to_cash',
      defaultValue: "txt_user_changed_payment_card_to_cash")
  String txtUserChangedPaymentCardToCash =
      "txt_user_changed_payment_card_to_cash";

  @JsonKey(
      name: 'txt_total_fare_by_wallet',
      defaultValue: "txt_total_fare_by_wallet")
  String txtTotalFareByWallet = "txt_total_fare_by_wallet";

  @JsonKey(
      name: 'txt_total_fare_by_card', defaultValue: "txt_total_fare_by_card")
  String txtTotalFareByCard = "txt_total_fare_by_card";

  @JsonKey(
      name: 'txt_kindly_wait_until_user_complete_the_payment',
      defaultValue: "txt_kindly_wait_until_user_complete_the_payment")
  String txtKindlyWaitUntilUserCompleteThePayment =
      "txt_kindly_wait_until_user_complete_the_payment";

  @JsonKey(
      name: 'txt_are_you_sure_show_company_logo',
      defaultValue: "txt_are_you_sure_show_company_logo")
  String txtYouSureShowCompanyLogo = "txt_are_you_sure_show_company_logo";

  @JsonKey(
      name: 'txt_company_logo_will_show_in_vehicle',
      defaultValue: "txt_company_logo_will_show_in_vehicle")
  String txtCompanyLogoShowInVehicle = "txt_company_logo_will_show_in_vehicle";

  @JsonKey(name: 'txt_driver_earnings', defaultValue: "txt_driver_earnings")
  String txtDiverEarnings = "txt_driver_earnings";

  @JsonKey(name: 'txt_vehicle_color', defaultValue: "txt_vehicle_color")
  String txtVehicleColor = "txt_vehicle_color";

  @JsonKey(name: 'txt_pick_color', defaultValue: "txt_pick_color")
  String txtPickColor = "txt_pick_color";

  @JsonKey(name: 'txt_booking_fee', defaultValue: "txt_booking_fee")
  String txtBookingFee = "txt_booking_fee";

  @JsonKey(name: 'txt_selectColor', defaultValue: "txt_selectColor")
  String txtSelectColor = "txt_selectColor";

  @JsonKey(name: 'txt_callCompany', defaultValue: "txt_callCompany")
  String txtCallCompany = "txt_callCompany";

  @JsonKey(name: 'txt_Select', defaultValue: "txt_Select")
  String txt_Select = "txt_Select";

  @JsonKey(
      name: 'txt_vehicle_online_descone',
      defaultValue: "txt_vehicle_online_descone")
  String txt_vehicle_online_descone = "txt_vehicle_online_descone";

  @JsonKey(
      name: 'txt_vehicle_online_desctwo',
      defaultValue: "txt_vehicle_online_desctwo")
  String txt_vehicle_online_desctwo = "txt_vehicle_online_desctwo";

  @JsonKey(name: 'txt_firstname', defaultValue: "txt_firstname")
  String txt_firstname = "txt_firstname";

  @JsonKey(name: 'txt_optional', defaultValue: "txt_optional")
  String txt_optional = "txt_optional";

  @JsonKey(name: 'txt_lastname', defaultValue: "txt_lastname")
  String txt_lastname = "txt_lastname";

  @JsonKey(name: 'txt_dob', defaultValue: "txt_dob")
  String txt_dob = "txt_dob";

  @JsonKey(name: 'txt_address', defaultValue: "txt_address")
  String txt_address = "txt_address";

  @JsonKey(name: 'txt_required', defaultValue: "txt_required")
  String txt_required = "txt_required";

  @JsonKey(name: 'txt_vehicle_make', defaultValue: "txt_vehicle_make")
  String txt_vehicle_make = "txt_vehicle_make";

  @JsonKey(name: 'txt_vehiclemake_error', defaultValue: "txt_vehiclemake_error")
  String txt_vehiclemake_error = "txt_vehiclemake_error";

  @JsonKey(name: 'txt_vehiclemodel', defaultValue: "txt_vehiclemodel")
  String txt_vehiclemodel = "txt_vehiclemodel";

  @JsonKey(
      name: 'txt_vehiclemodel_error', defaultValue: "txt_vehiclemodel_error")
  String txt_vehiclemodel_error = "txt_vehiclemodel_error";

  @JsonKey(name: 'txt_manufcaturingyr', defaultValue: "txt_manufcaturingyr")
  String txt_manufcaturingyr = "txt_manufcaturingyr";

  @JsonKey(name: 'txt_enter_avalid_yr', defaultValue: "txt_enter_avalid_yr")
  String txt_enter_avalid_yr = "txt_enter_avalid_yr";

  @JsonKey(
      name: 'txt_passenger_capacity', defaultValue: "txt_passenger_capacity")
  String txt_passenger_capacity = "txt_passenger_capacity";

  @JsonKey(name: 'txt_capacity_atleast', defaultValue: "txt_capacity_atleast")
  String txt_capacity_atleast = "txt_capacity_atleast";

  @JsonKey(name: 'txt_select_clr', defaultValue: "txt_select_clr")
  String txt_select_clr = "txt_select_clr";

  @JsonKey(
      name: 'txt_manufcature_yr_invalid',
      defaultValue: "txt_manufcature_yr_invalid")
  String txt_manufcature_yr_invalid = "txt_manufcature_yr_invalid";

  @JsonKey(
      name: 'txt_passenger_cap_invalid',
      defaultValue: "txt_passenger_cap_invalid")
  String txt_passenger_cap_invalid = "txt_passenger_cap_invalid";

  @JsonKey(
      name: 'txt_plsadd_activevehicle',
      defaultValue: "txt_plsadd_activevehicle")
  String txt_plsadd_activevehicle = "txt_plsadd_activevehicle";

  @JsonKey(name: 'txt_loading', defaultValue: "txt_loading")
  String txt_loading = "txt_loading";

  @JsonKey(name: 'txt_novehicles_found', defaultValue: "txt_novehicles_found")
  String txt_novehicles_found = "txt_novehicles_found";

  @JsonKey(name: 'txt_approved', defaultValue: "txt_approved")
  String txt_approved = "txt_approved";

  @JsonKey(name: 'txt_inprogress', defaultValue: "txt_inprogress")
  String txt_inprogress = "txt_inprogress";

  @JsonKey(name: 'txt_on', defaultValue: "txt_on")
  String txt_on = "txt_on";

  @JsonKey(name: 'txt_off', defaultValue: "txt_off")
  String txt_off = "txt_off";

  @JsonKey(name: 'txt_year', defaultValue: "txt_year")
  String txt_year = "txt_year";

  @JsonKey(name: 'txt_no_comment', defaultValue: "txt_no_comment")
  String txt_no_comment = "txt_no_comment";

  @JsonKey(name: 'txt_sure_cancelride', defaultValue: "txt_sure_cancelride")
  String txt_sure_cancelride = "txt_sure_cancelride";

  @JsonKey(name: 'txt_managaevehicle', defaultValue: "txt_managaevehicle")
  String txt_managaevehicle = "txt_managaevehicle";

  @JsonKey(name: 'txt_deletevehicle', defaultValue: "txt_deletevehicle")
  String txt_deletevehicle = "txt_deletevehicle";

  @JsonKey(
      name: 'txt_deletevehicle_desc', defaultValue: "txt_deletevehicle_desc")
  String txt_deletevehicle_desc = "txt_deletevehicle_desc";

  @JsonKey(name: 'txt_email_exist', defaultValue: "txt_email_exist")
  String txt_email_exist = "txt_email_exist";

  @JsonKey(name: 'txt_checking', defaultValue: "txt_checking")
  String txt_checking = "txt_checking";

  @JsonKey(name: 'txt_email_taken', defaultValue: "txt_email_taken")
  String txt_email_taken = "txt_email_taken";

  @JsonKey(
      name: 'txt_choose_from_gallery', defaultValue: "txt_choose_from_gallery")
  String txt_choose_from_gallery = "txt_choose_from_gallery";

  // @JsonKey(name: 'txt_choose_from_gallery', defaultValue: "txt_choose_from_gallery")
  // String txt_choose_from_gallery = "txt_choose_from_gallery";
  @JsonKey(name: 'txt_hour', defaultValue: "txt_hour")
  String txt_hour = "txt_hour";

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

  @JsonKey(
      name: 'txt_please_describe_your_reason',
      defaultValue: "txt_please_describe_your_reason")
  String txt_please_describe_your_reason = "txt_please_describe_your_reason";

  @JsonKey(
      name: 'txt_Please_describe_your_reason_for_cancellation',
      defaultValue: "txt_Please_describe_your_reason_for_cancellation")
  String txt_Please_describe_your_reason_for_cancellation =
      "txt_Please_describe_your_reason_for_cancellation";

  @JsonKey(name: 'txt_rating', defaultValue: "txt_rating")
  String txtRating = "txt_rating";

  factory TranslationModel.fromJson(Map<String, dynamic> json) =>
      _$TranslationModelFromJson(json);

  Map<String, dynamic> toJson() => _$TranslationModelToJson(this);
}
