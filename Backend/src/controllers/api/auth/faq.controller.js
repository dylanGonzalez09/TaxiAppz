const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { mobileFaqService } = require('../../../services');
const Response = require('../../../config/response'); 

const createFaq = catchAsync(async (req, res) => {
  const faq = await mobileFaqService.createFaq(req);
  const response = Response(true, faq, "Success");
  res.status(httpStatus.CREATED).send(response);
});

const getFaqs = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await mobileFaqService.queryFaqs(filter, options,req);
  const response = Response(true, result, "Success");
  res.status(httpStatus.OK).send(response);
});

const getFaq = catchAsync(async (req, res) => {
  const faq = await mobileFaqService.getFaqById(req.params.faqId);
  if (!faq) {
    throw new ApiError(httpStatus.NOT_FOUND, 'faq not found');
  }
  const response = Response(true, faq, "Success");
  res.status(httpStatus.OK).send(response);
});

const getFaqsWithOutPagination = catchAsync(async (req, res) => {
  const faq = await mobileFaqService.getFaqs(req);
  if (!faq) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sos not found');
  }
  const response = Response(true, faq, "Success");
  res.status(httpStatus.OK).send(response);
});

const updateFaq = catchAsync(async (req, res) => {
  const faq = await mobileFaqService.updateFaqById(req.params.faqId, req.body);
  const response = Response(true, faq, "Success");
  res.status(httpStatus.OK).send(response);
});

const deleteFaq = catchAsync(async (req, res) => {
  const faq = await mobileFaqService.deleteFaqById(req.params.faqId);
  const response = Response(true, faq, "Success");
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createFaq,
  getFaqs,
  getFaq,
  getFaqsWithOutPagination,
  updateFaq,
  deleteFaq,
};
