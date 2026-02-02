import mongoose from "mongoose";



// connect to mongodb

mongoose.connect("mongodb://localhost:27017/note-app").then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("Error connecting to MongoDB", err);
});