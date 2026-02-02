import { Schema,model } from "mongoose";
import { NoteProgress } from "../util/note";

// interface
export interface Note {
  title: string;
  description?: string;
  progress?: NoteProgress;
}


// created a schema for notes
const NoteSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: false, trim: true },
    progress: {
      type: String,
      enum: Object.values(NoteProgress),
      default: NoteProgress.NotStarted,
    },
  },
  { timestamps: true },
);

export const NoteModel = model<Note>("Note", NoteSchema);