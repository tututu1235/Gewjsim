const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, "database.json");
let db = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, "utf-8")) : {};

function saveDB() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// ✅ Reply API
app.post("/baby/reply", (req, res) => {
  const { text } = req.body;
  if (!text) return res.json({ reply: "😶 Type something..." });

  const key = text.toLowerCase();
  const responses = db[key];

  if (!responses || responses.length === 0) {
    return res.json({
      reply: `Sorry amake eta Teach kora hoy ni <😢\nPlz amake eta teach koro <🥺🙏\nExample: /Sakura teach ${text} - bot jeta reply dibe oita lekho.`
    });
  }

  const emojis = ["🥰", "😚", "😘", "😡", "😍", "😼", "🤭", "❤️", "🥺", "😻", "😏", "😅"];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  const message = responses[Math.floor(Math.random() * responses.length)];
  return res.json({ reply: `${message} ${emoji}` });
});

// ✅ Teach
app.post("/baby/teach", (req, res) => {
  const { text, reply } = req.body;
  if (!text || !reply) return res.json({ message: "❌ Missing text or reply." });

  const key = text.toLowerCase();
  const replyList = reply.split(",").map(r => r.trim());
  if (!db[key]) db[key] = [];
  db[key].push(...replyList);
  saveDB();

  res.json({ message: `✅ Learned "${key}"`, replies: db[key] });
});

// ✅ Remove whole key
app.post("/baby/remove", (req, res) => {
  const { text } = req.body;
  if (!text || !db[text]) return res.json({ message: "❌ Not found!" });

  delete db[text];
  saveDB();
  res.json({ message: `🗑️ Removed "${text}"` });
});

// ✅ Remove specific index
app.post("/baby/removeIndex", (req, res) => {
  const { text, index } = req.body;
  const key = text.toLowerCase();
  if (!db[key] || !db[key][index]) return res.json({ message: "❌ Invalid index!" });

  db[key].splice(index, 1);
  saveDB();
  res.json({ message: `🗑️ Removed index ${index} from "${key}"`, replies: db[key] });
});

// ✅ Edit
app.post("/baby/edit", (req, res) => {
  const { text, reply } = req.body;
  const key = text.toLowerCase();
  if (!db[key]) return res.json({ message: "❌ Key not found!" });

  db[key][0] = reply;
  saveDB();
  res.json({ message: `✏️ Edited "${key}" to "${reply}"`, replies: db[key] });
});

// ✅ Root check
app.get("/", (req, res) => {
  res.send("✅ SaimSimi API is running...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server started at http://localhost:${PORT}`));
