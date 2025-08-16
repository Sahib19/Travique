const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

//ejs mate -> help to create templates like includes and partials
const ejsMate = require("ejs-mate");


const Listing = require("./models/listing.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.urlencoded({extended : true}));
app.engine("ejs",ejsMate);

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



app.get("/home", (req, res) => {
    res.send("Hi i am Root");
})


app.get("/listing", async(req,res)=>{
    const allListing = await Listing.find({});
    res.render("listings/index.ejs" , {allListing});
})

app.get("/listing/new",(req,res)=>{
    res.render("listings/form.ejs");
})

app.get("/listing/:id",async (req,res)=>{
    let {id} =  req.params;
    const listing = await Listing.findById(id)
    res.render("listings/show.ejs",{listing});
})

app.post("/listing",async (req,res)=>{
    console.log(req.body);
    let newlisting = Listing(req.body); // ek newlisting document bann geya listing model ke hisab se
    await newlisting.save();
    res.redirect("/listing");
})

app.get("/listing/edit/:id",async (req,res)=>{
    let {id} = req.params;
     let listing = await Listing.findById(id);
    res.render("listings/editForm.ejs",{listing});
})

//changing the update in the database
app.put("/listing/update/:id",async (req,res)=>{
    let {id} = req.params
    await Listing.findByIdAndUpdate(id,req.body,{runValidators:true , new:true});
    res.redirect("/listing");

})

//delete roooute
app.delete("/listing/:id",async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
     res.redirect("/listing");

})

app.listen(8080, () => {
    console.log("Server is listening at port 8080");
})