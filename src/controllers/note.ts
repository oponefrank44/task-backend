import { RequestHandler } from "express";
import { NoteModel } from "../models/notes";
import { NotePriority, NoteProgress } from "../util/note";

interface requestBody {
  title: string;
  description?: string;
  progress?: NoteProgress;
  priority?: NotePriority;
  dueDate?: Date;
}

// Helper to extract visitorId safely
const getVisitorId = (req: any) => req.headers["visitor-id"] as string || req.query.visitorId as string;



// 1. Create Note (Already had visitorId, kept for consistency)
export const createNote: RequestHandler = async (req, res) => {
  try {
    const visitorId = req.headers["visitor-id"] || req.query.visitorId;


    console.log("Visitor ID:", visitorId);
    if (!visitorId) return res.status(400).json({ error: "No identification provided" });

    const { title, description, progress, priority, dueDate }: requestBody = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const newNote = new NoteModel({
      title,
      description,
      progress,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      visitorId
    });

    await newNote.save();
    res.status(201).json({ message: "Note created successfully", note: newNote });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

// 2. Search Note (Filtered by visitorId)
export const searchNote: RequestHandler = async (req, res) => {
  try {
       const visitorId = req.headers["visitor-id"] || req.query.visitorId;
    if (!visitorId) return res.status(400).json({ error: "No identification provided" });

    const { title, description } = req.body;
    const conditions: any[] = [];

    if (title) conditions.push({ title: { $regex: title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } });
    if (description) conditions.push({ description: { $regex: description.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } });

    if (conditions.length === 0) return res.status(400).json({ message: "Provide search criteria" });

    // IMPORTANT: Use $and to wrap the $or conditions with the visitorId check
    const notes = await NoteModel.find({
      visitorId,
      $or: conditions
    });

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 3. Get Note By ID (Scoped to visitorId)
export const getNoteById: RequestHandler = async (req, res) => {
  try {
        const visitorId = req.headers["visitor-id"] || req.query.visitorId;
    const { id } = req.params;

    // We use findOne instead of findById so we can include visitorId in the filter
    const note = await NoteModel.findOne({ _id: id, visitorId });

    if (!note) return res.status(404).json({ message: "Note not found" });
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// 4. Get Notes By Filter (Scoped to visitorId)
export const getNotesByFilter: RequestHandler = async (req, res) => {
  try {
      const visitorId = req.headers["visitor-id"] || req.query.visitorId;
    if (!visitorId) return res.status(400).json({ error: "No identification provided" });

    const { priority, progress } = req.query;
    const filterQuery: any = { visitorId }; // Always include visitorId

    if (priority) filterQuery.priority = { $regex: new RegExp(`^${priority}$`, "i") };
    if (progress) filterQuery.progress = { $regex: new RegExp(`^${progress}$`, "i") };

    const notes = await NoteModel.find(filterQuery);
    return res.status(200).json(notes);
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 5. Get All Notes & Stats (Scoped to visitorId)
export const getAllNotes: RequestHandler = async (req, res) => {
  try {
        const visitorId = req.headers["visitor-id"] || req.query.visitorId;
    if (!visitorId) return res.status(400).json({ error: "No identification provided" });

    const filter = { visitorId };

    const [notes, totalNotes, notStarted, inProgress, completed] = await Promise.all([
        NoteModel.find(filter),
        NoteModel.countDocuments(filter),
        NoteModel.countDocuments({ ...filter, progress: "not-started" }),
        NoteModel.countDocuments({ ...filter, progress: "in-progress" }),
        NoteModel.countDocuments({ ...filter, progress: "completed" })
    ]);

    res.status(200).json({ notes, totalNotes, notStarted, inProgress, completed });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// 6. Update Note By ID (Scoped to visitorId)
export const updateNoteById: RequestHandler = async (req, res) => {
  try {
       const visitorId = req.headers["visitor-id"] || req.query.visitorId;
    const { id } = req.params;

    // Use findOneAndUpdate to ensure the note belongs to the visitor
    const note = await NoteModel.findOneAndUpdate(
      { _id: id, visitorId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!note) return res.status(404).json({ message: "Note not found or unauthorized" });
    res.status(200).json({ message: "Updated successfully", note });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

// get Stats by visitorId
export const getNoteStatus: RequestHandler = async (req, res) => {
  try {
    // 1. Get visitorId from headers or query
        const visitorId = req.headers["visitor-id"] || req.query.visitorId;

    if (!visitorId) {
      return res.status(400).json({ error: "No identification provided" });
    }

    // 2. Define the filter to ensure we only look at THIS visitor's notes
    const filter = { visitorId };

    // 3. Run counts in parallel for better performance
    const [notStarted, inProgress, completed] = await Promise.all([
      NoteModel.countDocuments({ ...filter, progress: "not-started" }),
      NoteModel.countDocuments({ ...filter, progress: "in-progress" }),
      NoteModel.countDocuments({ ...filter, progress: "completed" }),
    ]);

    // 4. Return the stats
    res.status(200).json({
      notStarted,
      inProgress,
      completed,
      total: notStarted + inProgress + completed
    });

  } catch (error) {
    console.error("Get Status Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 7. Delete Note By ID (Scoped to visitorId)
export const deleteNoteById: RequestHandler = async (req, res) => {
  try {
        const visitorId = req.headers["visitor-id"] || req.query.visitorId;
    const { id } = req.params;

    const note = await NoteModel.findOneAndDelete({ _id: id, visitorId });

    if (!note) return res.status(404).json({ message: "Note not found or unauthorized" });
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};