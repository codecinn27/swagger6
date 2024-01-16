require("dotenv").config();
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const url = process.env.MONGO_URL ;
const credentials = process.env.certificate;
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 3000;
const bcrypt = require('bcrypt');
const saltRounds = 10;
const collection1 = 'users';
const collection2 = 'visitors';
const collection3 = 'users_test';
const dbName = 'vms1';
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const JWT_SECRET = process.env.JWT_SECRET;
const role1 = 'admin';
const role2 = 'host';
const cors = require('cors');
const qrCode_c = require('qrcode');
const rateLimit = require('express-rate-limit');
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(url, {tlsCertificateKeyFile: credentials, serverApi: ServerApiVersion.v1 });

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
            {name:'Public', description:"Public API"},
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
app.use(cors());
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

    //success
    app.post('/login', rateLimiter, async (req, res) => {
        try{
            let data = req.body;
            const status = await login(client, data);
            res.json(status);
        }catch(error){
            console.error('Error during /login:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    //success
    app.get('/showCurrentlyLogin', async(req,res)=>{
      try{
        const data = await showCurrentLogin(req);
        res.json({data});
      }catch(error){
        console.error('Error during /showCurrentlyLogin:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    })

    //success
    app.get('/retrievePass/:visitor_id', authenticateAll, async(req,res)=>{
      try{
          const {visitor_id} = req.params;
          const result = await qrCodeCreation(client, visitor_id);
          if (result.status && result.status === 404) {
            // If visitor not found, return a custom error response
            res.status(404).json(result.data);
          }else if(result.status && result.status ===500){
            // If internal server error, return a custom error response
            res.status(500).json(result.data);
          } else {
            res.setHeader('Content-Type', 'image/png');
            res.end(result, 'binary');
          }
      }catch (error) {
          console.error('Error during /retrievePass/:id', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
    } )
    // success
    app.get('/retrieveContact/:visitor_id', authenticateAll, async(req,res)=>{
      try{
          const {visitor_id} = req.params;
          const result = await retrieveHostContact(client, visitor_id);
          res.json({result});
      }catch(error){
        console.error("Error during /retrieveContact/:visitor_id", error);
        res.status(500).json({error: 'Internal Serve Error'});
      }
    })

    //success
    app.get('/admin/visitors',authenticateAdmin,async (req, res) => {
        try {
          const allVisits = await readVisitsData(client);
          res.status(200).json(allVisits);  // Set the status code explicitly
        } catch (error) {
          console.error('Error during /admin/visits:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    //success
    app.post('/create/host', authenticateAdmin,async (req, res) => {
        try {
          let data = req.body;
          const result = await registerHost(client, data);
          res.json(result);
        } catch (error) {
          console.error('Error during /create/host:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      });
    
    //success
    app.post('/create/test/host', async (req, res) => {
      try {
        let data = req.body;
        const result = await registerHost1(client, data);
        res.json(result);
      } catch (error) {
        console.error('Error during /crete/test/host:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.post('/delete/visitors', extractUserInfo, async(req,res)=>{
      try{
        let data = req.body;
        console.log("in /delete/visitors : req.userInfo: ",req.userInfo);
        const result = await deleteVisitor(client, data, req.userInfo);
        res.json(result);
      }catch(error){
        console.error('Error during /delete/visitors: ', error);
        res.status(500).json({error: 'Internal server Error '});
      }
    })

    //success
    app.get('/admin/dumpHost', authenticateAdmin, async(req,res)=>{
      try {
        const allHost = await readHostData(client);
        res.status(200).json(allHost);  // Set the status code explicitly
      } catch (error) {
        console.error('Error during /admin/dumpHost:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })

    app.patch('/admin/editHost/:id',authenticateAdmin, async(req,res)=>{
      try{
        const {id} = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: 'Invalid hostId format' });
        }
        const edit = req.body;
        const result = await editHost(client, id, edit);
        res.status(result.status).json(result.data);
      }catch(error){
        console.error('Error during /admin/editHost:', error);
        res.status(500).json({error: 'Internal Server Error'});
      }
    })

    app.patch('/admin/editHostPass/:id', authenticateAdmin, async(req,res)=>{
      try{
          const {id} = req.params;
          if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid hostId format' });
          }
          const {oldpassword, newpassword} = req.body;
          const result = await editHostPassword(client, id, oldpassword, newpassword);
          res.status(result.status).json(result.data);
      }catch(error){
        console.error('Error during /admin/editHostPass: ', error);
        res.status(500).json({error: 'Internal Server Error'});
      }
    })

    app.delete('/admin/deleteHost/:id', authenticateAdmin, async(req,res)=>{
      try{
        const {id} = req.params;
        if(!ObjectId.isValid(id)){
          return res.status(400).json({error: 'Invalid id format'});
        }
        const result = await deleteHost(client, id);
        res.status(result.status).json(result.data);
      }catch(error){
        console.error('Error during /admin/deleteHost/:id : ',error);
        res.status(500).json({error: 'Internal Server Error'});
      }
    })

    //success
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
    //success
    app.get('/host/:hostId/visitors', authenticateAll,async(req,res)=>{
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
    //success
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
    let allHost; // Declare allHost outside the conditional blocks
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
              allHost = 'Insufficient permissions';
            } else if (user.category === 'admin') {
              redirectLink = `/admin`;
              allHost = await readHostData(client);
            }else{
              return {status:401 , data: { error: 'Invalid category' }};
  
            }     
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
            return {status:401 , data: { error: 'Invalid credentials password' }};
          }
        }else{
          console.log(user);
          return {status:401 , data: { error: 'Invalid credentials' }};
          
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
    const visitsCollection = db.collection(collection2);
    
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
  return hash; 
}

async function decryptPassword(userProvidedPassword, storedHashedPassword) {
  const match = await bcrypt.compare(userProvidedPassword, storedHashedPassword)
  return match;
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
    const hash = await bcrypt.hash(password,10);
    await client.db(dbName).collection(collection1).insertOne({
      username,
      password: hash,
      email,
      phoneNumber: String(phoneNumber), // Convert phoneNumber to string
      category: "host",
      visitors: []
    });
    return {status:201, data: { message: 'Host registered susccessfully'}};
    }catch (error) {
      console.error('Error registering host:', error);
      return {status: 500, data: {error: 'Internal Server Error'}};

  }    
}

//use for testing , save to different collection
async function registerHost1(client, data){
  try{
     //to detect any error with your terminal
    console.log("Request body: ", data);
    const {username, password, email, phoneNumber} = data;
    // Check if the username is unique (you can add more validation if needed)
    
    const existingUser = await client.db(dbName).collection(collection3).findOne({username});
    if (existingUser){
      return {status:400 , data: { error: 'Username already exists' }};
    }
    const hash = await bcrypt.hash(password,10);
    await client.db(dbName).collection(collection3).insertOne({
      username,
      password: hash,
      email,
      phoneNumber: String(phoneNumber), // Convert phoneNumber to string
      category: "host",
      visitors: []
    });
    return {status:201, data: { message: 'Test Host registered susccessfully'}};
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
    return res.status(401).json({error: 'Unauthorized: Missing token'});
  }
  //split the bearer token 
  // take the index 1 , to exclude the bearer words
  let token = header.split(' ')[1];

  //to check whether the token pass in is what you want
//  console.log("Token",token);
    // Verify the token
    jwt.verify(token, JWT_SECRET, function(err, decoded){

      if(err){
        return res.status(403).json({error:'Invalid token'});
        
      }else{
        // Check if the token has the required role
        if (decoded.category !== role1) {
          return res.status(403).json({error: 'Forbidden: Insufficient permissions'})
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
    return res.status(401).json({error: 'Unauthorized: Missing token'});
  }
  //split the bearer token 
  // take the index 1 , to exclude the bearer words
  let token = header.split(' ')[1];

  //to check whether the token pass in is what you want
//  console.log("Token",token);
    // Verify the token
    jwt.verify(token, JWT_SECRET, function(err, decoded){

      if(err){
        return res.status(403).json({error:'Invalid token'});
        
      }else{
        // Check if the token has the required role
        if (decoded.category !== 'host') {
          return res.status(403).json({error: 'Forbidden: Insufficient permissions'})
        }
        // Log decoded information for troubleshooting
        console.log('Decoded Token:', decoded);
        return next();
      }
    });
  
};

function authenticateAll(req,res,next){
  // Extract the token from the Authorization header
  const header = req.headers.authorization;
  
  // check first if whether the token is present, if not the app will crash 
  //then only do the header.split
  // Verify the token

  if (!header) {
    return res.status(401).json({error: 'Unauthorized: Missing token'});
  }
  //split the bearer token 
  // take the index 1 , to exclude the bearer words
  let token = header.split(' ')[1];

  //to check whether the token pass in is what you want
//  console.log("Token",token);
    // Verify the token
    jwt.verify(token, JWT_SECRET, function(err, decoded){

      if(err){
        return res.status(403).json({error:'Invalid token'});
        
      }else{
        // Check if the token has the required role
        if (decoded.category !== role1 && decoded.category!==role2) {
          return res.status(403).json({error: 'Forbidden: Insufficient permissions'})
        }
        // Log decoded information for troubleshooting
        console.log('Decoded Token:', decoded);
        return next();
      }
    });
  
};

async function issueVisitorForHost(client, hostId, data) {
  
  try{
    // Convert the string id to ObjectId
    const objectId = new ObjectId(hostId);
    const {name, phoneNumber, destination} = data;
    const hostUser = await client.db(dbName).collection(collection1).findOne({ _id: objectId, category: role2 });
    if (!hostUser) {
      return { status: 404, data: { error: 'Host not found' } };
    }
    // Calculate the new visitor_id based on the total number of registered visitors
    const totalVisitors = await client.db(dbName).collection(collection2).countDocuments();
    const newVisitorId = 100 + totalVisitors + 1;
    // Create a new visit
    const visitor_t = {
      visitor_id : newVisitorId,
      name,
      phoneNumber: String(phoneNumber), // Convert phoneNumber to string
      destination: destination,
      visitTime: new Date(),
      pass: false,
      from: hostUser._id,
    };

    await client.db(dbName).collection(collection1).updateOne({_id:hostUser._id},{$push:{visitors: visitor_t}});
    await client.db(dbName).collection(collection2).insertOne(visitor_t);

    return { status: 200, data: `Visitor ${visitor_t.name} issued successfully for host ${hostUser.username}, with visitor_id ${newVisitorId}` };
  } catch (error) {
    console.error('Error issuing visitor:', error);
    return { status: 500, data: { error: 'Internal Server Error' } };
  }
}


async function qrCodeCreation(client, id){
  try{
    console.log("this is id :", id);
    const data = await client.db(dbName).collection(collection2).find({}).toArray();
    console.log(data);
    const visitorResult = await client.db(dbName).collection(collection2).findOne({visitor_id: parseInt(id)});
    if(!visitorResult){
      throw new Error( "Visitor not yet register");
    }
    const visitorData = {
      visitor_id : visitorResult.visitor_id,
      name: visitorResult.name,
      phoneNumber: visitorResult.phoneNumber,
      destination: visitorResult.destination,
      visitTime: visitorResult.visitTime
    }
    const stringdata = JSON.stringify(visitorData)
    const qrCode_produced = await qrCode_c.toBuffer(stringdata, {type: 'png'});
    // Set the pass field to true in the database
    const result = await client.db(dbName).collection(collection2).updateOne({visitor_id: parseInt(id)},{$set:{pass: true}});
    if(!result){
      console.log("fail");
    }
    return (qrCode_produced);
  }catch(error){
    // If the error is about the visitor not being registered, return a custom error response
    if (error.message === "Visitor not yet registered") {
      return { status: 404, data: { error: "Visitor not yet registered" } };
    }
    console.error('Error retrieving qr code for the visitor pass:', error);
    return{status: 500, data:{ error: 'Internal Server Error'}};
  }

}

async function retrieveHostContact(client, visitor_id){
  try{
    const visitor = await client.db(dbName).collection(collection2).findOne({visitor_id: parseInt(visitor_id)});
    if(!visitor){
      return {status : 404, data: {error: "Visitor not found"}};
    }
    if(visitor.pass == false){
      return {status : 404, data: {error: "Visitor pass not yet retrive, cannot be able to acquired host number"}};
    }
    console.log("success half way");
    const host_id = visitor.from;
    const host_id2 = new ObjectId(host_id);
    const hostUser = await client.db(dbName).collection(collection1).findOne({_id:host_id2});
    return {status: 200, data: `Visitor ${visitor.name} going to ${visitor.destination} has a host number of  ${hostUser.phoneNumber} and is register by host: ${hostUser.username}`};
  }catch(error){
    console.error('Error retrieving host number:', error);
    return{status: 500, data:{ error: 'Internal Server Error'}};
  }
}

async function editHost(client, hostId, edit){
  try{
      const objectId = new ObjectId(hostId);
      const result = await client.db(dbName).collection(collection1).findOne({_id: objectId, category:role2});
      if (!result) {
        return { status: 404, data: { error: 'Host not found' } };
      }
      if(edit.password){
        return {status :404, data:{error: 'Cannot edit password using this route'}};
      }
      const updataHost = await client.db(dbName).collection(collection1).updateOne({_id: objectId}, {$set: edit});

      if(updataHost.matchedCount == 1){
        return {status: 200, data: 'Update host data successfully'};
      }else{
        return {status: 404, data: {error}};
      }
  }catch(error){
    console.error('Error editing host information: ', error);
    return{status: 500, data:{error: 'Internal Server Error'}};
  }
}

const checkStrongPassword = (password) => {
  // Define criteria for a strong password
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  // Check password against criteria
  const isStrong = (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSpecialChar
  );

  // Generate an array of reasons why the password might not be strong
  const reasons = [];
  if (password.length < minLength) {
      reasons.push('Password should be at least 8 characters long.');
  }
  if (!hasUpperCase) {
      reasons.push('Password should contain at least one uppercase letter.');
  }
  if (!hasLowerCase) {
      reasons.push('Password should contain at least one lowercase letter.');
  }
  if (!hasNumber) {
      reasons.push('Password should contain at least one number.');
  }
  if (!hasSpecialChar) {
      reasons.push('Password should contain at least one special character.');
  }

  return {
      isStrong,
      reasons,
  };
};

async function editHostPassword(client, hostId, oldpassword, newpassword){
  try{
    const objectId = new ObjectId(hostId);
    const result = await client.db(dbName).collection(collection1).findOne({_id: objectId, category:role2});
    if(!result){
      return {status: 404, data:{error : 'Host not found'}};
    }
    const strongPass = checkStrongPassword(newpassword);
    if(!strongPass.isStrong){
      return{ status: 400, data:{error: 'Weak password', reasons: strongPass.reasons}};
    }
    const match = await decryptPassword(oldpassword ,result.password);
    if(!match){
      return{status: 401,data:{error: 'Invalid old password'} };
    }
    const encryptedNewPassword = await bcrypt.hash(newpassword, saltRounds); 
    const updateHostPass = await client.db(dbName).collection(collection1).updateOne({_id: objectId}, {$set:{password: encryptedNewPassword}});
    if (updateHostPass.matchedCount === 1) {
      return { status: 200, data: 'Host password updated successfully' };
    } else {
      return { status: 500, data: { error: 'Failed to update host password' } };
    }
  }catch(error){
    console.error('Error editing host password: ', error);
    return{status: 500, data:{error: 'Internal Server Error'}};
  }
}

// Middleware to extract user information from the token
const extractUserInfo = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      res.status(401).json({error: 'Unauthorized: Missing token'});
    }
    let token = header.split(' ')[1];
    jwt.verify(token, JWT_SECRET, function(err, decoded){

      if(err){
        res.status(403).json({error:'Invalid token'});
        
      }else{
        // Check if the token has the required role
        if (decoded.category !== role1 && decoded.category!==role2) {
          res.status(403).json({error: 'Forbidden: Insufficient permissions'})
        }
        // Log decoded information for troubleshooting
        console.log('User Info:', decoded);
        req.userInfo = decoded;
        next();
      }
    });
    
  } catch (error) {
    console.error('Error extracting user information:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

async function deleteHost(client, id){
  try{
    const objectId = new ObjectId(id);
    const result = await client.db(dbName).collection(collection1).deleteOne({ _id: objectId });
  
    if (result.deletedCount === 1) {
      return { status: 200, data: 'Host deleted successfully' };
    } else {
      return { status: 404, data: { error: 'Host not found' } };
    }
  }catch(error){
    console.error('Error deleting host account: ', error);
    return {status: 500, data:{error: 'Internal Server Error'}};
  }
}

async function deleteVisitor(client, data, userInfo){
  let result3 = null; // Initialize result3 outside the block
  let result4 = null;
  try{
    const result = await client.db(dbName).collection(collection2).findOne({name: data.name});
    if(!result){
      return {status: 404, data:{error : 'Visitors not found'}};
    }
    // console.log("userInfo", userInfo);
    //console.log("Result: ", result);
    //console.log("User info in the function deleteVisitor", userInfo.category);
    const isVisitorRegisteredByHost = await checkIfVisitorRegisteredByHost(client, userInfo.username, result.visitor_id);
    if(userInfo.category == 'admin' || isVisitorRegisteredByHost){
      const result2 = await client.db(dbName).collection(collection2).deleteOne({name: data.name});
      // Update the host data to remove the visitor
      if(isVisitorRegisteredByHost){
        result3 = await client.db(dbName).collection(collection1).updateOne(
          { _id: userInfo.userId },
          { $pull: { visitors: { _id: result._id } } }
        );
      }else{
        result4 = await client.db(dbName).collection(collection1).updateOne(
          { 'visitors.visitor_id': result.visitor_id},
          { $pull: { visitors: { _id: result._id } } }
        );
      }

      if (result2.deletedCount === 1 && result4.modifiedCount === 1) {
        return { status: 200, data: 'Visitor deleted successfully and successfully update by admin' };
      } else if(result2.deletedCount === 1 && result3.modifiedCount === 1 ){
        return {status: 200, data: 'Visitor deleted successfully by host'}
      }else {
        return { status: 500, data: { error: 'Failed to update host data' } };
      }
    } else {
      return { status: 403, data: { error: 'Permission denied' } };
    }
  }catch(error){
    console.error('Error deleting visitor: ', error);
    return {status: 500, data: {error: 'Internal Server Error'}};
  }
}

async function checkIfVisitorRegisteredByHost(client, name, visitorId) {
  try {
    console.log("name: ", name);
    console.log("visitorId", visitorId);
    
        // Use $elemMatch to find the specific visitor in the visitors array
        const host = await client.db(dbName).collection(collection1).findOne({
          username: name,
          visitors: {
            $elemMatch: { visitor_id: visitorId }
          }
        });
    

    if (host) {
      console.log("Visitor registered under the same host");
      return true;
    } else {
      console.log("Visitor not registered under the host");
      return false;
    }
  } catch (error) {
    console.error('Error checking if visitor is registered by host: ', error);
    return false; // Handle the error as needed
  }
}

// Rate limiting configuration
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});