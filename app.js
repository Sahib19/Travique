if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
const path = require("path");
// const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js")
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

//allowing  hoppscotch
const cors = require("cors");
app.use(cors());

// joi walla validation
// const { listingSchema , reviewSchema} = require("./schema.js");

//ejs mate -> help to create templates like includes and partials
const ejsMate = require("ejs-mate");

// Socket.IO for real-time messaging
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

//Requiring the Router Object
const listing = require("./routes/listing.js");
const review = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js");

//Requiring things related to authentication and authorization
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Add JSON body parser for AJAX requests
app.engine("ejs", ejsMate);

//--------------------------------------------------------------------------------------------------------------

const dbURL = process.env.ATLAS_MONGO_DB ;
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
//============================================================================================================

const Message = require("./models/message");

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user to their personal room for targeted messaging
    socket.on('join-user', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined their personal room`);
    });

    // Handle new message sending
    socket.on('send-message', async (data) => {
        try {
            const { bookingId, content, senderId, receiverId } = data;

            // Create message in database
            const message = new Message({
                sender: senderId,
                receiver: receiverId,
                booking: bookingId,
                content: content,
                conversationId: Message.generateConversationId(senderId, receiverId, bookingId)
            });

            await message.save();
            await message.populate('sender', 'username profile.firstName profile.lastName');

            // Emit message to both sender and receiver
            io.to(`user_${senderId}`).emit('new-message', {
                message: message,
                bookingId: bookingId
            });

            io.to(`user_${receiverId}`).emit('new-message', {
                message: message,
                bookingId: bookingId
            });

            // Send notification to receiver if they're not the sender
            if (senderId !== receiverId) {
                io.to(`user_${receiverId}`).emit('message-notification', {
                    message: message,
                    bookingId: bookingId
                });
            }

        } catch (error) {
            console.error('Error sending message via socket:', error);
            socket.emit('message-error', { message: 'Failed to send message' });
        }
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

//session related things
const store = MongoStore.create({
    mongoUrl: dbURL,
    crypto:{
        secret : "mysupersecretkey",
    },
    touchAfter : 24 * 3600,
}) 

const sessionOptions = {
    store,
    secret: "mysupersecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(async (req, res, next) => {
    try {
        res.locals.success = req.flash("success");
        res.locals.error = req.flash("error");
        
        if (req.user) {
            // Populate user with wishlist for navbar display
            const populatedUser = await User.findById(req.user._id).populate('wishlist');
            res.locals.currentUser = populatedUser;
        } else {
            res.locals.currentUser = null;
        }
        
        next();
    } catch (error) {
        console.error('Error in middleware:', error);
        res.locals.currentUser = null;
        next();
    }
})

app.get("/", (req, res) => {
  res.redirect("/listing");  // or render your home.ejs
});

// listing routers
app.use("/listing", listing);
// review routers;
app.use("/listing/:id/review", review);

// User routers
app.use("/user", userRouter);

// Booking routers
app.use("/booking", bookingRouter);

// Message routers
const messageRouter = require("./routes/message.js");
app.use("/message", messageRouter);

app.all("/", (req, res, next) => {
    next(new ExpressError(404, "Page not Found"));
});

//middleware to handle the error ocured in the backend
app.use((err, req, res, next) => {
    let { status = 505, message = "Some Error Ocurred" } = err;
    res.status(status).render("error.ejs", { message });
})

httpServer.listen(8080, () => {
    console.log("Server with Socket.IO is listening at port 8080");
})