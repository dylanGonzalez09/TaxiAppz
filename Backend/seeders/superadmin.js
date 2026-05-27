const mongoose = require('mongoose');
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

const UserData = [
  {
    firstname: 'superadmin',
    lastname: 'kumar',
    email: 'admin1@nplus.com',
    phone_number: '91591745054',
    time_zone: 'india',
    roleIds: ['668645462e75510101af8b43'],
    language: '678f1eeab0f5162b00d99762',
    countryCode: '678f1f478d45e10237e432bf',
    password: 'admin@123',
  },
];

// Function to seed data
async function seedData() {
  try {
    // Delete existing data
    await User.deleteMany();

    // Insert new data
    await User.insertMany(UserData);
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
  }
}

// Call the seed function
seedData();
