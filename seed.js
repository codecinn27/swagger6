const { MongoClient } = require('mongodb');
const url = 'mongodb+srv://codecinnpro:7G5lg1qQNpzglv04@cluster0.u7w8rcg.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'vms1';
const client = new MongoClient(url, { useUnifiedTopology: true });
const bcrypt = require('bcrypt');
const saltRounds = 10;
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
    const hash = await bcrypt.hash("adminpassword", 10); 
    const user = {
      username: "admin1",
      password: hash,
      email: "admin@example.com",
      phoneNumber: 1234567890,
      category: "admin",
      visitors: [],
    };

    // Sample visitor data
    const visitor1 = {
      name: "Visitor123",
      phoneNumber: 1234567890,
      visits: [],
    };

    const visit1 = {
      purposeOfVisit: "Meeting",
      visitTime: new Date('2023-01-01T10:00:00Z'),
      from:null
    };

    // Connect the visitor data to the user schema
    user.visitors.push(visitor1);

    // Save the user data to the database
    const visitor1Result = await db.collection('visitors').insertOne(visitor1);

    // Update the visitor with the visit ID
    visitor1.visits.push(visit1);
    visit1.from = visitor1._id;

    // Save the visitor and visit data to the database
    await db.collection('visits').insertOne(visit1);
    await db.collection('visitors').updateOne({ _id: visitor1Result.insertedId }, { $set: { visits: visitor1.visits } });
    await db.collection('users').insertOne(user);
    // Sample host user data
    const ePass2 = await encryptPassword('hostpassword');
    const hostUser = {
        username: "host1",
        password: ePass2,
        email: "host@example.com",
        phoneNumber: 9876543210,
        category: "host",
        visitors: [],
    };

    // Sample visitor data for host
    const visitor2 = {
        name: "Visitor2",
        phoneNumber: 1234567890,
        visits: [],
    };

    const visit2 = {
        purposeOfVisit: "Interview",
        visitTime: new Date('2023-01-01T15:00:00Z'),
        from:null
    };

    // Connect the visitor data to the host user schema
    hostUser.visitors.push(visitor2);
   
    const visitor2Result = await db.collection('visitors').insertOne(visitor2);

    // Update the visitor with the visit ID
    visitor2.visits.push(visit2);
    visit2.from = visitor2._id;
    // Save the visitor and visit data to the database
    await db.collection('visits').insertOne(visit2);
    await db.collection('visitors').updateOne({ _id: visitor2Result.insertedId }, { $set: { visits: visitor2.visits } });
    // Save the host data to the database, last save cause host it the top root
    await db.collection('users').insertOne(hostUser);
    console.log('Data seeded successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    // Disconnect from the database after seeding
    await client.close();
  }
}
async function encryptPassword(password) {
  const hash = await bcrypt.hash(password, saltRounds); 
  return hash; 
}

// Call the seedData function to populate the database
seedData();
