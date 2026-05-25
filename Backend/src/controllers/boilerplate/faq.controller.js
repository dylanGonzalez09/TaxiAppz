const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const pick = require('../../utils/pick');
const { faqService } = require('../../services');
const Response = require('../../config/response');
const ApiError = require('../../utils/ApiError');

// Create a faq
const createFaq = catchAsync(async (req, res) => {

  let clientId;

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
    req.body.clientId = clientId;
  }

  const Faq = await faqService.createFaq(req.body);

  const response = Response(true, Faq, "Success");
  res.status(httpStatus.CREATED).send(response);

});

// Get all vehicle models with pagination
const getFaqs = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  
  const options = pick(req.query, ['sortBy', 'limit', 'page'],{ allowDiskUse: true });
  if (req.query.search) {
    filter.$or = [
      { question: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  const result = await faqService.queryFaq(filter, options);
  
  const response = Response(true, result, "Success");
  res.status(httpStatus.OK).send(response);
});

// Get all faq  without pagination
const getFaqWithoutPagination = catchAsync(async (req, res) => {
  const Faq = await faqService.getFaqs();
  if (!Faq) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Faq not found');
  }
  const response = Response(true, Faq, "Success");
  res.status(httpStatus.OK).send(response);
});

// Update faq
const UpdateFaq = catchAsync(async (req, res) => {
    
    const Faq = await faqService.updateFaqById(req.params.faqId, req.body);
    
    const response = Response(true, Faq, "Success");
    res.status(httpStatus.OK).send(response);});

// Delete  faq
const deleteFaq = catchAsync(async (req, res) => {

    const Faq = await faqService.deleteFaqById(req.params.faqId);
    const response = Response(true, Faq, "Success");
    res.status(httpStatus.OK).send(response);});

// Update faq status
const UpdateFaqStatus = catchAsync(async (req, res) => {
  const faqId = req.params.faqId;
  const { status } = req.body;

  const Faq = await faqService.updateFaqById(faqId, { status });

  if (!Faq) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Faq not found');
  }

  const response = Response(true, Faq, "Faq status updated successfully");
  res.status(httpStatus.OK).send(response);
});
const getFaqByLanguage = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }
  const filter = pick(req.query, ['question', 'category']);
  
  const options = pick(req.query, ['sortBy', 'limit', 'page'],{ allowDiskUse: true });
  if (req.query.search) {
    filter.$or = [
      { question: { $regex: '^'+req.query.search, $options: 'i' } },
      { category: { $regex: '^'+req.query.search, $options: 'i' } }
    ];
  }
  const result = await faqService.getFaqByLanguage(req,filter, options);
  
  const response = Response(true, result, "Success");
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createFaq,
  getFaqs,
  getFaqWithoutPagination,
  UpdateFaq,
  deleteFaq,
  UpdateFaqStatus,
  getFaqByLanguage
};
