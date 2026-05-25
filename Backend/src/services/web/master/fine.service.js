const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { Fine,Request,User, Role, Driver } = require('../../../models');
const { HttpStatusCode } = require('axios');
const ObjectId = require('mongoose').Types.ObjectId;

const getClientId = async (req) => {
  clientId = '';
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
  }
  return clientId;
}

const createFine = async (req) => {
    const clientId = getClientId(req);

    const user = await User.findOne({_id: new ObjectId(req.body.userId)});

    const role = await Role.findOne({ _id: { $in: [user.roleIds]}});

    //check whether given request id is valid for this user
  let requests;
    if(role.role !== 'Driver')
    {
      requests = await Request.findOne({requestNumber: req.body.requestId,userId: new ObjectId(req.body.userId)});
    }
    else
    {
      const driver = await Driver.findOne({userId: user._id});
      requests = await Request.findOne({requestNumber: req.body.requestId,driverId: driver._id});
    }

    if(!requests)
    {
      throw new ApiError(httpStatus.NOT_FOUND,'Not Found');
    }
    const data = {
      requestId : requests._id,
      userId: req.body.userId,
      fineAmount: req.body.fineAmount,
      description: req.body.description,
      date: req.body.date,
    }

    const fine = await Fine.create(data);
    const response = {
      ...fine.toObject(),
    requestNumber: req.body.requestId
    };
    return response;
};

const queryFine = async (req) => {
  const userId = req.params.userId;

  const fine = await Fine.find({userId: new ObjectId(userId)}).populate(
    {
    path: 'requestId',
    select: 'requestNumber'
    }
  );
  const result = fine.map(item => (
    {
      requestNumber: item.requestId.requestNumber,
      userId: item.userId,
      fineAmount: item.fineAmount,
      description: item.description,
      date: item.date
    }
  )
  );
  return result;
};

module.exports = {
    createFine,
    queryFine
}