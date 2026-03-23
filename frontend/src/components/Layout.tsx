import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Building2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isAdmin, setIsAdmin] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            // const checkRole = async () => {
            //     const { data } = await supabase
            //         .from("user_roles")
            //         .select("role")
            //         .eq("user_id", user.id)
            //         .maybeSingle();
            //     setIsAdmin(data?.role === "admin");
            // };
            // checkRole();
        }
    }, [user]);

    useEffect(() => {
        if (!isLoading && !session) {
            navigate("/auth");
        }
    }, [session, isLoading, navigate]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        toast.success("Erfolgreich abgemeldet!");
        navigate("/auth");
    };

    if (isLoading || !session) return null;

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card">
                <div className="w-full px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-serif font-bold text-foreground">Vermietungsmanager</h1>
                        <nav className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/properties")}
                                className="gap-2"
                            >
                                <Building2 className="h-4 w-4" />
                                Immobilie
                            </Button>
                            <Button variant="outline" onClick={handleSignOut} className="gap-2">
                                <LogOut className="h-4 w-4" />
                                Abmelden
                            </Button>
                        </nav>
                    </div>
                </div>
            </header>
            <main className="w-full px-6 py-8">{children}</main>
        </div>
    );
};

export default Layout;