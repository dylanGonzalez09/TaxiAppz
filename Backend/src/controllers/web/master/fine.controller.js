const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { fineService } = require('../../../services');
const Response = require('../../../config/response');

const createFine = catchAsync(async(req,res) => {
    const fine = await fineService.createFine(req);

    const response = Response(true, fine, "Fine amount added successfully");
    res.status(httpStatus.CREATED).send(response);
});

const queryFine = catchAsync(async(req,res) => {
    
    const result = await fineService.queryFine(req);
    const response = Response(true, result, 'Success');

    res.status(httpStatus.OK).send(response);
});

module.exports = {
    createFine,
    queryFine
};