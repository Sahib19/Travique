// Load environment variables
require("dotenv").config({ path: __dirname + "/../.env" });

const mongoose = require("mongoose");
const initData = require("./data2.js");
const Listing = require("../models/listing.js");

// connecting with mongo
const dbURL = process.env.ATLAS_MONGO_DB;
// connecting with mongo
async function main() {
    // below line will return a promise
    await mongoose.connect(dbURL);
}

main()
    .then(() => {
        console.log("Connection Built Sucessfully");
    })
    .catch(err => console.log(err));

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: new mongoose.Types.ObjectId("68b6d45f97903e68d6c5e51c"),
    }));
    await Listing.insertMany(initData.data);
    console.log("Database seeded successfully!");
    mongoose.connection.close(); // close connection after seeding
};

initDB();
