import express from "express";
import "./db";

import noteRouter from "./routers/note";
//create server
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/note", noteRouter);

//start server



const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
