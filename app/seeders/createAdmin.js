import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../model/User.js";
import bcrypt from "bcrypt";

dotenv.config();

/**
 * Seeder:Create first admin here
 */

const createAdmin = async () => {
  try {
    //connect db
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDb connected");
    //Cheack Admin already exsist or not
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      console.log("Admin already exists. Seeder aborted.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    //create Admin
    const admin = await User.create({
      name: "Super Admin",
      email: "admin@news.com",
      password: hashedPassword, // will be hashed by model logic
      role: "admin",
    });

    console.log("Admin created successfully:");
    console.log({
      email: admin.email,
      role: admin.role,
    });

    process.exit(0);
  } catch (err) {
    console.error("Seeder failed:", err.message);
    process.exit(1);
  }
};

createAdmin();
