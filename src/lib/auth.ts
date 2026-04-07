import jwt from "jsonwebtoken";
import {NextApiRequest, NextApiResponse} from "next";

const SECRET = process.env.JWT_SECRET!;

export function createToken(userId: string, name: string, isAdmin: boolean): string {
    return jwt.sign({userId, name, isAdmin}, SECRET, {expiresIn: "24h"});
}

export function setTokenCookie(res: NextApiResponse, token: string) {
    res.setHeader(
        "Set-Cookie",
        `token=${token}; Path=/; HttpOnly; Path=/; Max-Age$(60 * 60 * 24); SameSite=Strict`
    );
}

export function clearTokenCookie(res: NextApiResponse) {                                                              
    res.setHeader(
        "Set-Cookie",
        "token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict"
    );                                                                                                                  
}
export function verifyToken(req: NextApiRequest): { userId: string; name: string; isAdmin: boolean } | null {         
    const cookie = req.headers.cookie;                                                                                  
    if (!cookie) return null;
                                                                                                                        
    const tokenMatch = cookie.split("; ").find((c) => c.startsWith("token="));                                          
    if (!tokenMatch) return null;
                                                                                                                        
    const token = tokenMatch.split("=")[1];

    try {
      return jwt.verify(token, SECRET) as { userId: string; name: string; isAdmin: boolean };
    } catch {                                                                                                           
      return null;
    }                                                                                                                   
  }  