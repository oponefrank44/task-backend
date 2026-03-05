import express from "express";
import "./db";
import helmet from "helmet";
import cors from "cors";
import noteRouter from "./routers/note";
import 'dotenv/config';
const PORT = process.env.PORT || 8000;
const app = express();

app.use(helmet());
app.use(cors());
//create server

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/note", noteRouter);


//start server




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
