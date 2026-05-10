import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "../src/models/admin/adminLoginModel.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const exists = await Admin.findOne({ email: "mymusicadmin45@gmail.com" });

    if (exists) {
      console.log("Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("112233", 10);

    await Admin.create({
      userName: "SuperAdmin",
      email: "mymusicadmin45@gmail.com",
      password: hashedPassword,
    });

    console.log("Admin created successfully");
    process.exit();
  } catch (err) {
    console.log("Error:", err.message);
    process.exit(1);
  }
};

createAdmin();