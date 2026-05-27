const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const mongoose = require('mongoose');
const pick = require('../../../utils/pick');
const catchAsync = require('../../../utils/catchAsync');
const ApiError = require('../../../utils/ApiError');
const { apiticketService, tokenService, usersService } = require('../../../services');
const Response = require('../../../config/response');
const { getUserId, getClientId, getDriverId } = require('../../../utils/commonFunction');

const createTicket = catchAsync(async (req, res) => {
  const ticket = await apiticketService.createTicket(req);
  const response = Response(true, ticket, 'Success');
  res.status(httpStatus.CREATED).send(response);
});

const getTicket = catchAsync(async (req, res) => {
  const ticket = await apiticketService.getTicketById(req.params.ticketId);
  if (!ticket) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Ticket not found');
  }
  // Make sure createdAt and updatedAt are included in the response
  const response = Response(true, ticket, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getTickets = catchAsync(async (req, res) => {
  const tickets = await apiticketService.getAllTickets();

  if (!tickets || tickets.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No tickets found');
  }
  const response = Response(true, tickets, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getTicketsWithPagination = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['title', 'firstName']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  if (req.query.search) {
    filter.$or = [
      { title: { $regex: `^${req.query.search}`, $options: 'i' } },
      { firstName: { $regex: `^${req.query.search}`, $options: 'i' } },
    ];
  }

  const result = await apiticketService.queryTicket(filter, options);

  if (!result.success) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      success: false,
      message: 'Error fetching tickets',
    });
  }

  // No need for manual cleaning of the result as 'roleName' is included in the aggregation
  const modifiedResult = {
    ...result.data,
    results: result.data.results, // Directly return the results from the aggregation
  };

  const response = Response(true, modifiedResult, 'Success');
  res.status(httpStatus.OK).send(response);
});

const updateTicket = catchAsync(async (req, res) => {
  const ticket = await apiticketService.updateTicketById(req.params.ticketId, req.body);
  const response = Response(true, ticket, 'Success');
  res.status(httpStatus.OK).send(response);
});

const deleteTicket = catchAsync(async (req, res) => {
  const ticket = await apiticketService.deleteTicketById(req.params.ticketId);
  const response = Response(true, ticket, 'Success');
  res.status(httpStatus.OK).send(response);
});

const userCreateTicket = catchAsync(async (req, res) => {
  try {
    if (!req.headers.clientid) {
      throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
    } else {
      req.body.clientId = req.headers.clientid;
    }

    const user = await getUserId(req);

    const { title, description, status } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and Description are required' });
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    // Fetch user details using getUserById from the user service
    const userDetails = await usersService.getUserDetails(user); // Ensure this returns user object
    if (!userDetails) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { firstName, roleIds } = userDetails;

    // Create a new ticket using the ticketService
    const newTicket = await apiticketService.usercreateByTicket({
      user,
      title,
      description,
      status,
      clientId: req.body.clientId,
      createdAt: req.body.createdAt,
      updatedAt: req.body.updatedAt,
    });

    return res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: newTicket,
      user: {
        firstName,
        roleIds,
      },
    });
  } catch (error) {
    console.error('Error in UserCreateTicket:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});

const groupTicketsByAdmin = async (req, res) => {
  try {
    // const userId = await getUserId(req);

    const groupedTickets = await apiticketService.groupTicketsByAdmin();

    return res.status(200).json({
      success: true,
      data: groupedTickets,
      message: 'Tickets grouped successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error grouping tickets', error: error.message });
  }
};

const groupTicketsByUser = async (req, res) => {
  try {
    const groupedTickets = await apiticketService.groupTicketsByUser(req);

    const response = Response(true, groupedTickets, 'ticket status updated successfully');

    res.status(httpStatus.OK).send(response);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error grouping tickets', error: error.message });
  }
};
const UpdateTicketStatus = catchAsync(async (req, res) => {
  const { ticketId } = req.params;

  // Fixed syntax error - don't include curly braces around req.body
  const ticket = await apiticketService.updateTicketById(ticketId, req.body);

  if (!ticket) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ticket not found');
  }

  const response = Response(true, ticket, 'ticket status updated successfully');
  res.status(httpStatus.OK).send(response);
});
const assignAdminAndUpdateStatus = catchAsync(async (req, res) => {
  const { ticketId } = req.params;
  const { status, note } = req.body;
  const adminId = await getUserId(req); // Assuming this gets the authenticated admin's ID

  // Input validation
  if (!ticketId || !mongoose.Types.ObjectId.isValid(ticketId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or missing ticket ID',
    });
  }

  if (!status || !note) {
    return res.status(400).json({
      success: false,
      message: 'Both status and note are required',
    });
  }

  // Call service
  const updatedTicket = await apiticketService.assignAdminAndUpdateStatus(ticketId, adminId, status, note);

  return res.status(200).json({
    success: true,
    message: 'Ticket updated successfully',
    data: updatedTicket,
  });
});

module.exports = {
  createTicket,
  getTicketsWithPagination,
  getTicket,
  updateTicket,
  deleteTicket,
  UpdateTicketStatus,
  userCreateTicket,
  groupTicketsByAdmin,
  assignAdminAndUpdateStatus,
  getTickets,
  groupTicketsByUser,
};
