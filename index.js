const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require("dotenv").config();

//set up express
const app = express();
app.use(express.json());
app.use(cors());

/* SETTING UP SERVER */

//Only use port 5000 for localhost development 
const PORT = process.env.PORT || 5000;


//use nodemon to listen to server
app.listen(PORT, () => console.log(`The server has started on port:  ${PORT}`));


/* SETTING MONGOOSE */

mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true,
}, (err) => {
    if(err) throw err;
    console.log("MongoDB connection established")
});


/* SETTING UP ROUTE */

app.use("/users", require("./routes/userRouter"))