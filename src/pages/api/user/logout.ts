import type { NextApiRequest, NextApiResponse } from "next";                                                          
import { clearTokenCookie } from "@/lib/auth";
                                                                                                                        
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }                                                                                                                   
   
    clearTokenCookie(res);                                                                                              
    return res.status(200).json({ message: "Logged out" });
  }