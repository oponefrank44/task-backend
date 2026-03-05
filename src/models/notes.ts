import { Schema,model } from "mongoose";
import { NoteProgress,NotePriority } from "../util/note";

// interface
export interface Note {
  title: string;
  description?: string;
  progress?: NoteProgress;
  priority?: NotePriority;
  dueDate?: string;
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
    priority: {
      type: String,
      enum: Object.values(NotePriority),
      default: NotePriority.low,
    },
    dueDate: { type: Date, required: false },
    visitorId: { type: String, required: true, index: true },
  },
  { timestamps: true },
);

export const NoteModel = model<Note>("Note", NoteSchema);