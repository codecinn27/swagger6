const { MongoClient, ObjectId } = require('mongodb');
const url = 'mongodb+srv://codecinnpro:7G5lg1qQNpzglv04@cluster0.u7w8rcg.mongodb.net/?retryWrites=true&w=majority';
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 3000
const bcrypt = require('bcrypt');
const saltRounds = 10;
const collection1 = 'users';
const collection2 = 'visitors';
const collection3 = 'visitors_pass';
const dbName = 'vms1';
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const JWT_SECRET = 'hahaha';
const role1 = 'admin';
const role2 = 'host';
const cors = require('cors');


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(url);

const options = {
    definition:{
        openapi: "3.0.3",
        info:{
            title: "Visitor Management System BERR G6",
            version: "0.1",
            description:"Visitor Management System with admin, host, visitors. A system to issue visitors pass and store the record into the cloud database, Mongodb Atlas.",
            contact:{
                name: "Hee Yee Cinn",
                url:"cinn.com",
                email:"b022110115@student.utem.edu.my"
            },

        },
        tags:[
            {name:'Login', description:"Default endpoints"},
            {name: 'Admin', description:"Admin operation"},
            {name: 'Host', description:"Host operation"},
        ],
        components:{
            securitySchemes:{
                Authorization:{
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    value: "Bearer <JWT token here>",
                    description: "This is for authentication, you must logout to change the JWT token"
                }
            }
        },

    },
    //all the route.js file store inside the route file 
    apis:["./swagger.js"],
};
const spacs = swaggerJSDoc(options);
app.use("/g6", swaggerUi.serve, swaggerUi.setup(spacs));


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db(dbName).command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.use(express.json());
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });

    app.get('/',async(req,res)=>{
        res.send("helloworld")
    })

    app.post('/login', async (req, res) => {
        try{
            let data = req.body;
            const status = await login(client, data);
            res.json(status);
        }catch(error){
            console.error('Error during /login:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.get('/showCurrentlyLogin', async(req,res)=>{
      try{
        const data = await showCurrentLogin(req);
        res.json({data});
      }catch(error){
        console.error('Error during /showCurrentlyLogin:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    })

    app.get('/admin/visits',authenticateAdmin,async (req, res) => {
        try {
          const allVisits = await readVisitsData(client);
          res.status(200).json(allVisits);  // Set the status code explicitly
        } catch (error) {
          console.error('Error during /admin/visits:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.post('/admin/registerHost', authenticateAdmin,async (req, res) => {
        try {
          let data = req.body;
          const result = await registerHost(client, data);
          res.json(result);
        } catch (error) {
          console.error('Error during /admin/registerHost:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      });

    app.get('/admin/dumpHost', authenticateAdmin, async(req,res)=>{
      try {
        const allHost = await readHostData(client);
        res.status(200).json(allHost);  // Set the status code explicitly
      } catch (error) {
        console.error('Error during /admin/dumpHost:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })

    

    app.get('/host/:hostId',authenticateHost ,async(req,res)=>{
      try{
        const { hostId } = req.params;

        // Check if hostId is a valid ObjectId
        if (!ObjectId.isValid(hostId)) {
          return res.status(400).json({ error: 'Invalid hostId format' });
        }
        const result = await getWelcomeMessageForHost(client, hostId);
        res.status(result.status).json(result.data);

      }catch (error) {
          console.error(`Error during /host/${hostId}`, error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
    })

    app.get('/host/:hostId/visitors', authenticateHost,async(req,res)=>{
      try{
        const {hostId} = req.params;
        console.log(hostId);
        if (!ObjectId.isValid(hostId)) {
          return res.status(400).json({ error: 'Invalid hostId format' });
        }
        const result = await showHostVisitors(client, hostId);
        res.status(result.status).json(result.data);
      }catch(error){
        console.error(`Error during /host/${hostId}/visitors`, error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })
    app.post('/host/:hostId/issueVisitor', authenticateHost, async (req, res) => {
      try {
        const { hostId } = req.params;
        const data = req.body;
    
        // Validate that id is a valid ObjectId
        if (!ObjectId.isValid(hostId)) {
          return res.status(400).json({ error: 'Invalid hostId format' });
        }
        console.log('Request Body:', data);
        // Call the function to issue a visitor
        const result = await issueVisitorForHost(client, hostId,data);
    
        res.status(result.status).json(result.data);
      } catch (error) {
        console.error(`Error during /host/:hostId/issueVisitor`, error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });


  } catch (e) {
    console.error(e);

  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.error);


async function login( client, data) {
    const db = client.db(dbName);
    const visitsCollection = db.collection(collection1);
    try {
        // Find the user in the database
        // const userdata = await userCollection.find({});
        // console.log(userdata);
        const user = await visitsCollection.findOne({username: data.username});
        if (user) {
          console.log('User found:', user.username);
          console.log("user pass", user.password);
          console.log("input pass", data.password);
          const isPasswordValid = await bcrypt.compare(data.password, user.password);
          if(isPasswordValid){
          
            // Generate a JWT token
            const token = jwt.sign({ username: user.username, userId: user._id, category: user.category }, JWT_SECRET, {
              expiresIn: '1h',
            });
  
            // Check the user's category and generate the appropriate link
            let redirectLink;
            if (user.category === 'host') {
              redirectLink = `/host/${user._id}`;
            } else if (user.category === 'admin') {
              redirectLink = `/admin`;
            }else{
              return { status: 401, data: { error: 'Invalid category' } };;
            }     
            const allHost = await readHostData(client);
            console.log("JWT:", token);
            return {
              status: 200,
              data: {
                token,
                category: user.category,
                redirectLink,
                Host: allHost
              },
            };
          }else{
            return { status: 401, data: { error: 'Invalid credentials password' } };
          }
        }else{
          console.log(user);
          return { status: 401, data: { error: 'Invalid credentials' } };
        }


      } catch (error) {
        console.error('Error during login:', error);
        // Log additional information about the error
        console.error('Error Stack:', error.stack);
        // Handle different types of errors
        return { status: 500, data: { error: 'Internal Server Error' } };
      }
}

async function readVisitsData(client) {
    const db = client.db(dbName);
    const visitsCollection = db.collection(collection3);
    
    try {
        const allVisits = await visitsCollection.find({}).toArray();
        return allVisits;
    } catch (error) {
        console.error('Error fetching visits:', error);
        throw new Error('Internal Server Error');
    }
}

async function readHostData(client) {
  const db = client.db(dbName);
  const hostCollection = db.collection(collection1);
  
  try {
      const allVisits = await hostCollection.find({category:"host"}).toArray();
      return allVisits;
  } catch (error) {
      console.error('Error fetching visits:', error);
      throw new Error('Internal Server Error');
  }
}

async function encryptPassword(password) {
  const hash = await bcrypt.hash(password, saltRounds); 
  return hash 
}

async function decryptPassword(password, compare) {
  const match = await bcrypt.compare(password, compare)
  return match
}

async function registerHost(client, data){
  try{
     //to detect any error with your terminal
    console.log("Request body: ", data);
    const {username, password, email, phoneNumber} = data;
    // Check if the username is unique (you can add more validation if needed)
    
    const existingUser = await client.db(dbName).collection(collection1).findOne({username});
    if (existingUser){
      return {status:400 , data: { error: 'Username already exists' }};
    }

    await client.db(dbName).collection(collection1).insertOne({
      username,
      password,
      email,
      phoneNumber,
      category: "host",
      visitors: []
    });
    return {status:201, data: { message: 'Host registered susccessfully'}};
    }catch (error) {
      console.error('Error registering host:', error);
      return {status: 500, data: {error: 'Internal Server Error'}};

  }    
}

async function getWelcomeMessageForHost(client, hostId) {
  try {
    // Convert the string id to ObjectId
    const objectId = new ObjectId(hostId);

    // Find the document by _id
    const result = await client.db(dbName).collection(collection1).findOne({ _id: objectId });

    if (!result) {
      return { status: 404, data: { error: "User not found" } };
    }

    const { username } = result;

    return { status: 200, data: { message: `Welcome, ${username}` } };
  } catch (error) {
    console.error('Error during getWelcomeMessageForHost:', error);
    return { status: 500, data: { error: 'Internal Server Error' } };
  }
}

async function showHostVisitors(client, hostId){
  try {
    // Convert the string id to ObjectId
    const objectId = new ObjectId(hostId);

    // Find the document by _id
    const result = await client.db(dbName).collection(collection1).findOne({ _id: objectId });

    if (!result) {
      return { status: 404, data: { error: "User not found" } };
    }
    
    const visitorCollection = result.visitors;
    return {status: 200, data:{ visitorCollection}};
  } catch (error) {
    console.error('Error during showHostVisitors:', error);
    return { status: 500, data: { error: 'Internal Server Error' } };
  } 
}

async function showCurrentLogin (req){
  // Extract the token from the Authorization header
  const header = req.headers['authorization'];
  
  // check first if whether the token is present, if not the app will crash 
  //then only do the header.split
  // Verify the token
  if (!header) {
    return {status:401, data: { error: 'Unauthorized: Missing token' }};
  }
  //split the bearer token 
  // take the index 1 , to exclude the bearer words
  let token = header.split(' ')[1];

  //to check whether the token pass in is what you want
//  console.log("Token",token);
  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);;
    const data = {
      currentLogin: decoded, // Wrap the decoded token inside an object
    };
    // Log decoded information for troubleshooting
    console.log('Decoded Token:', decoded);
    // Attach user information to the request if needed
    return data;
  } catch (err) {
    return {status: 403,data: { error: 'Forbidden: Invalid token' }};
  }
};


function authenticateAdmin(req,res,next){
  // Extract the token from the Authorization header
  const header = req.headers.authorization;
  
  // check first if whether the token is present, if not the app will crash 
  //then only do the header.split
  // Verify the token

  if (!header) {
    res.status(401).json({error: 'Unauthorized: Missing token'});
  }
  //split the bearer token 
  // take the index 1 , to exclude the bearer words
  let token = header.split(' ')[1];

  //to check whether the token pass in is what you want
//  console.log("Token",token);
    // Verify the token
    jwt.verify(token, JWT_SECRET, function(err, decoded){

      if(err){
        res.status(403).json({error:'Invalid token'});
        
      }else{
        // Check if the token has the required role
        if (decoded.category !== role1) {
          res.status(403).json({error: 'Forbidden: Insufficient permissions'})
        }
        // Log decoded information for troubleshooting
        console.log('Decoded Token:', decoded);
        return next();
      }
    });
  
};

function authenticateHost(req,res,next){
  // Extract the token from the Authorization header
  const header = req.headers.authorization;
  
  // check first if whether the token is present, if not the app will crash 
  //then only do the header.split
  // Verify the token

  if (!header) {
    res.status(401).json({error: 'Unauthorized: Missing token'});
  }
  //split the bearer token 
  // take the index 1 , to exclude the bearer words
  let token = header.split(' ')[1];

  //to check whether the token pass in is what you want
//  console.log("Token",token);
    // Verify the token
    jwt.verify(token, JWT_SECRET, function(err, decoded){

      if(err){
        res.status(403).json({error:'Invalid token'});
        
      }else{
        // Check if the token has the required role
        if (decoded.category !== 'host') {
          res.status(403).json({error: 'Forbidden: Insufficient permissions'})
        }
        // Log decoded information for troubleshooting
        console.log('Decoded Token:', decoded);
        return next();
      }
    });
  
};

async function issueVisitorForHost(client, hostId, data) {
  
  try{
    const {visitorName, visitorPhoneNumber, destination} = data;
    const hostUser = await client.db(dbName).collection(collection1).findOne({ _id: ObjectId(hostId), category: role2 });

    // Create a new visit
    const visit = {
      destination: destination,
      visitTime: new Date(),
      from: null,
    };

    if (!hostUser) {
      return { status: 404, data: { error: 'Host not found' } };
    }
    const existingVisitor = await client.db(dbName).collection(collection2).findOne({name: visitorName});
    if(existingVisitor){
      existingVisitor.visit_pass.push(visit);
      visit.from = existingVisitor._id;
      await client.db(dbName).collection(collection3).insertOne(visit);
      await client.db(dbName).collection(collection2).updateOne({ _id: existingVisitor._id}, { $push: { visit_pass: visit } });
      await client.db(dbName).collection(collection1).updateOne({_id: hostUser._id},{$push:{visitors: existingVisitor}});
      return { status: 200, data: `Visitor ${existingVisitor.name} issued successfully for host ${hostId}` };
    }

    // Create a new visitor
    const visitor = {
      name: visitorName,
      phoneNumber: visitorPhoneNumber,
      visit_pass: [],
    };

    
    
    // Connect the visitor data to the host user schema
    hostUser.visitors.push(visitor);
    // Save the visitor data to the database
    const visitorResult = await client.db(dbName).collection(collection2).insertOne(visitor);

    // Update the visitor with the visit ID
    visitor.visit_pass.push(visit);
    visit.from = visitor._id;
    // Save the visitor and visit data to the database
    await client.db(dbName).collection(collection3).insertOne(visit);
    await client.db(dbName).collection(collection2).updateOne({ _id: visitorResult.insertedId }, { $set: { visit_pass: visitor.visit_pass } });

    
    return { status: 200, data: `Visitor ${visitorName} issued successfully for host ${hostId}` };
  } catch (error) {
    console.error('Error issuing visitor:', error);
    return { status: 500, data: { error: 'Internal Server Error' } };
  }
}
