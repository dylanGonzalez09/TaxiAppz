import Flutter
import UIKit
import GoogleMaps
import Firebase
import PhoneNumberKit

@main
@objc class AppDelegate: FlutterAppDelegate {
    override func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        FirebaseApp.configure()
        GMSServices.provideAPIKey("AIzaSyDKntq_RWeOt_U6lx4IUu5XWUI5YR_NSVg")
        GeneratedPluginRegistrant.register(with: self)
        return super.application(application, didFinishLaunchingWithOptions: launchOptions)
    }
}
