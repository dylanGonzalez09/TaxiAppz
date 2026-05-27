const nodemailer = require('nodemailer');

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services like 'outlook', 'yahoo', etc.
  auth: {
    user: 'sales@taxiappz.com', // Your email address
    pass: 'tcew blab vqxv hmoz', // Your email password or app password
  },
});

// Function to send dynamic email
const sendEmail = async (Enddate, toEmail, demoKey, clientName) => {
  // Format Enddate to display only date and time
  const formattedEndDate = new Date(Enddate);
  const formattedDate = formattedEndDate.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // HTML content for the email body with dynamic data
  const htmlContent = ` <!DOCTYPE html>
<html lang="en">
 
<head>
  <meta charset="UTF-8">
  <title>Responsive Taxi Platform Demo Email</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
<style>
  @media only screen and (max-width: 900px) {
    /* Universal font size scaling */
 
    .hide-on-mobile {
      display: none !important;
    }
    .store {
      font-size: 10px !important;
    }
    .down {
      font-size: 9px !important;
    }
    .butt {
      width: 140px !important;
      height: 35px !important;
    }
    .vale {
      font-size: 14px !important;
    }
    .valid {
      width: 100% !important;
      font-size: 10px !important;
    }
    .Handshake {
      width: 80px !important;
    }
    .wid {
      max-width: 100% !important;
      padding: 15px !important;
    }
    p {
      font-size: 16px !important;
    }
    a.butt {
      flex-direction: row !important;
      justify-content: center !important;
      font-size: 13px !important;
    }
    img {
      max-width: 100% !important;
      height: auto !important;
    }
    .apps-section {
      flex-direction: column !important;
    }
    .LoginIcon {
      width: 18px;
    }
    .TaxiAppzLogo {
      width: 18px;
    }
    .storeicon {
      width: 23px !important;
      height: 20px !important;
      margin-top: 5px !important;
    }
    .validva {
      font-size: 10px !important;
    }
    .key {
      font-size: 12px !important;
    }
    .pho {
      padding-left: 0px !important;
    }
    .user {
      font-size: 12px !important;
    }
    .pass {
      font-size: 12px !important;
    }
      .logo{
      height:40px !important;
      }
     
  }
</style>
 
</head>
 
<body style="font-family: 'Poppins', sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div class="wid" style="max-width: 680px; margin: auto; background-color: #fff; padding: 25px 28px;">
    <!-- Logo -->
    <div style="text-align: right; padding-bottom: 10px;">
      <img src="https://taxiappz.com/backend/email/taxi_logo.png" alt="TaxiAppz Logo" class="logo" style="height: 50px;">
    </div>
 
    <!-- Intro Text -->
    <h2 style="font-size: 22px; margin: 0 0 10px;">Hi ${clientName},<br>Your On-Demand Taxi Platform Demo is Ready!</h2>
    <p style="font-size: 18px; color: #333;">
      Discover the potential of our on-demand taxi platform! Uncover the simplicity and efficiency that can transform your taxi services.
    </p>
 
    <!-- Demo Access -->
    <div style="background-color: #f7f7f7; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td style="width: 100px;">
            <img src="https://taxiappz.com/backend/email/taxi_hand.png" alt="Handshake" class="Handshake" style="width: 100px;">
          </td>
          <td class="pho" style="padding-left: 15px;">
            <p style="font-size: 18px; font-weight: bold; margin: 0 0 10px;">Demo Access Details</p>
            <p style="margin: 5px 0;">
              <img src="https://taxiappz.com/backend/email/taxi_key.png" alt="Key Icon" style="vertical-align: middle; width: 15px; ">
              <span class="key" >Demo Key: </span><strong class="vale" style="color: #007bff; font-weight: bold;font-size:17px;">${demoKey}</strong>
            </p>
             <p class="valid" style="margin: 5px 0;">
              <img src="https://taxiappz.com/backend/email/taxi_calendar.png" alt="Calendar Icon" style="vertical-align: middle; width: 15px;">
              Valid Upto: <strong class="validva" style="color: #007bff;">${formattedDate}</strong>
            </p>
          </td>
        </tr>
       
      </table>
     
           
    </div>
    <!-- Admin Panel -->
    <div style="padding: 15px; background-color: #e7f7f1; margin-top: 10px; border-radius: 10px;">
      <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; padding: 15px; border-radius: 10px;">
        <tr>
          <td style="width: 200px; vertical-align: top;">
            <img src="https://taxiappz.com/backend/email/taxi_tv.png" alt="Admin Panel Dashboard" style="width: 100%;">
          </td>
          <td style="padding-left: 20px;">
            <strong style="font-size: 15px;">Admin Panel Credentials</strong>
            <p style="margin: 5px 0; font-size: 13px;" class="user">Username: <strong class="user" style="color: #007bff;">${toEmail}</strong></p>
            <p style="margin: 5px 0; font-size: 13px;" class="pass">Password: <strong class="pass" style="color: #007bff;">123456789</strong></p>
            <a class="logintext" href="https://pro.taxiappz.com/en/login" style="background-color: #1F5EFF; color: white; padding: 10px 15px; border-radius: 6px; text-decoration: none; display: inline-flex; align-items: center; font-size: 14px;">
              <img src="https://taxiappz.com/backend/email/taxi_login.png" alt="Login Icon" class="LoginIcon" style="max-width: 25px; margin-right: 6px;">Login
            </a>
          </td>
        </tr>
      </table>
     
    <!-- Apps Section -->
    <div style="background-color: #ffffff; padding: 25px; border-radius: 15px; margin-top: 20px;">
    <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start;">
    <!-- Phone Image -->
    <div style="flex: 1 1 100%; max-width: 100%; text-align: center; margin-bottom: 20px;">
      <img src="https://taxiappz.com/backend/email/taxi_mob.png"  class="hide-on-mobile" alt="App Preview" style="max-width: 250px; width: 80%; height: auto;">
    </div>
 
    <!-- App Blocks -->
    <div style="flex: 1 1 100%; max-width: 100%;">
      <!-- User App -->
      <div style="margin-bottom: 25px; text-align: center;">
        <strong style="font-size: 20px; display: block; margin-bottom: 12px;">User App</strong>
        <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 12px;">
          <a href="https://apps.apple.com/in/app/taxiappz-user-pro/id6745216144" class="butt" style="display: flex; align-items: center; background-color: #1F5EFF; color: white; padding: 10px 12px; height:37px; border-radius: 10px; text-decoration: none; gap: 10px;">
            <img src="https://taxiappz.com/backend/email/taxi_appstroe.png" alt="App Store Icon" class="storeicon" style="width: 28px;height:28px;">
            <div>
              <div style="font-size: 12px;" class="down">Download on the</div>
              <div style="font-size: 14px; font-weight: bold;" class="store">App Store</div>
            </div>
          </a>
          <a href="https://play.google.com/store/apps/details?id=com.taxiappzpro.user" class="butt" style="display: flex; align-items: center; background-color: #1F5EFF; color: white; padding: 10px 12px; height:37px; margin-left:15px; border-radius: 10px; text-decoration: none; gap: 10px;">
            <img src="https://taxiappz.com/backend/email/taxi_playstore.png" alt="Play Store Icon" class="storeicon"  style="width: 28px;height:28px;">
            <div>
              <div style="font-size: 12px;" class="down">Download on the</div>
              <div style="font-size: 14px; font-weight: bold;" class="store">Play Store</div>
            </div>
          </a>
        </div>
      </div>
 
      <!-- Driver App -->
      <div style="text-align: center;">
        <strong style="font-size: 20px; display: block; margin-bottom: 12px;">Driver App</strong>
        <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 12px;">
          <a href="https://apps.apple.com/in/app/taxiappz-driver-pro/id6745402928" class="butt" style="display: flex; align-items: center; background-color: #1F5EFF; color: white; padding: 10px 12px; height:37px; border-radius: 10px; text-decoration: none; gap: 10px;">
            <img src="https://taxiappz.com/backend/email/taxi_appstroe.png" alt="App Store Icon" class="storeicon" style="width: 28px;height:28px;">
            <div>
              <div style="font-size: 12px;" class="down">Download on the</div>
              <div style="font-size: 14px; font-weight: bold;" class="store">App Store</div>
            </div>
          </a>
          <a href="https://play.google.com/store/apps/details?id=com.taxi_appz.driver&pli=1" class="butt" style="display: flex; align-items: center; background-color: #1F5EFF; color: white; padding: 10px 12px; height:37px; margin-left:15px; border-radius: 10px; text-decoration: none; gap: 10px;">
            <img src="https://taxiappz.com/backend/email/taxi_playstore.png" alt="Play Store Icon" class="storeicon"  style="width: 28px;height:28px;">
            <div>
              <div style="font-size: 12px;" class="down">Download on the</div>
              <div style="font-size: 14px; font-weight: bold;" class="store">Play Store</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
</div>
 
 
    <!-- Mobile Preview -->
    <img src="https://taxiappz.com/backend/email/taxi_mob1.png" alt="Mobile Preview" style="margin-top: 20px; border-radius: 12px; width: 100%;">
 
    <!-- Features Section -->
    <div style="background-color: #e7f7f1; padding: 20px; border-radius: 12px; margin-top: 20px;">
      <h3 style="margin-top: 0;">Key Features</h3>
      <div style="background-color: #ffffff; padding: 20px; border-radius: 12px;">
        <!-- Feature Item -->
        <table width="100%" style="margin-bottom: 15px;">
          <tr>
            <td style="width: 24px;"><img src="https://taxiappz.com/backend/email/taxi_phone.png" style="width: 24px; height: 24px;"></td>
            <td style="padding-left: 12px;">
              <strong>Mobile Apps</strong><br>
              <small>Android and iOS apps for both drivers and customers.</small>
            </td>
          </tr>
        </table>
        <hr style="border: none; border-top: 1px solid #A7A7A7;">
 
        <table width="100%" style="margin-bottom: 15px;">
          <tr>
            <td style="width: 24px;"><img src="https://taxiappz.com/backend/email/taxi_lap.png" style="width: 24px; height: 24px;"></td>
            <td style="padding-left: 12px;">
              <strong>Admin and Dispatcher Panels</strong><br>
              <small>Tools for managing operations effectively.</small>
            </td>
          </tr>
        </table>
        <hr style="border: none; border-top: 1px solid #A7A7A7;">
 
        <table width="100%" style="margin-bottom: 15px;">
          <tr>
            <td style="width: 24px;"><img src="https://taxiappz.com/backend/email/taxi_cash.png" style="width: 24px; height: 24px;"></td>
            <td style="padding-left: 12px;">
              <strong>Payment Options</strong><br>
              <small>Support for credit/debit card payments and wallet functionality.</small>
            </td>
          </tr>
        </table>
        <hr style="border: none; border-top: 1px solid #A7A7A7;">
 
        <table width="100%">
          <tr>
            <td style="width: 24px;"><img src="https://taxiappz.com/backend/email/taxi_opt.png" style="width: 24px; height: 24px;"></td>
            <td style="padding-left: 12px;">
              <strong>Optimization</strong><br>
              <small>Optimize routes for quicker rides.</small>
            </td>
          </tr>
        </table>
         <hr style="border: none; border-top: 1px solid #A7A7A7;">
 
        <table width="100%">
          <tr>
            <td style="width: 24px;"><img src="https://taxiappz.com/backend/email/taxi_track.png" style="width: 24px; height: 24px;"></td>
            <td style="padding-left: 12px;">
              <strong>Tracking</strong><br>
              <small>Experience real-time tracking and reporting</small>
            </td>
          </tr>
        </table>
      </div>
    </div>
 
    <!-- Footer -->
    <div style="background-color: #f7f7f7; padding: 30px 15px; border-radius: 12px; text-align: center; margin-top: 30px;">
      <p style="font-size: 18px; margin-bottom: 15px;">Best Regards</p>
      <img src="https://taxiappz.com/backend/email/taxi_logo1.png" alt="TaxiAppz Logo"  class="TaxiAppzLogo" style="max-width: 30px; height: auto; margin-bottom: 15px;">
      <p style="font-size: 16px; margin: 0;">TaxiAppz Team</p>
      <p style="font-size: 14px; color: #777;">Thank you for choosing us. We look forward to continuing our successful collaboration.</p>
 
      <!-- Contact Info -->
      <div style="margin-top: 20px; font-size: 14px;">
        <div style="margin-bottom: 10px; align-items: center;">
          <img src="https://cdn-icons-png.flaticon.com/512/60/60740.png" alt="Manual Icon" style="width: 25px; vertical-align: middle; margin-right: 8px;">
          <span style="margin-right: 10px;">User Manual</span>
          <a href="https://taxiappz.com/backend/email/TaxiappzproAdmin.pdf" download style="padding: 6px 12px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; font-size: 13px;">
            Download
          </a>
        </div>
        <div style="margin-bottom: 10px;">
          <img src="https://taxiappz.com/backend/email/taxi_net.png" style="width: 25px; vertical-align: middle; margin-right: 8px;">
          <span>https://www.taxiappz.com</span>
        </div>
        <div>
          <img src="https://taxiappz.com/backend/email/taxi_phone1.png" style="width: 25px; vertical-align: middle; margin-right: 8px;">
          <span>WhatsApp: +91 99409 09625, +91 99448 20558</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  // Email options
  const mailOptions = {
    from: 'sales@taxiappz.com', // Sender address
    to: toEmail,
    subject: 'TaxiAppz Demo Credentials', // Subject line
    html: htmlContent, // HTML body
  };

  try {
    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendEmail;
