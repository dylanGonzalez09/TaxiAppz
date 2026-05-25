const httpStatus = require('http-status');
const catchAsync = require('../../../utils/catchAsync');
const { mobileauthService, tokenService, userService, mobiledriverService } = require('../../../services');
const Response = require('../../../config/response');
const { Demo } = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const { errorMessages } = require('../../../config/errorMessages');
require('dotenv').config();


//Driver

const otpSent = catchAsync(async (req, res) => {

    const { authenticationType } = req.body;

    let user = '';

    let tokens = '';

    if (authenticationType == "OTP") {

        const { phoneNumber, countryCode } = req.body;

        let otp = await mobileauthService.loginDriverWithMobileNo(phoneNumber, countryCode);

        const response = Response(true, "Otp Sent Successfully", "Data Found");

        res.status(httpStatus.OK).send(response);
    } else {

        const { email, password } = req.body;

        user = await mobileauthService.loginUserWithEmailAndPassword(email, password);

        tokens = await tokenService.generateAuthTokens(user);

        res.send({ user, tokens });

    }

});



const verify = catchAsync(async (req, res) => {

    const { phoneNumber, otp } = req.body;

    const { deviceInfoHash, isPrimary, deviceType, countryCode, demoKey } = req.body;

    if (demoKey) {
        user = await mobileauthService.mobileDriverDemoVerify(phoneNumber,countryCode,demoKey);
    } else {
        user = await mobileauthService.mobileDriverOtpVerify(phoneNumber, countryCode, otp);
    }

    let demoValid = false;
    let adminDemoKey = null;

    if (demoKey) {
        const demoRecord = await Demo.findOne({ demoKey });
        if (demoRecord) {
            const currentDate = new Date();
            demoValid = demoRecord.status && demoRecord.Enddate > currentDate;
            if (demoValid) {
                adminDemoKey = demoKey; // Only set adminDemoKey if demo is valid
            } else {
                throw new ApiError(httpStatus.BAD_REQUEST, errorMessages.INVALID_DEMO_KEY);
            }
        }
    }


    let userData = user.userData;

    let usertype = user.userType;
    let tokens;

    let response;


    if (usertype == "NewUser") {

        response = Response(true, { usertype }, "Otp Verify Successfully");

    } else {

        tokens = await tokenService.generateAuthTokens(userData);

        if (userData) {

            const body = {
                deviceInfoHash: deviceInfoHash,
                isPrimary: isPrimary,
                deviceType: deviceType,
                country: countryCode
            }

            if (adminDemoKey) {
                body.adminDemoKey = adminDemoKey;
            }

            await userService.updateUserById(userData.id, body);

            let driver = await mobiledriverService.getDriversBytoken(tokens.access.token);

            if (driver.length > 0) {
                driver = driver[0];
            }


            response = Response(true, { usertype, tokens, driver }, "Otp Verify Successfully")
        }
    }


    res.status(httpStatus.OK).send(response);

});


//User


const userOtpSent = catchAsync(async (req, res) => {

    const { authenticationType } = req.body;

    let user = '';

    let tokens = '';

    if (authenticationType == "OTP") {

        const { phoneNumber, countryCode } = req.body;

        let otp = await mobileauthService.loginUserWithMobileNo(phoneNumber, countryCode);

        const response = Response(true, "Otp Sent Successfully", "Data Found");

        res.status(httpStatus.OK).send(response);
    } else {

        const { email, password } = req.body;

        user = await mobileauthService.loginUserWithEmailAndPassword(email, password);

        tokens = await tokenService.generateAuthTokens(user);

        res.send({ user, tokens });

    }

});



const userVerify = catchAsync(async (req, res) => {

    const { phoneNumber, otp } = req.body;

    const { deviceInfoHash, isPrimary, deviceType, countryCode, demoKey } = req.body;

    let user;

    if (demoKey) {
        user = await mobileauthService.mobileUserDemoVerify(phoneNumber,countryCode,demoKey);
    } else {
        user = await mobileauthService.mobileUserOtpVerify(phoneNumber, countryCode, otp);
    }

    let demoValid = false;
    let adminDemoKey = null;

    if (demoKey) {
        const demoRecord = await Demo.findOne({ demoKey });
        if (demoRecord) {
            const currentDate = new Date();

            demoValid = demoRecord.status && demoRecord.Enddate > currentDate;
            if (demoValid) {
                adminDemoKey = demoKey; // Only set adminDemoKey if demo is valid
            } else {
                throw new ApiError(httpStatus.BAD_REQUEST, errorMessages.INVALID_DEMO_KEY);
            }
        }
    }

    let userData = user.userData;

    let usertype = user.userType;
    let tokens;

    let response;

    if (usertype == "NewUser") {

        response = Response(true, { usertype }, "Otp Verify Successfully");

    } else {

        tokens = await tokenService.generateAuthTokens(userData);

        if (userData) {

            const body = {
                deviceInfoHash: deviceInfoHash,
                isPrimary: isPrimary,
                deviceType: deviceType,
                country: countryCode
            }

            if (adminDemoKey) {
                body.adminDemoKey = adminDemoKey;
            }

            await userService.updateUserById(userData.id, body);

            response = Response(true, { usertype, tokens, userData }, "Otp Verify Successfully")
        }
    }


    res.status(httpStatus.OK).send(response);

});




const refreshTokens = catchAsync(async (req, res) => {

    const tokens = await mobileauthService.refreshAuth(req.body.refreshToken);

    res.send({ ...tokens });
});


const getUser = catchAsync(async (req, res) => {

    const user = await mobileauthService.getUserById(req.params.userId);

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const response = Response(true, user, "Success");

    res.status(httpStatus.OK).send(response);
});

const register = catchAsync(async (req, res) => {
    const user = await userService.createUser(req.body);
    const tokens = await tokenService.generateAuthTokens(user);
    res.status(httpStatus.CREATED).send({ user, tokens });
});

module.exports = {
    otpSent,
    refreshTokens,
    verify,
    getUser,
    register,
    userOtpSent,
    userVerify
};
