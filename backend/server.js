const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
// const summarizeNote = require("./ai");


const app = express(); //app created FIRST

// Middlewares
app.use(cors());
app.use(express.json());

//Serve frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

const NOTES_FILE = path.join(__dirname, "../data/notes.json");

/* Utility functions */
function readNotes() {
  return JSON.parse(fs.readFileSync(NOTES_FILE, "utf-8"));
}

function writeNotes(data) {
  fs.writeFileSync(NOTES_FILE, JSON.stringify(data, null, 2));
}

/* 1️⃣ Create Note */
app.post("/api/notes", (req, res) => {
  const { note } = req.body;

  if (!note || note.trim() === "") {
    return res.status(400).json({ error: "Note cannot be empty" });
  }

  if (note.length > 500) {
    return res.status(400).json({ error: "Note must be under 500 characters" });
  }

  const id = uuidv4();
  const password = Math.random().toString(36).slice(-8);

  const notes = readNotes();
  notes[id] = { note, password };
  writeNotes(notes);

  res.json({
    url: `http://localhost:3000/view.html?id=${id}`,
    password
  });
});

/* Verify Note */
app.post("/api/notes/:id/verify", (req, res) => {
  const { password } = req.body;
  const notes = readNotes();
  const note = notes[req.params.id];

  if (!note) return res.status(404).json({ error: "Note not found" });
  if (note.password !== password)
    return res.status(401).json({ error: "Invalid password" });

  res.json({ note: note.note });
});

/*Summarize Note (AI) */
app.post("/api/notes/:id/summarize", async (req, res) => {
  const { password } = req.body;
  const notes = readNotes();
  const note = notes[req.params.id];

  if (!note) return res.status(404).json({ error: "Note not found" });
  if (note.password !== password)
    return res.status(401).json({ error: "Invalid password" });

  try {
    const summary = await summarizeNote(note.note);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: "AI summarization failed" });
  }
});

app.listen(3000, () =>
  console.log("Server running at http://localhost:3000")
);
