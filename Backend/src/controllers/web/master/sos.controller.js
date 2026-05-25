const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { sosService } = require('../../../services');
const Response = require('../../../config/response');

const createSos = catchAsync(async (req, res) => {
    const sos = await sosService.createSos(req);
    const response = Response(true, sos, "Success");
    res.status(httpStatus.CREATED).send(response);
});

const getSoss = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['name', 'role']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await sosService.querySoss(filter, options, req);
    const response = Response(true, result, "Success");
    res.status(httpStatus.OK).send(response);
});

const getSos = catchAsync(async (req, res) => {
    const sos = await sosService.getSosById(req.params.sosId);
    if (!sos) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Sos not found');
    }
    const response = Response(true, sos, "Success");
    res.status(httpStatus.OK).send(response);
});

const getSosPagination = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['title', 'phoneNumber', 'role']);
    const options = pick(req.query, ['sortBy', 'limit', 'page'], { allowDiskUse: true });
    if (req.query.search) {
        filter.$or = [
            { title: { $regex: req.query.search, $options: 'i' } },
            { phoneNumber: { $regex: req.query.search, $options: 'i' } },
        ];

        const searchNumber = parseFloat(req.query.search);
    }

    const result = await sosService.querySos(filter, options);
    const response = Response(true, result, "Sos retrieved successfully");
    res.status(httpStatus.OK).send(response);
});


const getSosWithOutPagination = catchAsync(async (req, res) => {
    const sos = await sosService.getSoss(req);
    if (!sos) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Sos not found');
    }
    const response = Response(true, sos, "Success");
    res.status(httpStatus.OK).send(response);
});

const updateSos = catchAsync(async (req, res) => {
    const sos = await sosService.updateSosById(req.params.sosId, req.body);
    const response = Response(true, sos, "Success");
    res.status(httpStatus.OK).send(response);
});

const deleteSos = catchAsync(async (req, res) => {
    const sos = await sosService.deleteSosById(req.params.sosId);
    const response = Response(true, sos, "Success");
    res.status(httpStatus.OK).send(response);
});

const updateSosStatus = catchAsync(async (req, res) => {
    const sosStatusId = req.params.sosId;
    const { status } = req.body;

    const sos = await sosService.updateSosById(sosStatusId, { status });

    if (!sos) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Sos not found');
    }

    const response = Response(true, sos, "Sos status updated successfully");
    res.status(httpStatus.OK).send(response);
});

module.exports = {
    createSos,
    getSoss,
    getSos,
    getSosWithOutPagination,
    getSosPagination,
    updateSos,
    deleteSos,
    updateSosStatus
};
