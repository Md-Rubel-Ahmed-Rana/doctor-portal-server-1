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

const server = async() => {
    try {
        const appointmentOptionsCollection = client.db("doctors-portal").collection("appointmentOptions")
        const bookingsCollection = client.db("doctors-portal").collection("bookings")
        
        app.get("/appointmentOptions", async(req, res) => {
            const date = req.query.date;
            const query = {}
            const cursor = appointmentOptionsCollection.find(query);
            const options = await cursor.toArray()
            const bookinQuery = { appointmentDate : date};
            const alreadyBooked = await bookingsCollection.find(bookinQuery).toArray();

            options.forEach((option) => {
                const optionBooked = alreadyBooked.filter((book) => book.treatment === option.name);
                const bookedSlots = optionBooked.map((book) => book.slot);
                const remainingSlots = option.slots.filter((slot) => !bookedSlots.includes(slot))
                option.slots = remainingSlots
            })

            res.send(options)
        })


        app.post("/bookings", async(req, res) => {
            const booking = req.body;
            const query = {
                appointmentDate: booking.appointmentDate,
                email: booking.email,
                treatment: booking.treatment
            }

            const alreadyBooked = await bookingsCollection.find(query).toArray();
            if(alreadyBooked.length){
                const message = `You already have a booking on ${booking.appointmentDate}`;
                return res.send({acknowledged: false, message})
            }


            const result = await bookingsCollection.insertOne(booking);
            res.send(result)
        })

    } catch (error) {
        console.log(error);
    }
}

server()


app.listen(port, () => console.log(`Doctor Portal Server is running on port ${port}`))