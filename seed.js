const { MongoClient } = require('mongodb');
const url = 'mongodb+srv://codecinnpro:7G5lg1qQNpzglv04@cluster0.u7w8rcg.mongodb.net/?retryWrites=true&w=majority'
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

    // Get the highest visitor ID
    const highestVisitorId = await db.collection(collection2).find().sort({ _id: -1 }).limit(1).toArray();
    let nextVisitorId = highestVisitorId.length > 0 ? highestVisitorId[0]._id + 1 : 101;
    // Sample user data
    const hash = await bcrypt.hash("Adminpassword@123", 10); 
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
      visitor_id: nextVisitorId++,
      name: "Visitor123",
      phoneNumber: 123543539,
      destination: "6, Jalan Oz 7",
      visitTime: new Date('2023-01-01T10:00:00Z'),
      pass: false,
      from:null
    };

    // Connect the visitor data to the user schema
    user.visitors.push(visitor1);

    // Save the user data to the database
    const visitor1Result = await db.collection(collection2).insertOne(visitor1);

    await db.collection(collection1).insertOne(user);
    // Update the visitor with the visit ID
    const updateVisitor = await db.collection(collection2).updateOne({name: visitor1.name},{$set:{from : user._id}});
    const updateUser_visitors_from = await db.collection(collection1).updateOne({username: user.username}, {$set: {'visitors.0.from': visitor1._id}});
    // Sample host user data
    const ePass2 = await encryptPassword('Hostpassword@123');
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
        visitor_id: nextVisitorId++,
        name: "Visitor23",
        phoneNumber: 1234567890,
        destination: "5, Jalan Oz 6",
        visitTime: new Date('2023-01-01T15:00:00Z'),
        pass: false,
        from:null
    };
    // Connect the visitor data to the host user schema
    hostUser.visitors.push(visitor2);
   
    const visitor2Result = await db.collection(collection2).insertOne(visitor2);
    await db.collection('users').insertOne(hostUser);
    // Update the visitor with the visit ID
    const updateVisitor2 = await db.collection(collection2).updateOne({name: visitor2.name},{$set:{from : hostUser._id}});
    const updateUser_visitor_from = await db.collection(collection1).updateOne({username: hostUser.username}, {$set: {'visitors.0.from' : hostUser._id}});
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
