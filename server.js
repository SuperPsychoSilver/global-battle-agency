import express from "express";
import fs from "fs";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 8080;
const DB_FILE = "./accounts.json";

app.use(bodyParser.json());

function loadAccounts() {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveAccounts(accs) {
  fs.writeFileSync(DB_FILE, JSON.stringify(accs, null, 2));
}

app.post("/register", (req, res) => {
  const { trainer_name, secret, game_id } = req.body;
  if (!trainer_name || !secret)
    return res.json({ status: "error", error: "Missing parameters." });

  let accounts = loadAccounts();
  let existing = accounts.filter(a => a.trainer_name === trainer_name);
  let username = trainer_name;
  if (existing.length > 0) username = `${trainer_name}${existing.length + 1}`;

  const newAccount = { username, trainer_name, secret, game_id, created_at: new Date().toISOString() };
  accounts.push(newAccount);
  saveAccounts(accounts);

  res.json({ status: "registered", username, game_id });
});

app.post("/login", (req, res) => {
  const { trainer_name, secret } = req.body;
  if (!trainer_name || !secret)
    return res.json({ status: "error", error: "Missing credentials." });

  let accounts = loadAccounts();
  let acc = accounts.find(a => a.trainer_name === trainer_name && a.secret === secret);
  if (!acc) return res.json({ status: "error", error: "No matching account." });

  res.json({ status: "success", username: acc.username, game_id: acc.game_id });
});

app.listen(PORT, () => console.log(`Global Battle Agency server online on port ${PORT}`));
