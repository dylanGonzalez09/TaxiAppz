const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');

const catchAsync = require('../../../utils/catchAsync');
const { mobileIntroService } = require('../../../services');
const Response = require('../../../config/response');
const dotenv = require('dotenv');
dotenv.config();

const getdriverIntrosWithoutPagination = catchAsync(async (req, res) => {
    const intro = await mobileIntroService.getDriverIntross(req);
    if (!intro) {
        throw new ApiError(httpStatus.NOT_FOUND, 'intro not found');
    }

    const updatedIntros = intro.map(intro => {
        if (intro.image) {
            intro.image = `/uploads/intro/${intro.image}`;
        }

        return intro;
    });

    const response = Response(true, updatedIntros, "Intro retrieved successfully");
    res.status(httpStatus.OK).send(response);
});
const getUserIntrosWithoutPagination = catchAsync(async (req, res) => {
    const intro = await mobileIntroService.getUserIntross(req);
    if (!intro) {
        throw new ApiError(httpStatus.NOT_FOUND, 'intro not found');
    }

    const updatedIntros = intro.map(intro => {
        if (intro.image) {
            intro.image = `/uploads/intro/${intro.image}`;
        }

        return intro;
    });

    const response = Response(true, updatedIntros, "Intro retrieved successfully");
    res.status(httpStatus.OK).send(response);
});

module.exports = {
    getdriverIntrosWithoutPagination,   
    getUserIntrosWithoutPagination
};

