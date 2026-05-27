const mongoose = require('mongoose');
const Document = require('../src/models/boilerplate/document.model');
const GroupDocument = require('../src/models/boilerplate/groupdocument.model');
const Client = require('../src/models/client/clients.model');
const User = require('../src/models/boilerplate/users.model');
require('dotenv').config();

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
  });

async function documentseedData() {
  try {
    const adminUser = await User.findOne({ email: 'admin@nplus.com' });
    if (!adminUser) {
      console.log('Taxi admin not found. Please ensure it exists in the User collection. Skipping seeding.');
      return;
    }

    const GroupDocumentData = [{ name: 'Driver', clientId: adminUser.clientId }];

    const existingGroupDocuments = await GroupDocument.find({
      name: { $in: ['Driver'] },
    });

    if (existingGroupDocuments.length < 2) {
      await GroupDocument.insertMany(GroupDocumentData);
      console.log('Group Document data seeded successfully!');
    } else {
      console.log('Group Document data already exists. Skipping seeding.');
    }

    const driverDocument = await GroupDocument.findOne({ name: 'Driver' });

    if (!driverDocument) {
      console.log('Group documents are missing. Skipping document seeding.');
      return;
    }

    const DocumentData = [
      {
        documentName: 'Profile',
        clientId: adminUser.clientId,
        documentId: driverDocument._id,
        required: true,
        identifier: false,
        expiryDate: false,
        issueDate: false,
        imageRequired: true,
      },
    ];

    const existingDocuments = await Document.find({
      documentName: {
        $in: ['Driver Image'],
      },
      clientId: adminUser._id,
    });

    if (existingDocuments.length === 0) {
      await Document.insertMany(DocumentData);
      console.log('Documents seeded successfully!');
    } else {
      console.log('Documents already exist. Skipping seeding.');
    }
  } catch (err) {
    console.error('Error seeding data:', err);
  }
}

module.exports = documentseedData;

documentseedData();
