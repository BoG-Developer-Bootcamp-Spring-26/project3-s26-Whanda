import { useEffect, useState } from "react";                                                                          
                  
export type AppUser = {
  id: string;
  name: string;                                                                                                       
  isAdmin: boolean;
};                                                                                                                    
                  
export default function useCurrentUser() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);                                                                       
   
  const fetchUser = async () => {                                                                                     
    try {       
      const res = await fetch("/api/user/me");

      if (!res.ok) {                                                                                                  
        setUser(null);
        return;                                                                                                       
      }         

      const data = await res.json();
      setUser({
        id: data.userId,
        name: data.name,
        isAdmin: data.isAdmin,
      });                                                                                                             
    } catch {
      setUser(null);                                                                                                  
    } finally { 
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    }, []);
                                                                                                                        
    const login = async (userData: AppUser) => {
      setUser(userData);                                                                                                
    };            

    const logout = async () => {
      await fetch("/api/user/logout", { method: "POST" });
      setUser(null);                                                                                                    
    };
                                                                                                                        
    return { user, loading, login, logout };
  }