 
 const express = require('express');
 const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
 const cors = require('cors');
 require('dotenv').config();
 const app = express();
 const port = process.env.PORT || 5000;

//  middleware 
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://exertio-jobsmarket.web.app",
    "https://exertio-jobsmarket.firebaseapp.com"
  ],
  credentials: true,
}));
app.use(express.json());

// mongodb url 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tyaaup2.mongodb.net/?retryWrites=true&w=majority`;

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

     const jobCollection = client.db('jobsDB').collection('postJobs');

    //  jobs post in database
    app.post('/postJobs',async(req,res)=>{
       const postJobsData = req.body;
       console.log(postJobsData);
       const result = await jobCollection.insertOne(postJobsData);
       res.send(result);
    })
    // get post data from database
    app.get('/postJobs', async(req,res)=>{
      const result = await jobCollection.find().toArray();
      res.send(result);
    })

    // post data delete start 
    app.delete('/postJobs/:id', async(req,res)=>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await jobCollection.deleteOne(query);
      res.send(result);
    })

    // update data 
    app.put('/postJobs/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = { _id: new ObjectId(id)};
      const options = { upsert: true }
      const job = req.body;
      const updatedJob = {
        $set: {
          job_title: job.job_title,
          category: job.category,
          Maximum_Price: job.Maximum_Price,
          Minimum_Price: job.Minimum_Price,
          deadline: job.deadline,
          Description: job.Description
        }
     };
     const result = await jobCollection.updateOne(filter,updatedJob,options);
     res.send(result);
  })

    app.get('/postJobs/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id)
      };
      const data = await jobCollection.findOne(query);
      res.send(data);
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


app.get('/',async(req,res)=>{
    res.send({message:'Welcome to server'});
})
app.listen(port, ()=>{
    console.log(`Exertio jobsmarket is running on port : ${port}`);
})