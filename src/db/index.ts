


import 'dotenv/config'; // This loads and configures in one step
import mongoose from 'mongoose';

const uri = process.env.HOST_URI;

if (!uri) {
  console.error("❌ HOST_URI is not defined in your .env file!");
  process.exit(1);
}

console.log("Attempting to connect to MongoDB...");



if (!uri) {
  console.error("❌ Error: HOST_URI is not defined in .env file");
  process.exit(1);
}

mongoose.connect(process.env.HOST_URI || "").then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("Error connecting to MongoDB", err);
});