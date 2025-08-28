//sending the sample data to the database

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");


// connecting with mongo
async function main() {
    // below line will return a promise
    await mongoose.connect('mongodb://127.0.0.1:27017/Wonderlust');
}

main()
    .then(() => {
        console.log("Connection Built Sucessfully");
    })
    .catch(err => console.log(err));

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data =  initData.data.map((obj) => ({...obj , owner : "68ae02c6222496d25e9df7d4"}))
    await Listing.insertMany(initData.data);

}

initDB();