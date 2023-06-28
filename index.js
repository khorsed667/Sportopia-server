const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;


//middlewears
app.use(cors());
app.use(express.json());

const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: true, message: 'unauthorized access' });

    }
    const token = authorization.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded)=>{
        if(err){
            return res.status(402).send({error: true, message: 'unauthorized access'})
        }
        req.decoded = decoded;
        next();
    })
}


app.get('/', (req, res) => {
    res.send('Sport in playing on....');
})


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hlokssy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        // all collections
        const userCollections = client.db("Sportofia").collection("users");
        const classCollections = client.db("Sportofia").collection("classes");
        const cartCollections = client.db("Sportofia").collection("carts");

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
            res.send({ token });
        })

        app.post('/user', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const savedUser = await userCollections.findOne(query);
            console.log(savedUser);
            if (savedUser) {
                return res.send({ message: 'user already exist' })
            }
            const result = await userCollections.insertOne(user);
            res.send(result);
        })

        app.get('/user/admin/:email', verifyJWT, async(req, res)=>{
            const email = req.params.email;
            if(req.decoded.email !== email){
                res.send({admin:false})
            }
            const query = {email : email}
            const user = await userCollections.findOne(query);
            const result = {admin: user?.role === 'admin'}
            res.send(result);
        })

        
        app.get('/user/instractor/:email', verifyJWT, async(req, res)=>{
            const email = req.params.email;
            if(req.decoded.email !== email){
                res.send({instractor:false})
            }
            const query = {email : email}
            const user = await userCollections.findOne(query);
            const result = {instractor: user?.role === 'instractor'}
            res.send(result);
        })

        app.get('/user', async (req, res) => {
            const result = await userCollections.find().toArray();
            res.send(result);
        })

        app.patch('/user/admin/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const updetRole = {
                $set: {
                    role: 'admin'
                },
            };
            const result = await userCollections.updateOne(query, updetRole);
            res.send(result);
        })


        app.patch('/user/instractor/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const updetRole = {
                $set: {
                    role: 'instractor'
                },
            };
            const result = await userCollections.updateOne(query, updetRole);
            res.send(result);
        })

        app.get('/class', async (req, res) => {
            const result = await classCollections.find().toArray();
            res.send(result);
        })

        app.post('/class', async(req, res)=>{
        const newItem = req.body;
        const result = await classCollections.insertOne(newItem);
        res.send(result);
        })

        app.get('/cart', verifyJWT, async (req, res) => {
            const email = req.query.email;
            if (!email) {
                res.send([]);
            }

            const decodedEmail = req.decoded.email;
            if(email !== decodedEmail){
                return res.status(403).send({error : true, message: 'forbidded access'})
            }

            const query = { usermail: email }
            const result = await cartCollections.find(query).toArray();
            res.send(result);
        })

        app.post('/cart', async (req, res) => {
            const cart = req.body;
            const result = await cartCollections.insertOne(cart);
            res.send(result);
        })


        app.delete('/cart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await cartCollections.deleteOne(query);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`The port is running on ${port}`);
})