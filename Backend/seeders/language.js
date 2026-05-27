const mongoose = require('mongoose');
const Language = require('../src/models/boilerplate/languages.model');
require('dotenv').config();

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
  });

const LanguageData = [
  {
    name: 'en',
    code: 'en',
    status: true,
  },
  {
    name: 'ar',
    code: 'ar',
    status: true,
  },
];

// Function to seed data
async function seedData() {
  try {
    // Delete existing data
    await Language.deleteMany();
    // Insert new data
    await Language.insertMany(LanguageData);
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
  }
}

// Call the seed function
seedData();
