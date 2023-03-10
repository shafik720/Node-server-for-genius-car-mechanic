
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
var jwt = require('jsonwebtoken');

const app = express();

require('dotenv').config();

app.use(cors());  

app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASSWORD}@cluster0.0ihcm8w.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const userCollection = client.db('Car_Mechanic').collection('Services');
        const orderCollection = client.db('Car_Mechanic').collection('Orders');

        //---------------jwt token
        function jwtVerify(req, res, next){
            const authData = req.headers.authorization;
            if(!authData){
               return res.status(401).send({message : "Unauthorized Access !"})
            }
            const token = authData.split(' ')[1];
            jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded)=>{
                if(err){
                    return res.status(403).send({message: 'Forbidden Access'});
                }
                req.decoded = decoded;
            })
            next();
        }
        app.get('/orderData', jwtVerify,  async(req,res)=>{
            // const authData = req.headers.authorization;
            // console.log(req.headers.authorization);
            const decodedEmail = req.decoded.email;
            const email = req.query.email;

            if(email == decodedEmail){
                const query = {email : email};
                const cursor = orderCollection.find(query);
                const result = await cursor.toArray();
                
                res.send(result);
            }else{
                res.status(403).send({message : 'Forbidden Access'});
            }
        })
        app.post('/login', async(req, res)=>{
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn : '1d'
            })
            res.send({accessToken});
        })

        // get all service data
        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = userCollection.find(query);
            const services = await cursor.toArray();

            res.send(services);
        })

        // get single service data
        app.get('/service/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id : ObjectId(id)};

            const result = await userCollection.findOne(query);

            res.send(result);
        })

        // add a service in database
        app.post('/addservice', async(req,res)=>{
            const doc = req.body;
            const result = await userCollection.insertOne(doc);
            res.send(result);
        })

        // delete a service from database
        app.delete('/manage/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id : ObjectId(id)};

            const result = await userCollection.deleteOne(query);
            res.send(result);
        })

        //  all order api here -------------------------------------
        
        // create a new order in a new database collection
        app.post('/addOrder', async(req, res)=>{
            const doc = req.body;
            const result = await orderCollection.insertOne(doc);
            res.send(result);
        })

        // get orders data
        app.get('/order/:user',async(req,res)=>{
            const user = req.params.user;

            const query = { name : user};
            const cursor = orderCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

       

    }
    finally { 

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('hellow world');
})


app.listen(port, () => {
    console.log('connecting to port 5000');
})