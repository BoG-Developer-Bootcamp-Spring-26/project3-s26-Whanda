import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import Animal from "@/models/Animal";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();

    if (req.method === "GET") {
      // Get all animals
      const animals = await Animal.find().populate("ownerId");
      return res.status(200).json(animals);
    }

    if (req.method === "POST") {
      // Create new animal
      const { name, breed, hoursTrained, profilePic, ownerId } = req.body;

      if (!name || !breed || hoursTrained == null || !ownerId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const newAnimal = new Animal({ name, breed, hoursTrained, profilePic, ownerId });
      await newAnimal.save();

      return res.status(200).json(newAnimal);
    }

    // Reject all other methods
    return res.status(405).json({ message: "Method Not Allowed" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
}