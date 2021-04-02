const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const ObjectID = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const app = express()
const port = process.env.PORT || 4000;
app.use(bodyParser.json());
app.use(cors());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iokbq.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const productsCollection = client.db("bikeHat").collection("bikeCollection");
    const ordersCollection = client.db("bikeHat").collection("orders");

    app.get('/products', (req, res) => {
        productsCollection.find()
            .toArray((err, items) => {
                res.send(items)
            })
    })


    app.post('/addProduct', (req, res) => {
        const newProduct = req.body;
        console.log('adding new event: ', newProduct)
        productsCollection.insertOne(newProduct)
            .then(result => {
                console.log('inserted count', result.insertedCount);
                res.send(result.insertedCount > 0)
            })
    })
    app.delete('/delete/:id', (req, res) => {
        console.log(req.params.id)
        productsCollection.deleteOne({ _id: ObjectID(req.params.id) })
            .then(result => {
                res.send(result.deletedCount > 0);
            })
    })

    app.patch('/update/:id', (req, res) => {
        productsCollection.updateOne({ _id: ObjectID(req.params.id) },
            {
                $set: { name: req.body.name, price: req.body.price, quantity: req.body.quantity, imageURL: req.body.imageURL }
            })
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
    })
    app.get('/product/:id', (req, res) => {
        productsCollection.find({ _id: ObjectID(req.params.id) })
            .toArray((err, items) => {
                res.send(items)
            })
    })

    app.post('/addOrder', (req, res) => {
        const newOrder = req.body;
        console.log('adding new order: ', newOrder)
        ordersCollection.insertOne(newOrder)
            .then(result => {
                console.log('inserted count', result.insertedCount);
                res.send(result.insertedCount > 0)
            })
    })
    app.get('/bookings', (req, res) => {
        ordersCollection.find({ email: req.query.email })
            .toArray((err, items) => {
                res.send(items)
            })
    })
    app.get('/orders', (req, res) => {
        ordersCollection.find()
            .toArray((err, items) => {
                res.send(items)
            })
    })


    // perform actions on the collection object
    //   client.close();
});
