import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();
    res.status(200).json({ message: "MongoDB connected!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Connection failed" });
  }
}