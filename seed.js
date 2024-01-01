const { MongoClient } = require('mongodb');
const url = 'mongodb+srv://codecinnpro:7G5lg1qQNpzglv04@cluster0.u7w8rcg.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'vms1';
const client = new MongoClient(url, { useUnifiedTopology: true });
const bcrypt = require('bcrypt');
const saltRounds = 10;
const collection1 = 'users';
const collection2 = 'visitors';
const collection3 = 'visitors_pass';
async function seedData() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    // Delete all existing data
    await db.collection(collection1).deleteMany({});
    await db.collection(collection2).deleteMany({});
    await db.collection(collection3).deleteMany({});
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
      visit_pass: [],
    };

    const visit1 = {
      destination: "6, Jalan Oz 7",
      visitTime: new Date('2023-01-01T10:00:00Z'),
      from:null
    };

    // Connect the visitor data to the user schema
    user.visitors.push(visitor1);

    // Save the user data to the database
    const visitor1Result = await db.collection(collection2).insertOne(visitor1);

    // Update the visitor with the visit ID
    visitor1.visit_pass.push(visit1);
    visit1.from = visitor1._id;

    // Save the visitor and visit data to the database
    await db.collection(collection3).insertOne(visit1);
    await db.collection(collection2).updateOne({ _id: visitor1Result.insertedId }, { $set: { visit_pass: visitor1.visit_pass } });
    await db.collection(collection1).insertOne(user);
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
        visit_pass: [],
    };

    const visit2 = {
        destination: "5, Jalan Oz 6",
        visitTime: new Date('2023-01-01T15:00:00Z'),
        from:null
    };

    // Connect the visitor data to the host user schema
    hostUser.visitors.push(visitor2);
   
    const visitor2Result = await db.collection(collection2).insertOne(visitor2);

    // Update the visitor with the visit ID
    visitor2.visit_pass.push(visit2);
    visit2.from = visitor2._id;
    // Save the visitor and visit data to the database
    await db.collection(collection3).insertOne(visit2);
    await db.collection(collection2).updateOne({ _id: visitor2Result.insertedId }, { $set: { visit_pass: visitor2.visit_pass } });
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
