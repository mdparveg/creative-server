const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()


const uri = "mongodb+srv://creativeUser:creative@cluster0.lhe87.mongodb.net/creativedb?retryWrites=true&w=majority";
// console.log(process.env.DB_PASS, process.env.DB_USER, process.env.DB_NAME);

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());
app.use(express.static('services'));

const port = 5000;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const servicesCollection = client.db("creativedb").collection("services");
  const orderCollection = client.db("creativedb").collection("order");
  const reviewCollection = client.db("creativedb").collection("review");
  const adminCollection = client.db("creativedb").collection("admin");


  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const des = req.body.des;
    const newImg = file.data;
    const encImg = newImg.toString('base64')

    const image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    }
    servicesCollection.insertOne({ name, des, image })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.get('/showServices', (req, res) => {
    servicesCollection.find({})
      .toArray((err, serviceDocument) => {
        res.send(serviceDocument);
      })
  });

  app.post('/orderService', (req, res) => {
    const order = req.body;
    orderCollection.insertOne(order)
      .then(result => {
        res.send(result)
      })
  })

  app.get('/showOrderService', (req, res) => {
    orderCollection.find({ email: req.query.email })
      .toArray((err, orderDocument) => {
        res.send(orderDocument)
      })
  })

  app.post('/placeReview', (req, res) => {
    const review = req.body;
    reviewCollection.insertOne(review)
      .then(result => {
        res.send(result)
      })
  })

  app.get('/getReview', (req, res) => {
    reviewCollection.find({})
      .toArray((err, reviewDocument) => {
        res.send(reviewDocument)
      })
  })

  app.get('/allOrderdService', (req, res) => {
    orderCollection.find({})
      .toArray((err, allOrderDocument) => {
        res.send(allOrderDocument)
      })
  })

  app.get('/isAdmin', (req, res) => {
    const email = req.query.email;
    console.log(email);
    adminCollection.find({ email })
      .toArray((err, collection) => {
        res.send(collection.length > 0)
      })

  })

  app.post('/makeAdmin', (req, res) => {
    const email = req.body.email;
    const pass = req.body.password;
    console.log(email);
    adminCollection.insertOne({ email, pass })
      .then(result => {
        console.log(result);
        res.send(result)
      })
  })

});




app.get('/', (req, res) => {
  res.send('It is working')
})


app.listen(process.env.PORT || port, console.log('port listing'))