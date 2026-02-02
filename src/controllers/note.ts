import { RequestHandler } from "express";
import mongoose from "mongoose";
import { Note, NoteModel } from "../models/notes";

interface requestBody {
  title: string;
  description?: string;
}
//create note controller
export const createNote: RequestHandler = async (req, res) => {
  try {
    const newNote = new NoteModel<Note>({
      title: (req.body as requestBody).title,
      description: (req.body as requestBody).description,
    });
    await newNote.save();
    res
      .status(201)
      .json({ message: "Note created successfully", note: newNote });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//search note controller
export const searchNote: RequestHandler = async (req, res) => {
  try {
    // Get title and description from request body
    const { title, description } = req.body;
    // If neither title nor description is provided, return all notes
    if (!title && !description) {
      const notes = await NoteModel.find();
      res.status(200).json(notes);
    }
    // Build query object

    const query: any = {};

    // Safely create regex patterns
    if (title && typeof title === "string") {
      const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      query.title = new RegExp(escapedTitle, "i");
    }
    // Safely create regex patterns

    if (description && typeof description === "string") {
      const escapedDescription = description.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );
      query.description = new RegExp(escapedDescription, "i");
    }
    // Execute query
    const note = await NoteModel.findOne(query);
    // Handle case where no note is found
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    // Return found note
    res.status(200).json(note);
  } catch (error) {
    console.error("Error finding note:", error);
    // Handle errors
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

//get all notes controller
export const getAllNotes: RequestHandler = async (req, res) => {
  try {
    //find all notes
    const notes = await NoteModel.find();
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
    //get id from params
    const { id } = req.params;
    //find and update note
    const note = await NoteModel.findByIdAndUpdate(id, req.body.trim(), {
      new: true,
    });
    //if note not found
    if (!note) return res.status(404).json({ message: "Note not found" });
    //return updated note
    res.status(200).json({ message: "Note updated successfully", note });
  } catch (error) {
    //handle error
    res.status(500).json({ message: "Internal server error" });
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
