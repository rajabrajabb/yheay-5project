const dotenv = require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/cars');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
}); 
const app = require('./app')

const port = 3000 || process.env.PORT
app.listen(port,()=>{
    console.log(`App Running On Port ${port}` )
})