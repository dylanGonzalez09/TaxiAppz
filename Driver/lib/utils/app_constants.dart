class AppConstants {
  // DEVELOPMENT:

  //Chandru
  // static const baseurl = "https://n4ftkn7t-4001.inc1.devtunnels.ms/v1/api/";
  // static const imageBaseUrl = "https://n4ftkn7t-4001.inc1.devtunnels.ms";
  //alzhagumalai
  // static const baseurl = "https://4536b6bs-4001.inc1.devtunnels.ms/v1/api/";
  // static const imageBaseUrl = "https://4536b6bs-4001.inc1.devtunnels.ms/v1/api";
  // Vikram
  // static const baseurl = "https://c5xl7tw9-7001.inc1.devtunnels.ms/v1/api/";
  // static const imageBaseUrl = "https://c5xl7tw9-7001.inc1.devtunnels.ms";

  // LIVE:
  static const baseurl = "http://54.164.5.5:5001/v1/api/";
  static const imageBaseUrl = "http://54.164.5.5:5001";
  static const adminPanelUrl = "http://54.164.5.5:5002/";
  static const latoFont = "Lato";
  static const clientId = "66d477418c8e995c9073c512";
  static const iosVersionCode = "V-6801207a63ace8";
  static const androidVersionCode = "V-33f119ddfd9cd8";
  static const windowsVersionCode = "V-ddf1ef239c703f";

  //params
  static const Code = "Code";
  static const clientid = "clientid";
  static const authenticationType = "authenticationType";
  static const phoneNumber = "phoneNumber";
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
  static const id = "id";
  static const email = "email";
  static const serviceLocation = "serviceLocation";
  static const secondaryZone = "secondaryZone";
  static const secondaryLocation = "secondaryLocation";
  static const registrationType = "registrationType";
  static const company = "company";
  static const vehicleType = "vehicleType";
  static const vehicleModel = "vehicleModel";
  static const vehicleBrand = "vehicleBrand";
  static const vehicleVariant = "vehicleVariant";
  static const serviceType = "serviceType";
  static const isSecondaryZone = "isSecondaryZone";
  static const carNumber = "carNumber";
  static const companyId = "companyId";
  static const bearer = "Bearer";
  static const blockReason = "blockReason";
  static const document = "document";
  static const expiryDate = "expiryDate";
  static const identifier = "identifier";
  static const issueDate = "issueDate";
  static const documentStatus = "documentStatus";
  static const documentId = "documentId";
  static const documentImage = "documentImage";
  static const profileImage = "profileImage";
  static const latitude = "latitude";
  static const carColor = "Color";
  static const longitude = "longitude";
  static const bearing = "bearing";
  static const driverId = "driverId";
  static const userId = "userId";
  static const lastUpdated = "lastUpdated";
  static const isOnline = "isOnline";
  static const title = "title";
  static const walletId = "walletId";
  static const topic = "topic";
  static const response = "response";
  static const vehicleId = "vehicleId";
  static const requestId = "requestId";
  static const isAccept = "isAccept";
  static const speed = "speed";
  static const isAvailable = "isAvailable";
  static const arriveWaitingTime = "arriveWaitingTime";
  static const startWaitingTime = "startWaitingTime";
  static const beforeArrived = "beforeArrived";
  static const afterArrived = "afterArrived";
  static const location = "location";
  static const local = "local";
  static const lat = "lat";
  static const lon = "lon";
  static const distance = "distance";
  static const startKM = "startKm";
  static const endKM = "endKm";
  static const referralCode = "referralCode";
  static const pickLat = "picklat";
  static const pickLng = "picklng";
  static const dropLat = "droplat";
  static const dropLng = "droplng";
  static const dropAddress = "dropaddress";
  static const pickAddress = "pickupaddress";
  static const rideType = "ridetype";
  static const beforeWaitingTime = "beforeWaitingTime";
  static const afterWaitingTime = "afterWaitingTime";
  static const demoKey = "demoKey";
  static const drop_lat = "drop_lat";
  static const drop_lng = "drop_lng";
  static const before_waiting_time = "before_waiting_time";
  static const after_waiting_time = "after_waiting_time";
  static const reasonId = "reasonId";
  static const tripType = "trip_type";
  static const role = "role";
  static const reason = "reason";
  static const specialPrice = "specialPrice";
  static const companyVehicleId = "companyVehicleId";
  static const regDate = "regDate";
  static const regTime = "regTime";
  static const dateOfBirth = "dateOfBirth";
  static const vehicleMake = "vehicleMake";
  static const vehicleModelName = "vehicleModelName";
  static const subScriptionId = "subScriptionId";

  //mqtt topics
  static const driverLocationUpdate = "Taxiappz/driver/locationUpdate";
  static const driverDetailsTopic = "Taxiappz/driver/detail/";
  static const driverRequest = "Taxiappz/driver/request/";
  static const postTripDetails = "Taxiappz/post/tripDetails";
  static const postWaitingTime = "Taxiappz/post/trip/waitingTime";
  static const postTripTime = "Taxiappz/post/trip/tripTime";
  static const recieveMsg = "Taxiappz/chat/";

  //strings
  static const someThingWentWrong = "Some thing went wrong please try again";
  static const googleMapNavigation = "google.navigation";

  static Map<String, dynamic> tempData = {};

  //driver details
  static String driverAppName = "";
  static String driverFirstName = "";
  static String driverPhoneNumber = "";
  static String driverProfilePicture = "";
  static String appCurrencySymbol = "";
  static String driverServiceType = "";

// driver history params
  static const COMPELETED = "isCompleted";
  static const CANCELLED = "isCancelled";
  static const SCHEDULED = "isScheduled";
  static const amount = "amount";
  static const currency = "currency";
  static const rental = "RENTAL";
  static const tripStatus = "tripStatus";
  static const startKmImage = "startKmImage";
  static const endKmImage = "endKmImage";
  static const distanceUnit = "distanceUnit";
  static const unit = "unit";
  static const meter = "meter";
  static const translation = "translation";
  static const all = "all";
  static const date = "date";
  static const trip = "trip";
  static const km = "km";
  static const yes = "yes";
  static const no = "no";
  static const address = "address";
  static const stop_lat = "stop_lat";
  static const stop_lng = "stop_lng";
  static const pick_lat = "pick_lat";
  static const pick_lng = "pick_lng";
  static const stopLat = "stopLat";
  static const stopLng = "stopLng";
  static const stopAddress = "stopAddress";
  static const message = "message";
  static const drop_long = "drop_long";
  static const lng = "lng";
  static const isSelected = "isSelected";
  static const refreshToken = "refreshToken";
  static const value = "value";
  static const primaryZone = "primaryZone";
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
  static const showOverlay = "showOverlayTaxiAppz";
  static const paymentType = "paymentType";
  static const status = "status";
  static const paymentIntentId = "paymentIntentId";
  static const isUpdatePaymentStatus = "isUpdatePaymentStatus";
  static const wallet = "wallet";
  static const card = "card";
  static const carColour = "carColour";
  static const receiverId = "receiverId";
  static const senderType = "senderType";
  static const receiverType = "receiverType";
  static const manufactureYear = "manufactureYear";
  static const passengerCapacity = "passengerCapacity";
  static const licensePlateNumber = "licensePlateNumber";
  static const vehicleColor = "vehicleColor";

  static const pickLatitude = "pickLat";
  static const pickLongitude = "pickLng";
  static const dropLatitude = "dropLat";
  static const dropLongitude = "dropLng";
  static const speedKph = "speedKph";


}
