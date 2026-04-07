import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import argon2 from "argon2";
import {createToken, setTokenCookie} from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  try {
    // CREATE USER
    if (req.method === "POST") {
      const { name, email, password, isAdmin } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: "Missing fields" });
      }

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ error: "User already exists" });
      }

      const hashed = await argon2.hash(password);

      const user = await User.create({
        name,
        email,
        password: hashed,
        isAdmin: isAdmin || false,
      });

      const token = createToken(user._id.toString(), user.name, user.isAdmin);
      setTokenCookie(res, token);

      return res.status(201).json({ message: "User created", user });
    }

    // GET USERS
    if (req.method === "GET") {
      const users = await User.find({}, "-password");
      return res.status(200).json(users);
    }

    // UPDATE USER
    if (req.method === "PUT" || req.method === "PATCH") {
      const { id, name, email, password, isAdmin } = req.body;

      if (!id) return res.status(400).json({ error: "Missing user id" });

      const user = await User.findById(id);
      if (!user) return res.status(404).json({ error: "User not found" });

      if (name) user.name = name;
      if (email) user.email = email;
      if (password) user.password = await argon2.hash(password);
      if (isAdmin !== undefined) user.isAdmin = isAdmin;

      await user.save();

      return res.status(200).json({ message: "User updated", user });
    }

    // DELETE USER
    if (req.method === "DELETE") {
      const { id } = req.body;

      if (!id) return res.status(400).json({ error: "Missing user id" });

      const deleted = await User.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "User not found" });

      return res.status(200).json({ message: "User deleted" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}