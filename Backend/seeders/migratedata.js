const { MongoClient } = require('mongodb');

// Configuration for source and destination clusters
const sourceConfig = {
  uri: 'mongodb+srv://admin:1234@cluster0.vosswk8.mongodb.net/?retryWrites=true&w=majority',
  dbName: 'Cluster0',
};

const destConfig = {
  uri: 'mongodb+srv://admin:1234@taxi.orbdz.mongodb.net/?retryWrites=true&w=majority',
  dbName: 'taxi',
};

async function migrateData() {
  const sourceClient = new MongoClient(sourceConfig.uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const destClient = new MongoClient(destConfig.uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    // Connect to the source and destination databases
    await sourceClient.connect();
    await destClient.connect();


    const sourceDb = sourceClient.db(sourceConfig.dbName);
    const destDb = destClient.db(destConfig.dbName);



    // List collections from the source database
    const collections = await sourceDb.listCollections().toArray();



    for (const collection of collections) {
      const collectionName = collection.name;

      // Read data from the source collection using a cursor
      const sourceCollection = sourceDb.collection(collectionName);
      const cursor = sourceCollection.find({});

      while (await cursor.hasNext()) {
        const data = await cursor.next();

        // Write data to the destination collection
        const destCollection = destDb.collection(collectionName);
        try {
          await destCollection.updateOne(
            { _id: data._id },
            { $set: data },
            { upsert: true }
          );
        } catch (err) {
          console.error(`Failed to insert document into collection ${collectionName}:`, err);
        }
      }
    }
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    // Close connections
    await sourceClient.close();
    await destClient.close();
  }
}

migrateData();
