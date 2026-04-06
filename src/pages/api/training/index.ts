import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import Training from "@/models/Training";
import Animal from "@/models/Animal";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  try {
    if (req.method === "POST") {
      const { title, description, hours, userId, animalId } = req.body;

      if (!title || !hours || !userId || !animalId) {
        return res.status(400).json({ error: "Missing fields" });
      }

      const animal = await Animal.findById(animalId);
      if (!animal || animal.ownerId.toString() !== userId) {
        return res.status(400).json({ error: "Invalid animal ownership" });
      }

      const training = await Training.create({
        title,
        description,
        hours,
        userId,
        animalId,
      });

      animal.hoursTrained += hours;
      await animal.save();

      return res.status(201).json({ message: "Training created", training });
    }

    if (req.method === "GET") {
      const logs = await Training.find()
        .populate("userId")
        .populate("animalId");

      return res.status(200).json(logs);
    }

    if (req.method === "PUT" || req.method === "PATCH") {
      const { id, ...updates } = req.body;

      if (!id) return res.status(400).json({ error: "Missing id" });

      const updated = await Training.findByIdAndUpdate(id, updates, { new: true });
      if (!updated) return res.status(404).json({ error: "Training not found" });

      return res.status(200).json({ message: "Training updated", updated });
    }

    if (req.method === "DELETE") {
      const { id } = req.body;

      if (!id) return res.status(400).json({ error: "Missing id" });

      const deleted = await Training.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Training not found" });

      return res.status(200).json({ message: "Training deleted" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}