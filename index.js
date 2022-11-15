const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require("express")
const cors = require("cors");
require("dotenv").config()
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors())
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Doctor Portal Server is running!!!")
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.n72f5gi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

console.log(uri);

const server = async() => {
    try {
        const appointmentOptionsCollection = client.db("doctors-portal").collection("appointmentOptions")
        
        app.get("/appointmentOptions", async(req, res) => {
            const query = {}
            const cursor = appointmentOptionsCollection.find(query);
            const options = await cursor.toArray()
            res.send(options)
        })
    } catch (error) {
        console.log(error);
    }
}

server()


app.listen(port, () => console.log(`Doctor Portal Server is running on port ${port}`))