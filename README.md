
# Todo App Server

A REST API server for managing notes with search, filtering, and statistics functionality.

## Routes

### Create & Retrieve
- `POST /create-note` - Create a new note
- `GET /` - Get all notes
- `GET /:id` - Get a note by ID

### Search & Filter
- `POST /search` - Search notes
- `POST /priority` - Get notes by priority filter
- `POST /statistic` - Get note statistics

### Update & Delete
- `PATCH /update-note/:id` - Update a note
- `DELETE /:id` - Delete a note

## Installation

```bash
npm install
```

## Running the Server

```bash
npm run dev
```

## Environment Setup

Configure your environment variables in `.env` file as needed.
