const mongoose = require('mongoose');
const Role = require('../src/models/boilerplate/role.model');
require('dotenv').config();

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
  });

const RoleData = [
  {
    role: 'Superadmin',
  },
];

// Function to seed data
async function seedData() {
  try {
    // Delete existing data
    await Role.deleteMany();

    // Insert new data
    await Role.insertMany(RoleData);
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
  }
}

// Call the seed function
seedData();
