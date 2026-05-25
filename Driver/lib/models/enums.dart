enum SettingsEnum { general, keys, modules, terms }

enum RegistrationType { company, individual }

enum DriverBlockedReason {
  DOCUMENT_NOT_UPLOADED,
  DOCUMENT_REJECTED,
  WAITINGFORAPPROVAL,
  AdminBlocked,
  APPROVED,
  DENIED,
  EXPIRED,
  VEHICLE_DISABLED,
  ZONE_DISABLED,
}

enum MakerIds{
  pickupLocation,dropLocation,stopLocation,driverMarker
}

enum NotificationTypeEnum {
  general,
}

enum TripStatus{
  TRIP_CANCELLED,
}