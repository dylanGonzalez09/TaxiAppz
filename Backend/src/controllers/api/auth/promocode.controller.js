const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { apipromoCodeService } = require('../../../services');
const Response = require('../../../config/response');

const getPromocodeWithOutPagination = catchAsync(async (req, res) => {
    const promocode = await apipromoCodeService.getPromode(req);
    if (!promocode) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Promocode not found');
    }
    const response = Response(true, promocode, "Success");
    res.status(httpStatus.OK).send(response);
});


const getPromocodeApply = catchAsync(async (req, res) => {
    const promocode = await apipromoCodeService.promoApply(req);
    if (!promocode) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Promocode not found');
    }
    const response = Response(true, promocode, "Success");
    res.status(httpStatus.OK).send(response);
});

module.exports = {
    getPromocodeWithOutPagination,
    getPromocodeApply
};
