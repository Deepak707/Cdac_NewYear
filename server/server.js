import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "data", "wishes.json");

async function readDB() {
    try {
        const raw = await fs.readFile(DATA_FILE, "utf-8");
        const db = JSON.parse(raw);
        if (!db.wishes) db.wishes = [];
        return db;
    } catch {
        return { wishes: [] };
    }
}

async function writeDB(db) {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
}

app.get("/api/wishes", async (_, res) => {
    const db = await readDB();
    res.json(db);
});

app.post("/api/wishes", async (req, res) => {
    const { name, message } = req.body || {};
    if (!name?.trim() || !message?.trim()) return res.status(400).json({ error: "name/message required" });

    const db = await readDB();
    const wish = {
        id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
        name: name.trim(),
        message: message.trim(),
        createdAt: Date.now()
    };

    db.wishes = [wish, ...db.wishes];
    await writeDB(db);
    res.json(wish);
});

const PORT = process.env.PORT || 5179;
app.listen(PORT, () => console.log(`API: http://localhost:${PORT}`));
