// clientToken.controller.js
const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { clienttokenService } = require('../../services');
const Response = require('../../config/response');

const upsertClientToken = catchAsync(async (req, res) => {
  let clientId;

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
    req.body.clientId = clientId;
  }

  const clientToken = await clienttokenService.upsertClientToken(req.body);

  const response = Response(true, clientToken, 'Success');
  res.status(httpStatus.CREATED).send(response);
});

module.exports = {
  upsertClientToken,
};
