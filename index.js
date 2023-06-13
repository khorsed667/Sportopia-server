const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;


//middlewears
app.use(cors());
app.use(express.json());


app.get('/', (req, res)=>{
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
    await client.connect();

    // all collections
    const classCollections = client.db("Sportofia").collection("classes");
    const cartCollections = client.db("Sportofia").collection("carts");


    app.get('/class', async(req, res) =>{
        const result = await classCollections.find().toArray();
        res.send(result);
    })

    app.get('/cart', async(req, res) =>{
        const email = req.query.email;
        if(!email){
            res.send([]);
        }
        const query = {usermail : email}
        const result = await cartCollections.find(query).toArray();
        res.send(result);
    })

    app.post('/cart', async(req, res) =>{
        const cart = req.body;
        const result = await cartCollections.insertOne(cart);
        res.send(result);
    })


    app.delete('/cart/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
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


app.listen(port, ()=>{
    console.log(`The port is running on ${port}`);
})