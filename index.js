const express = require('express');
require("dotenv").config();
// const jwt = require("jsonwebtoken")
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const stripe = require("stripe")(process.env.payment_secret_key)
const port = process.env.PORT || 5000

// middleware 

app.use(cors())
app.use(express.json())



// function verifyToken(req, res, next) {
//   const authorization = req.headers.authorization
//   if(!authorization){
//     return res.status(401).send({error:true, message:"unathorization access"})
//   }
//   const token = authorization.split(' ')[1]
//   jwt.verify(token,process.env.JWT_ACCESS_TOKEN,(error,decoded)=>{
//     if(error){
//       return res.status(401).send({error:true, message:"unathorization access"})
//     }
// req.decoded = decoded
// next()
//   })
// }

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uerrvig.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    
     client.connect();

    const userCollection = client.db('userData').collection('userCollection')
    const courseCollection = client.db("courseDb").collection('courseCollection')
    const paymentCollection = client.db("paymentDb").collection('paymentCollection')

// jwt

// app.post("/jwt", (req,res)=>{
//   const user = req.body
//   const token = jwt.sign(user,process.env.JWT_ACCESS_TOKEN,{expiresIn:'5d'})
  
//   res.send({token})
// })


    // userCollection

    app.put('/user/:email', async(req,res)=>{
        
        const users = req.body;
    const email = req.params.email
   
    const query = {email:email}
    const options = { upsert: true }
    const updateDoc={
        $set:users
    }
        const result = await userCollection.updateOne(query,updateDoc,options) 
        res.send(result)
    })

    app.post("/user",  async(req,res)=>{
      const user = req.body;
     
      const result = await userCollection.insertOne(user)
      res.send(result)
    })

    app.get('/user', async(req,res)=>{
        const result = await userCollection.find().toArray()
        res.send(result)
    })


    app.get('/user/:id', async(req,res)=>{
        const id = req.params.id;
        const filterId = {_id : new ObjectId(id)}
        const result = await userCollection.findOne(filterId)
        res.send(result)
    })


    app.patch('/user/:id',async(req,res)=>{
        const id = req.params.id;
        
        const body = req.body
        const filterId = {_id : new ObjectId(id)}
const updateDoc ={
    $set: body
}

        const result = await userCollection.updateOne(filterId,updateDoc)
        res.send(result)
    })

    app.delete('/user/:id', async(req,res)=>{
      const id = req.params.id;
      const filteredId = {_id : new ObjectId(id)}
      const result = await userCollection.deleteOne(filteredId)
      res.send(result)
    })

    // Course route

    app.post('/course',async(req,res)=>{
      const product = req.body;
      const result = await courseCollection.insertOne(product)
      res.send(result)
    })

    app.get('/course', async(req,res)=>{

      const result = await courseCollection.find().toArray()
      res.send(result)

    })

    app.get('/course/:id', async(req,res)=>{
      const id = req.params.id;
      const filterId = {_id : new ObjectId(id)}
      const result = await courseCollection.findOne(filterId)
      res.send(result)
    })

    app.patch('/course/:id', async(req,res)=>{
      const course = req.body;
      const id = req.params.id;
      
      const filteredId = { _id : new ObjectId(id)}
      const updateDoc = {
        $set: course
      }

      const result = await courseCollection.updateOne(filteredId,updateDoc)
      res.send(result)
    })


    app.delete('/course/:id', async(req,res)=>{
      const id = req.params.id;
      const filteredId = {_id : new ObjectId(id)}
      const result = await courseCollection.deleteOne(filteredId)
      res.send(result)
    })

    app.post("/create-payment-intent",async(req,res)=>{
      const {price} = req.body
      
      const amount = price * 100
      console.log(price,amount)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
       payment_method_types :["card"],
       
      });
      res.send({
        clientSecret: paymentIntent.client_secret
      });

    })

    app.post('/payment',async(req,res)=>{
      const payment = req.body;
      const result = await paymentCollection.insertOne(payment)
      res.send(result)
    })
    
   
    console.log("mongodb database is connecting");
  } finally {
    
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/',(req,res)=>{
    res.send("data is running")
})


app.listen(port,()=>{
    console.log(`port is running on : ${port}`)
})

