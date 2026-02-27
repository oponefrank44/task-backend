import { describe, expect, test, jest } from "@jest/globals";
import { NoteModel } from "src/models/notes";
import { createNote } from "src/controllers/note";
import { NoteProgress, NotePriority } from "src/util/note";

jest.mock("src/models/notes", () => ({
  NoteModel: jest.fn(),
}));

const mockNote = {
  _id: "1234567890",
  title: "Test Note",
  description: "Test Description",
  priority: NotePriority.high,
  progress: NoteProgress.NotStarted,
  dueDate: new Date(),
};

test("create a note", async () => {
  const mockSave = jest
    .fn<() => Promise<typeof mockNote>>()
    .mockResolvedValue(mockNote);

  (NoteModel as jest.MockedClass<typeof NoteModel>).mockImplementation(() => ({
    save: mockSave,
  }) as any);

  const mockReq = {
    body: {
      title: "Test Note",
      description: "Test Description",
      priority: NotePriority.high,
      progress: NoteProgress.NotStarted,
      dueDate: new Date(),
    },
  } as any;

  const mockRes = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  } as any;

  await createNote(mockReq, mockRes, jest.fn());

  expect(NoteModel).toHaveBeenCalledTimes(1);
  expect(mockSave).toHaveBeenCalledTimes(1);
  
});
