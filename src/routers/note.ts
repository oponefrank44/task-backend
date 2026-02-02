import { Router } from "express";
import {
  createNote,
  deleteNoteById,
  getAllNotes,
  getNoteById,
  searchNote,
  updateNoteById,
} from "../controllers/note";

const noteRouter = Router();

noteRouter.post("/create-note", createNote);

noteRouter.post("/search", searchNote);
noteRouter.get("/:id", getNoteById);
noteRouter.get("/", getAllNotes);


noteRouter.patch("/update-note/:id", updateNoteById);


noteRouter.delete("/delete/:id", deleteNoteById);

export default noteRouter;
