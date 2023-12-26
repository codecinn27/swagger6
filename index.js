const { MongoClient, ServerApiVersion, MongoCursorInUseError } = require('mongodb');
const url = 'mongodb+srv://codecinnpro:7G5lg1qQNpzglv04@cluster0.u7w8rcg.mongodb.net/?retryWrites=true&w=majority';
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 3000
const bcrypt = require('bcrypt');
const saltRounds = 10;
const collection1 = 'users';
const collection2 = 'visitors';
const collection3 = 'visits';
const dbName = 'vms1';
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const JWT_SECRET = 'hahaha'

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

    app.get('/admin/visits', async (req, res) => {
        try {
          const allVisits = await readVisitsData(client);
          res.json(allVisits);
        } catch (error) {
          console.error('Error during /admin/visits:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.post('/admin/registerHost', async (req, res) => {
        try {
          const result = await registerHost(client, req.body);
          res.status(result.status).json({ message: result.message });
        } catch (error) {
          console.error('Error during /admin/registerHost:', error);
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
            const token = jwt.sign({ userId: user._id, category: user.category }, JWT_SECRET, {
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
  
            console.log("JWT:", token);
            return {
              status: 200,
              data: {
                token,
                category: user.category,
                redirectLink,
                Authorization: token,
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
    const visitsCollection = db.collection(collection1);
    
    try {
        const allVisits = await visitsCollection.find({}).toArray();
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


