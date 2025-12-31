// api/wishes.js
import { kv } from '@vercel/kv';

const WISHES_KEY = 'cdac_wishes';

async function getWishes() {
    try {
        const wishes = await kv.get(WISHES_KEY);
        return wishes || [];
    } catch (error) {
        console.error('Error reading wishes:', error);
        return [];
    }
}

async function saveWishes(wishes) {
    try {
        await kv.set(WISHES_KEY, wishes);
    } catch (error) {
        console.error('Error saving wishes:', error);
        throw error;
    }
}

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        const wishes = await getWishes();
        return res.status(200).json({ wishes });
    }

    if (req.method === 'POST') {
        const { name, message } = req.body || {};

        if (!name?.trim() || !message?.trim()) {
            return res.status(400).json({ error: 'name and message are required' });
        }

        const wishes = await getWishes();

        const newWish = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: name.trim(),
            message: message.trim(),
            createdAt: Date.now()
        };

        const updatedWishes = [newWish, ...wishes];
        await saveWishes(updatedWishes);

        return res.status(201).json(newWish);
    }

    return res.status(405).json({ error: 'Method not allowed' });
}