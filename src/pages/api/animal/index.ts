import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import Animal from "@/models/Animal";
import User from "@/models/User";
import Training from "@/models/Training";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  try {
    // CREATE
    if (req.method === "POST") {
      const { name, breed, ownerId, hoursTrained, imageUrl } = req.body;

      if (!name || !breed || !ownerId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const owner = await User.findById(ownerId);
      if (!owner) {
        return res.status(404).json({ error: "Owner not found" });
      }

      const animal = await Animal.create({
        name,
        breed,
        ownerId,
        hoursTrained: hoursTrained || 0,
        imageUrl,
      });

      return res.status(201).json({ message: "Animal created", animal });
    }

    // READ (all or one)
    if (req.method === "GET") {
      const { id } = req.query;

      if (id) {
        const animal = await Animal.findById(id).populate("ownerId");
        if (!animal) return res.status(404).json({ error: "Animal not found" });

        return res.status(200).json(animal);
      }

      const animals = await Animal.find().populate("ownerId");
      return res.status(200).json(animals);
    }

    // FULL UPDATE
    if (req.method === "PUT") {
      const { id, name, breed, ownerId, hoursTrained, imageUrl } = req.body;

      if (!id) return res.status(400).json({ error: "Missing animal id" });

      const animal = await Animal.findById(id);
      if (!animal) return res.status(404).json({ error: "Animal not found" });

      animal.name = name ?? animal.name;
      animal.breed = breed ?? animal.breed;
      animal.ownerId = ownerId ?? animal.ownerId;
      animal.hoursTrained = hoursTrained ?? animal.hoursTrained;
      animal.imageUrl = imageUrl ?? animal.imageUrl;

      await animal.save();

      return res.status(200).json({ message: "Animal updated", animal });
    }

    // PARTIAL UPDATE
    if (req.method === "PATCH") {
      const { id, ...updates } = req.body;

      if (!id) return res.status(400).json({ error: "Missing animal id" });

      const updated = await Animal.findByIdAndUpdate(id, updates, { new: true });
      if (!updated) return res.status(404).json({ error: "Animal not found" });

      return res.status(200).json({ message: "Animal updated", animal: updated });
    }

    // DELETE
    if (req.method === "DELETE") {
      const { id } = req.body;

      if (!id) return res.status(400).json({ error: "Missing animal id" });

      const deleted = await Animal.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Animal not found" });

      await Training.deleteMany({ animalId: id });

      return res.status(200).json({ message: "Animal deleted" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}