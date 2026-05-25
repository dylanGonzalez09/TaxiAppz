const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const ticketValidation = require('../../validations/api/auth/ticket.validation');
const ticketController = require('../../controllers/boilerplate/ticket.controller');

const router = express.Router();

router.route('/create').post(auth('Ticket'),validate(ticketValidation.createTicket),ticketController.createTicket);
router.route('/getTicketwithpagination').get(auth('Ticket'),ticketController.getTicketsWithPagination);
router.route('/getTickets/list').get(auth('Ticket'),ticketController.getTickets);
router.route('/updateTicket/:ticketId').patch(auth('Ticket'), validate(ticketValidation.updateTicket), ticketController.updateTicket);
router.route('/deleteTicket/:ticketId').delete(auth('Ticket'), validate(ticketValidation.deleteTicket), ticketController.deleteTicket);
router.route('/getTicket/:ticketId').get(auth('Ticket'),ticketController.getTicket);
router.patch('/updateTicketStatus/:ticketId', auth('Ticket'), validate(ticketValidation.UpdateTicketStatus), ticketController.UpdateTicketStatus);
router.route('/userCreateTicket').post(auth('Ticket'),ticketController.userCreateTicket);
router.route('/adminGroupTicket').get(auth('Ticket'),ticketController.groupTicketsByAdmin);
router.route('/assignAdminAndUpdateStatus/:ticketId').patch(auth('Ticket'),ticketController.assignAdminAndUpdateStatus);

module.exports = router;
