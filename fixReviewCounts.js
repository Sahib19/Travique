const mongoose = require("mongoose");
const User = require("./models/user");
const Review = require("./models/review");

// Connect to MongoDB (you may need to adjust the connection string)
mongoose.connect("mongodb://localhost:27017/travique", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function fixReviewCounts() {
    try {
        console.log("Starting to fix review counts...");

        // Get all users
        const users = await User.find({});
        console.log(`Found ${users.length} users`);

        // For each user, count their actual reviews and update the totalReviews field
        for (let user of users) {
            const reviewCount = await Review.countDocuments({ author: user._id });
            const currentCount = user.stats?.totalReviews || 0;

            if (reviewCount !== currentCount) {
                console.log(`Updating ${user.username}: ${currentCount} → ${reviewCount}`);
                await User.findByIdAndUpdate(user._id, {
                    'stats.totalReviews': reviewCount
                });
            }
        }

        console.log("✅ Review counts fixed successfully!");

    } catch (error) {
        console.error("❌ Error fixing review counts:", error);
    } finally {
        mongoose.connection.close();
    }
}

// Run the fix
fixReviewCounts();
