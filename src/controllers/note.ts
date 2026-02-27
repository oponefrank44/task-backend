import { Request, RequestHandler, Response } from "express";
import { Note, NoteModel } from "../models/notes";
import { NotePriority, NoteProgress } from "../util/note";

interface requestBody {
  title: string;
  description?: string;
  progress?: NoteProgress;
  priority?: NotePriority;
  dueDate?: Date;
}
//create note controller
export const createNote: RequestHandler = async (req, res) => {
  try {
    const { title, description, progress, priority, dueDate }: requestBody =
      req.body;

    // 1. Basic Validation
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // 2. Create the instance
    const newNote = new NoteModel({
      title,
      description,
      progress,
      priority,
      // Mongoose handles ISO strings automatically, no need to manual convert
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    // 3. Save
    await newNote.save();

    res
      .status(201)
      .json({ message: "Note created successfully", note: newNote });
  } catch (error: any) {
    console.error("POST Error:", error); // This shows in your terminal
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

//search note controller
export const searchNote: RequestHandler = async (req, res) => {
  try {
    const { title, description } = req.body;

    // 1. Build an array of conditions for the $or operator
    const conditions = [];

    if (title && typeof title === "string") {
      // Escape special characters to prevent regex injection
      const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // Use regex to find if the title CONTAINS the string (case-insensitive)
      conditions.push({ title: { $regex: escapedTitle, $options: "i" } });
    }

    if (description && typeof description === "string") {
      const escapedDescription = description.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      conditions.push({ description: { $regex: escapedDescription, $options: "i" } });
    }

    // 2. If no search terms provided, you might want to return an error or all notes
    if (conditions.length === 0) {
      return res.status(400).json({ message: "Please provide a title or description to search" });
    }

    // 3. Use the $or operator so it matches EITHER title or description
    // Also use .find() instead of .findOne() to get all matching results
    const notes = await NoteModel.find({ $or: conditions });

    if (!notes || notes.length === 0) {
      return res.status(404).json({ message: "No notes found matching these criteria" });
    }

    res.status(200).json(notes);
  } catch (error) {
    console.error("Error finding note:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//find note by id controller
export const getNoteById: RequestHandler = async (req, res) => {
  try {
    //get id from params
    const { id } = req.params;
    //find note by id
    const note = await NoteModel.findById(id);
    //if note not found
    if (!note) return res.status(404).json({ message: "Note not found" });
    //return note
    res.status(200).json(note);
  } catch (error) {
    //handle error
    res.status(500).json({ message: "Internal server error" });
  }
};

//get note by priority controller
export const getNotesByFilter: RequestHandler = async (req, res) => {
  try {
    // 1. Get both from req.query
    const { priority, progress } = req.query;

    // This allows searching by priority, progress, or BOTH at once
    const filterQuery: any = {};

    if (priority) {
      filterQuery.priority = { $regex: new RegExp(`^${priority}$`, "i") };
    }

    if (progress) {
      filterQuery.progress = { $regex: new RegExp(`^${progress}$`, "i") };
    }
    if (filterQuery.length <= 0) {
      const notes = await NoteModel.find();
      return res.status(200).json(notes);
    }
    // 3. Find notes based on the dynamic object
    const notes = await NoteModel.find(filterQuery);

    // 4. Handle empty results
    if (!notes || notes.length === 0) {
      return res.status(404).json({
        message: "No notes found matching these criteria",
      });
    }

    return res.status(200).json(notes);
  } catch (error: any) {
    console.error("Filter Notes Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
//get Stats
export const getNoteStatus: RequestHandler = async (req, res) => {
  try {
    //find all notes

    const notStarted = await NoteModel.find({ progress: "not-started" });
    const inProgress = await NoteModel.find({ progress: "in-progress" });
    const completed = await NoteModel.find({ progress: "completed" });

    res.status(200).json({
      notStarted,
      inProgress,
      completed,
    });
  } catch (error) {
    //handle error
    res.status(500).json({ message: "Internal server error" });
  }
};
//get all notes controller
export const getAllNotes: RequestHandler = async (req, res) => {
  try {
    //find all notes
    const notes = await NoteModel.find();
    //get static

    const totalNotes = await NoteModel.countDocuments();
    const notStarted = await NoteModel.countDocuments({
      progress: "not-started",
    });
    const inProgress = await NoteModel.countDocuments({
      progress: "in-progress",
    });
    const completed = await NoteModel.countDocuments({ progress: "completed" });
    console.log(totalNotes);

    res.status(200).json({
      notes,
      totalNotes,
      notStarted,
      inProgress,
      completed,
    });

    //return notes
    res.status(200).json(notes);
  } catch (error) {
    //handle error
    res.status(500).json({ message: "Internal server error" });
  }
};

//update note by id controller
export const updateNoteById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and update - req.body is the object containing changes
    const note = await NoteModel.findByIdAndUpdate(id, req.body, {
      new: true, // Returns the updated document
      runValidators: true, // Ensures the update follows your Schema rules
    });

    if (!note) return res.status(404).json({ message: "Note not found" });

    res.status(200).json({ message: "Updated successfully", note });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

//delete note by id controller
export const deleteNoteById: RequestHandler = async (req, res) => {
  try {
    //get id from params
    const { id } = req.params;
    //find and delete note
    const note = await NoteModel.findByIdAndDelete(id);
    //if note not found
    if (!note) return res.status(404).json({ message: "Note not found" });
    //return success message
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    //handle error
    res.status(500).json({ message: "Internal server error" });
  }
};
