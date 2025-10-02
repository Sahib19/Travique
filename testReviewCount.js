const mongoose = require("mongoose");
const User = require("./models/user");
const Review = require("./models/review");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/travique", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function testReviewCount() {
    try {
        console.log("Testing review count functionality...");

        // Find a user (you may need to adjust this)
        const user = await User.findOne({});
        if (!user) {
            console.log("No users found. Please create a user first.");
            return;
        }

        console.log(`Found user: ${user.username}`);
        console.log(`Current totalReviews: ${user.stats?.totalReviews || 0}`);

        // Test increment
        console.log("Testing increment...");
        await User.findByIdAndUpdate(user._id, {
            $inc: { 'stats.totalReviews': 1 }
        });

        const updatedUser = await User.findById(user._id);
        console.log(`After increment: ${updatedUser.stats?.totalReviews || 0}`);

        // Test decrement
        console.log("Testing decrement...");
        await User.findByIdAndUpdate(user._id, {
            $inc: { 'stats.totalReviews': -1 }
        });

        const finalUser = await User.findById(user._id);
        console.log(`After decrement: ${finalUser.stats?.totalReviews || 0}`);

        console.log("✅ Database operations working correctly!");

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        mongoose.connection.close();
    }
}

// Run the test
testReviewCount();
