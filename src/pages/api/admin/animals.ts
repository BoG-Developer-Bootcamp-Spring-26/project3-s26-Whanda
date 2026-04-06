import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import Animal from "@/models/Animal";
import User from "@/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId for admin verification" });
    }

    const adminUser = await User.findById(userId);
    if (!adminUser || !adminUser.isAdmin) {
      return res.status(403).json({ error: "Access denied: Admins only" });
    }

    const animals = await Animal.find().populate("ownerId");

    return res.status(200).json(animals);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}