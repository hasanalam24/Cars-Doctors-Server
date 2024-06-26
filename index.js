const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;

//middleware

app.use(cors())
app.use(express.json())


console.log(process.env.DB_PASS, process.env.DB_USER)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qvnsypp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

        const servicesCollection = client.db('CarsDoctors').collection('Services')
        const bookingCollection = client.db('CarsDoctors').collection('booking')

        //auth related /jwt api
        app.post('/jwt', async (req, res) => {
            const user = req.body
            console.log('user for token', user)
            //terminal theke token generate
            const token = jwt.sign(user, process.env.ACCES_TOKEN_SECRET, { expiresIn: '1h' })

            res.send({ token })
        })


        //service related api
        app.get('/service', async (req, res) => {
            const cursor = servicesCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/service/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const options = {
                projection: {
                    title: 1, price: 1, service_id: 1, img: 1
                }
            }
            const result = await servicesCollection.findOne(query, options)
            res.send(result)
        })

        //booking service
        //onno vabe email diye data get
        app.get('/bookings', async (req, res) => {
            console.log(req.query.email)

            let query = {}
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await bookingCollection.find(query).toArray()
            res.send(result)
        })

        app.post('/bookings', async (req, res) => {
            const bookingCard = req.body
            console.log(bookingCard)
            const result = await bookingCollection.insertOne(bookingCard)
            res.send(result)
        })

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await bookingCollection.deleteOne(query)
            res.send(result)
        })

        app.patch('/bookings/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updatedBook = req.body;
            console.log(updatedBook)
            const updateDoc = {
                $set: {
                    status: updatedBook.status
                }
            };
            const result = await bookingCollection.updateOne(filter, updateDoc)
            res.send(result)
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



app.get('/', (req, res) => {
    res.send('doctor is running')
})
app.listen(port, () => {
    console.log(`car server is running ${port}`)
})