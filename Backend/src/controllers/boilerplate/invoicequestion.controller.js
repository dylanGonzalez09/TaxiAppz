const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const pick = require('../../utils/pick');
const ApiError = require('../../utils/ApiError');
const { invoiceQuestionService } = require('../../services');
const { InvoiceQuestion } = require('../../models');

const Response = require('../../config/response');

// Create a vehicle model with an image
const createInvoiceQuestion = catchAsync(async (req, res) => {
  const clientId = req.headers.clientid;

  if (!clientId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  const { role,language } = req.body;

  if (!role) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Role is required');
  }

  // Count existing questions for this client and role
  const existingCount = await InvoiceQuestion.countDocuments({ clientId, role, language });

  if (existingCount >= 5) {
    throw new ApiError(httpStatus.BAD_REQUEST, `${role} can only have up to 5 invoice questions`);
  }

  req.body.clientId = clientId;

  const invoiceQuestion = await invoiceQuestionService.createInvoiceQuestion(req.body);

  const response = Response(true, invoiceQuestion, "Success");
  res.status(httpStatus.CREATED).send(response);
});


// Get all vehicle models with pagination
const getInvoiceQuestions = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['question', 'role']);
  
  const options = pick(req.query, ['sortBy', 'limit', 'page'],{ allowDiskUse: true });
  if (req.query.search) {
    filter.$or = [
      { question: { $regex:'^'+ req.query.search, $options: 'i' } },
      { role: { $regex: '^'+req.query.search, $options: 'i' } },
    ];
  }
  const result = await invoiceQuestionService.queryInvoiceQuestion(filter, options);
  
  const response = Response(true, result, "Success");
  res.status(httpStatus.OK).send(response);
});

// Get all vehicle models without pagination
const getInvoiceQuestionWithoutPagination = catchAsync(async (req, res) => {


  const invoiceQuestion = await invoiceQuestionService.getInvoiceQuestions();
  if (!invoiceQuestion) {
    throw new ApiError(httpStatus.NOT_FOUND, 'invoiceQuestion not found');
  }
  const response = Response(true, invoiceQuestion, "Success");
  res.status(httpStatus.OK).send(response);
});

// Update a vehicle model
const UpdateInvoiceQuestion = catchAsync(async (req, res) => {
    
    const invoiceQuestion = await invoiceQuestionService.updateInvoiceQuestionById(req.params.invoiceQuestionId, req.body);
    
    const response = Response(true, invoiceQuestion, "Success");
    res.status(httpStatus.OK).send(response);});

// Delete a vehicle model
const deleteInvoiceQuestion = catchAsync(async (req, res) => {

    const invoiceQuestion = await invoiceQuestionService.deleteInvoiceQuestionById(req.params.invoiceQuestionId);
    const response = Response(true, invoiceQuestion, "Success");
    res.status(httpStatus.OK).send(response);});

// Update a vehicle model's status
const UpdateInvoiceQuestionStatus = catchAsync(async (req, res) => {
  const invoiceQuestionId = req.params.invoiceQuestionId;
  const { status } = req.body;

  const invoiceQuestion = await invoiceQuestionService.updateInvoiceQuestionById(invoiceQuestionId, { status });

  if (!invoiceQuestion) {
    throw new ApiError(httpStatus.NOT_FOUND, 'invoiceQuestion not found');
  }

  const response = Response(true, invoiceQuestion, "invoiceQuestion status updated successfully");
  res.status(httpStatus.OK).send(response);
});


const getUserInvoiceQuestionWithoutPagination = catchAsync(async (req, res) => {
  const invoiceQuestion = await invoiceQuestionService.getUserInvoiceQuestions();
  if (!invoiceQuestion) {
    throw new ApiError(httpStatus.NOT_FOUND, 'invoiceQuestion not found');
  }
  const response = Response(true, invoiceQuestion, "Success");
  res.status(httpStatus.OK).send(response);
});

const getDriverInvoiceQuestionWithoutPagination = catchAsync(async (req, res) => {
  const invoiceQuestion = await invoiceQuestionService.getDriverInvoiceQuestions();
  if (!invoiceQuestion) {
    throw new ApiError(httpStatus.NOT_FOUND, 'invoiceQuestion not found');
  }
  const response = Response(true, invoiceQuestion, "Success");
  res.status(httpStatus.OK).send(response);
});
const getQuestionReport = catchAsync(async (req, res) => {
  const invoiceQuestion = await invoiceQuestionService.getQuestionReport();
  const response = Response(true, invoiceQuestion, "Success");
  res.status(httpStatus.OK).send(response);
});

const getQuestionDetails = catchAsync(async (req,res) => {
  try {
      const filter = pick(req.query,['search']);
      const options = pick(req.query, ['sortBy', 'limit', 'page']);
      const questionReports = await invoiceQuestionService.questionReportDetails(req,filter,options);
      const response = Response(true, questionReports, 'Question reports retrieved successfully');
      res.status(httpStatus.OK).json(response);
  } catch (error) {
      console.error('Error fetching question reports:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
});

const getInvoiceByLanguage = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }
  const filter = pick(req.query, ['question', 'role']);
  
  const options = pick(req.query, ['sortBy', 'limit', 'page'],{ allowDiskUse: true });
  if (req.query.search) {
    filter.$or = [
      { question: { $regex: '^'+req.query.search, $options: 'i' } },
      { role: { $regex: '^'+req.query.search, $options: 'i' } }
    ];
  }
  const result = await invoiceQuestionService.getInvoiceByLanguage(req,filter, options);
  
  const response = Response(true, result, "Success");
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createInvoiceQuestion,
  getInvoiceQuestions,
  getInvoiceQuestionWithoutPagination,
  UpdateInvoiceQuestion,
  deleteInvoiceQuestion,
  UpdateInvoiceQuestionStatus,
  getUserInvoiceQuestionWithoutPagination,
  getDriverInvoiceQuestionWithoutPagination,
  getQuestionReport,
  getQuestionDetails,
  getInvoiceByLanguage
};
