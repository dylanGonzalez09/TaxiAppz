const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../../utils/ApiError');
const { Ticket,User } = require('../../../models');
const mongoose = require('mongoose');
const { tokenService } = require('../../../services');
const ObjectId = require('mongoose').Types.ObjectId

const { sendPushNotification,getUserId,getClientId } = require('../../../utils/commonFunction');


/**
 * Create a ticket
 * @param {Object} req
 * @returns {Promise<Ticket>}
 */
const createTicket = async (req) => {

  req.body.clientId = await getClientId(req);
  req.body.user = await getUserId(req);

 const user = await User.findById(req.body.user);

  if (!user) {
    throw new Error("User not found");
  }

    req.body.zoneId = user.zoneId;

  await sendPushNotification(req.body.user, {
    title: "TICKET STATUS",
    message: "Your Ticket Created... Please Wait For Admin Review Your Ticket ",
});

  return Ticket.create(req.body);
};

/**
 * Query for tickets
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
*/
const queryTicket = async (filter = {}, options = {}) => {
  try {
    // Validate and parse pagination options with reasonable limits
    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 10));
    const skip = (page - 1) * limit;

    // Build the aggregation pipeline
    const pipeline = [
      // Initial filter if provided
      ...(Object.keys(filter).length > 0 ? [{ $match: filter }] : []),
      
      // Lookup user details
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
      
      // Lookup user roles
      {
        $lookup: {
          from: 'roles',
          localField: 'userDetails.roleIds',
          foreignField: '_id',
          as: 'userRoleDetails'
        }
      },
      { $unwind: { path: '$userRoleDetails', preserveNullAndEmptyArrays: true } },
      
      // Lookup assigned admin details
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'assignedToDetails'
        }
      },
      { $unwind: { path: '$assignedToDetails', preserveNullAndEmptyArrays: true } },

      // Process notes - unwind, filter, and reconstruct
      { $unwind: { path: '$notes', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          $or: [
            { 'notes.status': 'open' },
            { 
              'notes.status': { $in: ['In-Progress', 'Action-Taken', 'closed'] },
              'notes.note': { $exists: true, $ne: '' }
            }
          ]
        }
      },
      {
        $group: {
          _id: '$_id',
          root: { $first: '$$ROOT' },
          notes: { $push: '$notes' }
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              '$root',
              { notes: '$notes' }
            ]
          }
        }
      },
      
      // Final projection
      {
        $project: {
          _id: 0,
          id: { $toString: '$_id' },
          title: 1,
          description: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          userId: { $ifNull: ['$userDetails._id', null] },
          userName: {
            $cond: {
              if: { $and: [
                { $ifNull: ['$userDetails.firstName', false] },
                { $ifNull: ['$userDetails.lastName', false] }
              ]},
              then: { $concat: [
                { $ifNull: ['$userDetails.firstName', ''] },
                ' ',
                { $ifNull: ['$userDetails.lastName', ''] }
              ]},
              else: 'Unknown User'
            }
          },
          assignedToId: { $ifNull: ['$assignedToDetails._id', null] },
          assignedToName: {
            $cond: {
              if: { $and: [
                { $ifNull: ['$assignedToDetails.firstName', false] },
                { $ifNull: ['$assignedToDetails.lastName', false] }
              ]},
              then: { $concat: [
                { $ifNull: ['$assignedToDetails.firstName', ''] },
                ' ',
                { $ifNull: ['$assignedToDetails.lastName', ''] }
              ]},
              else: 'Unassigned'
            }
          },
          userRoleName: { $ifNull: ['$userRoleDetails.role', 'No Role'] },
          notes: {
            $arrayToObject: {
              $map: {
                input: '$notes',
                as: 'note',
                in: [
                  { $toString: '$$note.status' },
                  '$$note.note'
                ]
              }
            }
          }
        }
      }
    ];

    // Execute parallel operations for better performance
    const [result, totalResult] = await Promise.all([
      Ticket.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: limit }
      ]).exec(),
      Ticket.aggregate([
        ...pipeline,
        { $count: 'total' }
      ]).exec()
    ]);

    const totalTickets = totalResult[0]?.total || 0;

    return {
      success: true,
      message: 'Tickets fetched successfully',
      data: {
        results: result,
        total: totalTickets,
        page,
        limit,
        totalPages: Math.ceil(totalTickets / limit)
      }
    };
  } catch (error) {
    console.error("Error querying tickets:", error);
    throw new Error(`Failed to fetch tickets: ${error.message}`);
  }
};
/**
 * Get roles
 * @returns {Promise<Ticket>}
 */
const getTickets = async () => {
  return Ticket.find();
};


/**
 * Get ticket by ticketId
 * @param {ObjectId} ticketId
 * @returns {Promise<Ticket>}
 */
const getTicketById = async (ticketId) => {
  const ticket = await Ticket.findById(ticketId)
    .select('title description user assignedTo status note createdAt updatedAt');
  return ticket;
};
const getAllTickets = async (page = 1, pageSize = 10) => {
  const skip = (page - 1) * pageSize; // Calculate the skip value for pagination

  const tickets = await Ticket.find({})
    .select('title description user assignedTo status note createdAt updatedAt')
    .skip(skip) // Skip the calculated number of tickets based on the page
    .limit(pageSize); // Limit the number of tickets per page

  const mappedTickets = tickets.map(ticket => ({
    id: ticket._id.toString(),
    title: ticket.title,
    description: ticket.description,
    user: ticket.user,
    assignedTo: ticket.assignedTo,
    status: ticket.status,
    note: ticket.note,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt
  }));

  return mappedTickets;
};


/**
 * Update ticket by ticketId
 * @param {ObjectId} ticketId
 * @param {Object} updateBody
 * @returns {Promise<Ticket>}
 */

const updateTicketById = async (ticketId, updateBody) => {
  try {
    // Find the ticket by ID
    const ticket = await Ticket.findById(ticketId);

    let userId = ticket.user;
  

    if (!ticket) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Ticket not found');
    }

    if (!Array.isArray(ticket.notes)) {
      ticket.notes = [];
    }

    if (updateBody.status && updateBody.note) {
      const existingNoteIndex = ticket.notes.findIndex(note => note.status === updateBody.status);

      
      if (existingNoteIndex >= 0) {
        ticket.notes[existingNoteIndex].note = updateBody.note;
        ticket.notes[existingNoteIndex].createdAt = new Date(); // Update timestamp
      } else {

        const newNote = {
          note: updateBody.note || 'No note provided',  
          status: updateBody.status,
          createdAt: new Date(), 
        };
        ticket.notes.push(newNote);
      }
    }

    Object.assign(ticket, updateBody);

    await ticket.save();


    await sendPushNotification(userId, {
      title: "TICKET STATUS",
      message: "Your Ticket is "+updateBody.status,
  });

    const updatedTicketDetails = await Ticket.aggregate([
      {
        $match: { _id: ticket._id }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
      
      {
        $lookup: {
          from: 'roles',
          localField: 'userDetails.roleIds',
          foreignField: '_id',
          as: 'userRoleDetails'
        }
      },
      { $unwind: { path: '$userRoleDetails', preserveNullAndEmptyArrays: true } },
      
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'assignedToDetails'
        }
      },
      { $unwind: { path: '$assignedToDetails', preserveNullAndEmptyArrays: true } },

      { $unwind: { path: '$notes', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          $or: [
            { 'notes.status': 'open' },
            { 
              'notes.status': { $in: ['In-Progress', 'Action-Taken', 'closed'] },
              'notes.note': { $exists: true, $ne: '' }
            }
          ]
        }
      },
      {
        $group: {
          _id: '$_id',
          root: { $first: '$$ROOT' },
          notes: { $push: '$notes' }
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              '$root',
              { notes: '$notes' }
            ]
          }
        }
      },
      
      {
        $project: {
          _id: 0,
          id: { $toString: '$_id' },
          title: 1,
          description: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          userId: { $ifNull: ['$userDetails._id', null] },
          userName: {
            $cond: {
              if: { $and: [
                { $ifNull: ['$userDetails.firstName', false] },
                { $ifNull: ['$userDetails.lastName', false] }
              ]},
              then: { $concat: [
                { $ifNull: ['$userDetails.firstName', ''] },
                ' ',
                { $ifNull: ['$userDetails.lastName', ''] }
              ]},
              else: 'Unknown User'
            }
          },
          assignedToId: { $ifNull: ['$assignedToDetails._id', null] },
          assignedToName: {
            $cond: {
              if: { $and: [
                { $ifNull: ['$assignedToDetails.firstName', false] },
                { $ifNull: ['$assignedToDetails.lastName', false] }
              ]},
              then: { $concat: [
                { $ifNull: ['$assignedToDetails.firstName', ''] },
                ' ',
                { $ifNull: ['$assignedToDetails.lastName', ''] }
              ]},
              else: 'Unassigned'
            }
          },
          userRoleName: { $ifNull: ['$userRoleDetails.role', 'No Role'] },
          notes: {
            $arrayToObject: {
              $map: {
                input: '$notes',
                as: 'note',
                in: [
                  { $toString: '$$note.status' },
                  '$$note.note'
                ]
              }
            }
          }
        }
      }
    ]);




    if (updatedTicketDetails.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Ticket not found after update');
    }



    return {
      success: true,
      message: 'Ticket updated successfully',
      data: updatedTicketDetails[0] // Return the updated ticket details
    };
  } catch (error) {
    console.error("Error updating ticket:", error);
    throw new Error(`Failed to update ticket: ${error.message}`);
  }
};


/**
 * Delete ticket by id
 * @param {ObjectId} ticketId
 * @returns {Object}
 */
const deleteTicketById = async (ticketId) => {
  const ticket = await getTicketById(ticketId);
  if (!ticket) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ticket not found');
  }
  await ticket.deleteOne();
  return { status: "success",   msg:"data Deleted Successfully" };
};

const usercreateByTicket = async (ticketBody) => {
  try {
    // Let the ORM automatically set the createdAt and updatedAt fields
    const newTicket = await Ticket.create(ticketBody);
    const ticketData = {
      id: newTicket._id,
      title: newTicket.title,
      description: newTicket.description,
      user: newTicket.user,
      status: newTicket.status,
      clientId: newTicket.clientId,
      createdAt: newTicket.createdAt,
      updatedAt: newTicket.updatedAt
    };

    return ticketData;
  } catch (error) {
    console.error('Error during ticket creation:', error);
    throw new Error('Failed to create ticket');
  }
};

  
const groupTicketsByAdmin = async () => {
  try {
    const flatTickets = await Ticket.aggregate([
      {
        // Lookup to populate 'user' details (creator of the ticket)
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true // Allow tickets without user info
        }
      },
      {
        // Lookup to populate 'assignedTo' details (admin handling the ticket)
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'assignedToDetails'
        }
      },
      {
        $unwind: {
          path: '$assignedToDetails',
          preserveNullAndEmptyArrays: true // Allow tickets without assigned admin
        }
      },
      {
        // Project the necessary fields, handling nulls gracefully
        $project: {
          _id: 0,
          id: { $toString: '$_id' },
          title: 1,
          description: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          userId: { $ifNull: ['$userDetails._id', null] },
          userName: {
            $cond: {
              if: { $and: ['$userDetails.firstName', '$userDetails.lastName'] },
              then: { $concat: ['$userDetails.firstName', ' ', '$userDetails.lastName'] },
              else: 'Unknown User'
            }
          },
          assignedToId: { $ifNull: ['$assignedToDetails._id', null] },
          assignedToName: {
            $cond: {
              if: { $and: ['$assignedToDetails.firstName', '$assignedToDetails.lastName'] },
              then: { $concat: ['$assignedToDetails.firstName', ' ', '$assignedToDetails.lastName'] },
              else: 'Unassigned'
            }
          }
        }
      }
    ]);

    return {
      success: true,
      message: 'Tickets fetched successfully',
      data: flatTickets
    };
  } catch (error) {
    throw new Error('Error fetching tickets: ' + error.message);
  }
};

const groupTicketsByUser = async (req) => {
  try {

    const userId = await getUserId(req);


    const flatTickets = await Ticket.aggregate([
      {
        $match:{
          user:new ObjectId(userId)
        }
      },
      {
        // Lookup to populate 'user' details (creator of the ticket)
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true // Allow tickets without user info
        }
      },
      {
        // Lookup to populate 'user' details (creator of the ticket)
        $lookup: {
          from: 'requests',
          localField: 'requestId',
          foreignField: '_id',
          as: 'requestDetails'
        }
      },
      {
        $unwind: {
          path: '$requestDetails',
          preserveNullAndEmptyArrays: true // Allow tickets without user info
        }
      },
      {
        // Lookup to populate 'assignedTo' details (admin handling the ticket)
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'assignedToDetails'
        }
      },
      {
        $unwind: {
          path: '$assignedToDetails',
          preserveNullAndEmptyArrays: true // Allow tickets without assigned admin
        }
      },
      {
        // Project the necessary fields, handling nulls gracefully
        $project: {
          _id: 0,
          id: { $toString: '$_id' },
          title: 1,
          description: 1,
          notes:1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          userId: { $ifNull: ['$userDetails._id', null] },
          requestId:1,
          requestNumber:{ $ifNull: ['$requestDetails.requestNumber', null] },
          userName: {
            $cond: {
              if: { $and: ['$userDetails.firstName', '$userDetails.lastName'] },
              then: { $concat: ['$userDetails.firstName', ' ', '$userDetails.lastName'] },
              else: 'Unknown User'
            }
          },
          assignedToId: { $ifNull: ['$assignedToDetails._id', null] },
          assignedToName: {
            $cond: {
              if: { $and: ['$assignedToDetails.firstName', '$assignedToDetails.lastName'] },
              then: { $concat: ['$assignedToDetails.firstName', ' ', '$assignedToDetails.lastName'] },
              else: 'Unassigned'
            }
          }
        }
      }
    ]);


    return flatTickets;
  } catch (error) {
    throw new Error('Error fetching tickets: ' + error.message);
  }
};


const updateTicketStatus = async (ticketId, status) => {
  const ticket = await getTicketById(ticketId);
  if (!ticket) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ticket not found');
  }
  Object.assign(ticket, status);
  await ticket.save();
  return ticket;
};
const assignAdminAndUpdateStatus = async (ticketId, adminId, status, note) => {
  [ticketId, adminId].forEach(id => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`Invalid ID: ${id}`);
    }
  });

  const validStatuses = ['open', 'in-progress', 'Action-Taken', 'closed'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  // Find and update ticket
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new Error('Ticket not found');
  }

  // Update ticket fields
  ticket.assignedTo = new mongoose.Types.ObjectId(adminId);
  ticket.status = status;
  ticket.updatedBy = new mongoose.Types.ObjectId(adminId);
  
  // Add note to notes array (assuming notes is an array of objects)
  ticket.notes.push({
    note,
    status,
    addedBy: adminId,
    addedAt: new Date()
  });

  // Save with validation
  const updatedTicket = await ticket.save({ validateBeforeSave: true });
  
  return updatedTicket;
};


module.exports = {
  createTicket,
  queryTicket,
  getTicketById,
  getTickets,
  updateTicketById,
  deleteTicketById,
  usercreateByTicket,
  groupTicketsByAdmin,
  updateTicketStatus,
  assignAdminAndUpdateStatus,
  getAllTickets,
  groupTicketsByUser
};
