import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar, Building2, TrendingUp } from "lucide-react";

const Index = () => {
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                navigate("/dashboard");
            }
        });
    }, [navigate]);

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground">
                        Vermietungsmanager
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Automatisierte Reservierungsverwaltung für Ferienunterkünfte.
                        Nahtlose Integration mit Beds24 und zentrale Verwaltung all Ihrer Buchungen.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button size="lg" onClick={() => navigate("/auth")}>
                            Jetzt starten
                        </Button>
                        <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                            Anmelden
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mt-16 text-left">
                        <div className="space-y-3">
                            <Calendar className="h-10 w-10 text-primary" />
                            <h3 className="text-xl font-semibold">Automatisierte Buchungen</h3>
                            <p className="text-muted-foreground">
                                Importieren Sie Reservierungen direkt über die Beds24-API.
                                Keine manuelle Dateneingabe erforderlich.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <Building2 className="h-10 w-10 text-primary" />
                            <h3 className="text-xl font-semibold">Mehrere Objekte</h3>
                            <p className="text-muted-foreground">
                                Verwalten Sie mehrere Kunden und Unterkünfte mit sicherem,
                                isoliertem Datenzugriff.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <TrendingUp className="h-10 w-10 text-primary" />
                            <h3 className="text-xl font-semibold">Echtzeit-Analytics</h3>
                            <p className="text-muted-foreground">
                                Verfolgen Sie Auslastung, Umsatz und Provisionen mit
                                Live-Statistiken.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;
