const { MongoClient } = require('mongodb');

const url = 'mongodb+srv://codecinnpro:7G5lg1qQNpzglv04@cluster0.u7w8rcg.mongodb.net/vms1?retryWrites=true&w=majority';
const dbName = 'vms1';
const client = new MongoClient(url, { useUnifiedTopology: true });

async function seedData() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    // Delete all existing data
    await db.collection('users').deleteMany({});
    await db.collection('visitors').deleteMany({});
    await db.collection('visits').deleteMany({});
    // Sample user data
    const user = {
      username: 'admin1',
      password: 'adminpassword',
      email: 'admin@example.com',
      phoneNumber: 1234567890,
      category: 'admin',
      visitors: [],
    };

    // Sample visitor data
    const visitor1 = {
      name: 'Visitor434',
      phoneNumber: 1234567890,
      visits: [],
    };

    const visit1 = {
      purposeOfVisit: 'Meeting',
      visitTime: new Date('2023-01-01T10:00:00Z'),
    };

    // Connect the visitor data to the user schema
    user.visitors.push(visitor1);

    // Save the user data to the database
    const userResult = await db.collection('users').insertOne(user);
    const visitor1Result = await db.collection('visitors').insertOne(visitor1);

    // Update the visitor with the visit ID
    visitor1.visits.push({ _id: visit1._id });

    // Save the visitor and visit data to the database
    await db.collection('visits').insertOne(visit1);
    await db.collection('visitors').updateOne({ _id: visitor1Result.insertedId }, { $set: { visits: visitor1.visits } });
    // Sample host user data
    const hostUser = {
        username: 'host1',
        password: 'hostpassword',
        email: 'host@example.com',
        phoneNumber: 9876543210,
        category: 'host',
        visitors: [],
    };

    // Sample visitor data for host
    const visitor2 = {
        name: 'Visitor2',
        phoneNumber: 1234567890,
        visits: [],
    };

    const visit2 = {
        purposeOfVisit: 'Interview',
        visitTime: new Date('2023-01-01T15:00:00Z'),
    };

    // Connect the visitor data to the host user schema
    hostUser.visitors.push(visitor2);

    // Save the host data to the database
    const hostUserResult = await db.collection('users').insertOne(hostUser);
    const visitor2Result = await db.collection('visitors').insertOne(visitor2);

    // Update the visitor with the visit ID
    visitor2.visits.push({ _id: visit2._id });

    // Save the visitor and visit data to the database
    await db.collection('visits').insertOne(visit2);
    await db.collection('visitors').updateOne({ _id: visitor2Result.insertedId }, { $set: { visits: visitor2.visits } });
    
    console.log('Data seeded successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    // Disconnect from the database after seeding
    await client.close();
  }
}

// Call the seedData function to populate the database
seedData();
