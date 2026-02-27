import { Router } from "express";
import {
  createNote,
  deleteNoteById,
  getAllNotes,
  getNoteById,
  searchNote,
 getNotesByFilter,
  updateNoteById,
  getNoteStatus

} from "../controllers/note";

const noteRouter = Router();

noteRouter.post("/create-note", createNote);

noteRouter.post("/search", searchNote);
noteRouter.get("/:id", getNoteById);
noteRouter.post("/priority", getNotesByFilter);
noteRouter.post("/statistic",getNoteStatus)

noteRouter.get("/", getAllNotes);


noteRouter.patch("/update-note/:id", updateNoteById);


noteRouter.delete("/:id", deleteNoteById);

export default noteRouter;
