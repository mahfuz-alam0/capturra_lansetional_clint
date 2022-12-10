const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//capturra_lansational
//J6bUBYwYjmtgAsH2


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3njemyu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const varifyToken = (req, res, next) => {
    const auth_header = req.headers.authorization;
    if (!auth_header) {
        return res.status(401).send('Access Denied');
    }
    const token = auth_header.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOCKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send('Invalid Token');
        }
        req.decoded = decoded;
        next();
    });
};

const run = async () => {
    try {
        const Examples_Collection = client.db('Capturra_lansational').collection('examplse');
        const Services_Collection = client.db('Capturra_lansational').collection('services');
        const Reviews_Collection = client.db('Capturra_lansational').collection('reviews');

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOCKEN_SECRET, { expiresIn: '1d' });
            res.send({ token });
        });

        app.post('/add_service', async (req, res) => {
            const service = req.body;
            const result = await Services_Collection.insertOne(service);
            res.json(result);
        });

        app.get('/examplse', async (req, res) => {
            const cursor = Examples_Collection.find({});
            const examplse = await cursor.toArray();
            res.send(examplse);
        });

        app.get('/service/:id', async (req, res) => {
            const query = { _id: ObjectId(req.params.id) };
            const service = await Services_Collection.findOne(query);
            res.send(service);
        });

        app.get('/all_services', async (req, res) => {
            const cursor = Services_Collection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/services', async (req, res) => {
            const cursor = Services_Collection.find({});
            const services = await cursor.limit(3).toArray();
            res.send(services);
        });

        app.get('/reviews', varifyToken, async (req, res) => {
            const cursor = Reviews_Collection.find({ category: req.query.category });
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.get('/my_reviews', varifyToken, async (req, res) => {
            const cursor = Reviews_Collection.find({ email: req.query.email });
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.get('/my_reviews/:id', async (req, res) => {
            const query = { _id: ObjectId(req.params.id) };
            const service = await Reviews_Collection.findOne(query);
            res.send(service);
        });

        app.post('/add_review', varifyToken, async (req, res) => {
            const review = req.body;
            const result = await Reviews_Collection.insertOne(review);
            res.json(result);
        });

        app.patch('/my_reviews/:id', varifyToken, async (req, res) => {
            const query = { _id: ObjectId(req.params.id) };
            console.log(req.body);
            const updateDoc = { $set: req.body };
            const result = await Reviews_Collection.updateOne(query, updateDoc);
            res.send(result);
        });

        app.delete('/my_reviews/:id', varifyToken, async (req, res) => {
            const query = { _id: ObjectId(req.params.id) };
            const result = await Reviews_Collection.deleteOne(query);
            res.send(result);
        });

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
});


app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});