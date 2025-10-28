// One-time script to fix existing users who have passwords but passwordSet is false
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user");

async function fixExistingUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find all users who have a password but passwordSet is false or undefined
    const usersToUpdate = await User.find({
      password: { $exists: true, $ne: null },
      $or: [
        { passwordSet: false },
        { passwordSet: { $exists: false } }
      ]
    });

    console.log(`Found ${usersToUpdate.length} users to update`);

    if (usersToUpdate.length === 0) {
      console.log("No users need updating");
      process.exit(0);
    }

    // Update each user
    let updated = 0;
    for (const user of usersToUpdate) {
      user.passwordSet = true;
      await user.save();
      updated++;
      console.log(`✅ Updated user: ${user.email}`);
    }

    console.log(`\n✅ Successfully updated ${updated} users`);
    console.log("All existing users can now log in!");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

fixExistingUsers();
