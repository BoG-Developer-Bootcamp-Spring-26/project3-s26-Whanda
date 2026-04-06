import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import argon2 from "argon2";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  try {
    // Only allow POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isValid = await argon2.verify(user.password, password);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Success response
    return res.status(200).json({
      message: "Login successful",
      userId: user._id,
      isAdmin: user.isAdmin,
      name: user.name,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}