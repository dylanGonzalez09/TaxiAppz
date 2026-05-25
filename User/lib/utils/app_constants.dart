class AppConstants {

  //chandru
  // static const baseurl = "https://n4ftkn7t-4001.inc1.devtunnels.ms/v1/api/";
  // static const imageBaseUrl = "https://n4ftkn7t-4001.inc1.devtunnels.ms";
//alzhagumalai
//   static const baseurl = "https://4536b6bs-4001.inc1.devtunnels.ms/v1/api/";
//   static const imageBaseUrl = "https://4536b6bs-4001.inc1.devtunnels.ms";

  // static const baseurl = "https://c5xl7tw9-7001.inc1.devtunnels.ms/v1/api/";
  // static const imageBaseUrl = "https://c5xl7tw9-7001.inc1.devtunnels.ms";

  //live
  static const baseurl = "http://54.164.5.5:5001/v1/api/";
  static const imageBaseUrl = "http://54.164.5.5:5001";
  static const adminPanelUrl = "http://54.164.5.5:5002/v1/api";
  static const latoFont = "Lato";
  static const androidVersionCode = "V-e0e84267fcf9f8";
  static const iosVersionCode = "V-cbd97894b6fc8";
  static const windowsVersionCode = "V-8dd917759728b";
  static const clientId = "66d477418c8e995c9073c512";

  //params
  static const Code = "Code";
  static const clientid = "clientid";
  static const authenticationType = "authenticationType";
  static const phoneNumber = "phoneNumber";
  static const title = "title";
  static const countryCode = "countryCode";
  static const OTP = "OTP";
  static const country = "country";
  static const otp = "otp";
  static const deviceInfoHash = "deviceInfoHash";
  static const deviceType = "deviceType";
  static const NewUser = "NewUser";
  static const ExistingUser = "ExistingUser";
  static const PRIMARY = "PRIMARY";
  static const SECONDARY = "SECONDARY";
  static const name = "name";
  static const email = "email";
  static const serviceLocation = "serviceLocation";
  static const secondaryLocation = "secondaryLocation";
  static const registrationType = "registrationType";
  static const company = "company";
  static const referralCode = "referralCode";
  static const profilePic = "profilePic";
  static const topic = "topic";
  static const response = "response";
  static const currentLocation = "currentLocation";
  static const walletId = "walletId";
  static const userId = "userId";
  static const latitude = "latitude";
  static const longitude = "longitude";
  static const bearing = "bearing";
  static const ride_date = "ride_date";
  static const drop_lat = "drop_lat";
  static const drop_long = "drop_long";
  static const pickup_lat = "pickup_lat";
  static const pickup_long = "pickup_long";
  static const pick_lat = "pick_lat";
  static const pick_lng = "pick_lng";
  static const drop_address = "drop_address";
  static const pickup_address = "pickup_address";
  static const stop_lat = "stop_lat";
  static const stop_lng = "stop_lng";
  static const stop_address = "stop_address";
  static const ride_time = "ride_time";
  static const ride_type = "ride_type";
  static const serviceType = "serviceType";
  static const vehicleId = "vehicleId";
  static const stops = "stops";
  static const ride_date_time = "date_time";
  static const requestId = "requestId";
  static const zoneId = "zoneId";
  static const driverId = "driverId";
  static const afterArrived = "afterArrived";
  static const beforeArrived = "beforeArrived";
  static const role = "role";
  static const reason = "reason";
  static const reasonId = "reasonId";
  static const promoCode = "promo_code";
  static const demoKey = "demoKey";
  static const all = "all";
  static const id = "id";
  static const isSelected = "isSelected";
  static const regDate = "regDate";
  static const regTime = "regTime";

  //strings
  static const someThingWentWrong = "Some thing went wrong please try again";

  //mqtt topics
  static const listenDrivers = "Taxiappz/user/listenDriver";
  static const postAllDrivers = "Taxiappz/user/postAllDrivers";
  static const getAllDrivers = "Taxiappz/user/getAllDrivers/";
  static const postVehicle = "Taxiappz/user/postVehicle/driver";
  static const userRequest = "Taxiappz/user/request/";
  static const getVehicle = "Taxiappz/user/getVehicle/driver/";
  static const getTripDriver = "Taxiappz/user/getTripDriver/";
  static const postTripDriver = "Taxiappz/user/postTripDriver";
  static const getTRipWaitingTime = "Taxiappz/get/trip/waitingTime/";
  static const changePickUpTripAddress = "Taxiappz/user/request/pickup";
  static const changeDropTripAddress = "Taxiappz/user/request/drop";
  static const changeStopTripAddress = "Taxiappz/user/request/stop";
  static const currentLocationMarker = "currentLocationMarker";
  static const recieveMsg = "Taxiappz/chat/";

  // History keys
  static const COMPELETED = "isCompleted";
  static const CANCELLED = "isCancelled";

  //user details
  static String appName = "";
  static String userFirstName = "";
  static String userPhoneNumber = "";
  static String userProfileImage = "";
  static bool isBookingForOthersChanged = false;
  static String bookingForOthersRiderName = "";
  static String bookingForOthersRiderPhoneNumber = "";

  static const amount = "amount";
  static const googleMapNavigation = "google.navigation";
  static const rental = "RENTAL";
  static const myself = "myself";
  static const riderName = "riderName";
  static const address = "address";
  static const latLng = "latLng";
  static const message = "message";
  static const trip = "trip";
  static const tripAddressChangeType = "tripAddressChangeType";
  static const lat = "lat";
  static const lng = "lng";
  static const isPickChange = "isPickChange";
  static const refreshToken = "refreshToken";
  static const type = "type";
  static const dispute = "dispute";
  static const active = "active";
  static const closed = "closed";
  static const requestRegistered = "requestRegistered";
  static const updated = "updated";
  static const workInProgress = "workInProgress";
  static const issueResolved = "issueResolved";
  static const description = "description";
  static const trackTicketsDetails = "trackTicketsDetails";
  static const open = "open";
  static const inProgress = "In-Progress";
  static const actionTaken = "Action-Taken";
  static const translation = "translation";
  static const local = "local";
  static const wallet = "wallet";
  static const card = "card";
  static const cash = "cash";
  static double? userWalletBalance = null;

  static const senderType = "senderType";
  static const receiverId = "receiverId";
  static const receiverType = "receiverType";

  static const speedKph = "speedKph";
  static const pickLat = "pickLat";
  static const pickLng = "pickLng";
  static const dropLat = "dropLat";
  static const dropLng = "dropLng";
}
