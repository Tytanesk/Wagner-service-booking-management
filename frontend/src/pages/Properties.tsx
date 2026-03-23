import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SimpleAddPropertyForm from "@/components/SimpleAddPropertyForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, LogIn, LogOut, Moon, CalendarDays, Percent, DollarSign, Eye, FileText, Save, Plus, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useProperties, useUpdatePropertyDetail, useDeleteProperty } from "@/hooks/useProperties";
import { useBookings, Booking } from "@/hooks/useBookings";
import { format, parseISO, isToday, isBefore, isAfter, startOfMonth, endOfMonth, differenceInDays } from "date-fns";
import { de } from "date-fns/locale";

// Error boundary wrapper component
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
    const [hasError, setHasError] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            console.error('JavaScript error caught:', event.error);
            setError(event.error);
            setHasError(true);
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            console.error('Unhandled promise rejection:', event.reason);
            setError(new Error(event.reason));
            setHasError(true);
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

    if (hasError) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <div className="text-red-500 text-lg font-semibold">
                        Ein Fehler ist aufgetreten
                    </div>
                    <div className="text-gray-600 text-center max-w-md">
                        {error?.message || 'Unbekannter JavaScript-Fehler'}
                    </div>
                    <div className="space-x-2">
                        <Button onClick={() => {
                            setHasError(false);
                            setError(null);
                        }}>
                            Erneut versuchen
                        </Button>
                        <Button variant="outline" onClick={() => window.location.reload()}>
                            Seite neu laden
                        </Button>
                    </div>
                </div>
            </Layout>
        );
    }

    return <>{children}</>;
};

const Properties = () => {
    const navigate = useNavigate();
    const { data: properties = [], isLoading: propertiesLoading, error: propertiesError } = useProperties();
    const { data: bookings = [], isLoading: bookingsLoading, error: bookingsError } = useBookings();

    const updateDetail = useUpdatePropertyDetail();
    const deleteProperty = useDeleteProperty();
    const [editingDetails, setEditingDetails] = useState<Record<string, string>>({});
    const [showAddForm, setShowAddForm] = useState(false);

    const handleDeleteProperty = (propertyId: number, propertyName: string) => {
        if (window.confirm(`Möchten Sie die Unterkunft "${propertyName}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
            deleteProperty.mutate(propertyId);
        }
    };

    // Error fallback
    if (propertiesError || bookingsError) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <div className="text-red-500 text-lg font-semibold">
                        Ein Fehler ist aufgetreten
                    </div>
                    <div className="text-gray-600 text-center max-w-md">
                        {propertiesError?.message || bookingsError?.message || 'Unbekannter Fehler'}
                    </div>
                    <Button onClick={() => window.location.reload()}>
                        Seite neu laden
                    </Button>
                </div>
            </Layout>
        );
    }

    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;

    const isLoading = propertiesLoading || bookingsLoading;

    // Add error handling for bookings data - MUST BE DECLARED BEFORE USE
    const safeBookings = Array.isArray(bookings) ? bookings.filter(booking => {
        try {
            // Validate required fields
            return booking && 
                   booking.property_id && 
                   booking.arrival_date &&
                   typeof booking.arrival_date === 'string';
        } catch (error) {
            console.error("Invalid booking data:", booking, error);
            return false;
        }
    }) : [];

    const getPropertyBookings = (propertyId: number) => {
        return safeBookings.filter((b) => Number(b.property_id) === Number(propertyId));
    };

    const getTodayArrivals = (propertyId: number) => {
        return safeBookings.filter(
            (b) => {
                try {
                    return Number(b.property_id) === Number(propertyId) && 
                           b.arrival_date && 
                           format(parseISO(b.arrival_date), "yyyy-MM-dd") === todayStr;
                } catch (error) {
                    console.error("Date parsing error in getTodayArrivals:", error, b);
                    return false;
                }
            }
        );
    };

    const getTodayDepartures = (propertyId: number) => {
        return safeBookings.filter(
            (b) => {
                try {
                    return Number(b.property_id) === Number(propertyId) && 
                           b.departure_date && 
                           format(parseISO(b.departure_date), "yyyy-MM-dd") === todayStr;
                } catch (error) {
                    console.error("Date parsing error in getTodayDepartures:", error, b);
                    return false;
                }
            }
        );
    };

    const getCurrentlyStaying = (propertyId: number) => {
        return safeBookings.filter((b) => {
            try {
                if (Number(b.property_id) !== Number(propertyId)) return false;
                if (!b.arrival_date || !b.departure_date) return false;
                
                const arrival = parseISO(b.arrival_date);
                const departure = parseISO(b.departure_date);
                return (
                    (isBefore(arrival, today) || isToday(arrival)) &&
                    isAfter(departure, today)
                );
            } catch (error) {
                console.error("Date parsing error in getCurrentlyStaying:", error, b);
                return false;
            }
        });
    };

    const confirmedBookings = safeBookings.filter(b => b.status === 'confirmed');

    const getMonthlyStats = (propertyId: number) => {
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        
        // Get all bookings for this property that have any nights in the current month
        const propertyBookings = confirmedBookings.filter((b) => {
            try {
                if (Number(b.property_id) !== Number(propertyId)) return false;
                if (!b.arrival_date) return false;
                
                const arrivalDate = parseISO(b.arrival_date);
                const departureDate = b.departure_date 
                    ? parseISO(b.departure_date) 
                    : addDays(arrivalDate, b.total_nights || 0);

                // Check if booking has any nights within the current month
                const monthStart = new Date(currentYear, currentMonth - 1, 1);
                const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);
                
                return arrivalDate <= monthEnd && departureDate > monthStart;
            } catch (error) {
                console.error("Date parsing error in getMonthlyStats:", error, b);
                return false;
            }
        });

        // Calculate blocked bookings for this property in current month
        const blockedBookings = safeBookings.filter((b) => {
            try {
                if (Number(b.property_id) !== Number(propertyId)) return false;
                if (!b.arrival_date) return false;
                
                // Check if booking is a blocking status
                const blockingStatuses = ['black', 'blind', 'closed', 'unavailable', 'blocked', 'maintenance', 'inventory_closed', 'no_availability', '0'];
                if (!blockingStatuses.includes(b.status?.toLowerCase())) return false;
                
                const arrivalDate = parseISO(b.arrival_date);
                const departureDate = b.departure_date 
                    ? parseISO(b.departure_date) 
                    : addDays(arrivalDate, b.total_nights || 0);

                const monthStart = new Date(currentYear, currentMonth - 1, 1);
                const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);
                
                return arrivalDate <= monthEnd && departureDate > monthStart;
            } catch (error) {
                console.error("Date parsing error in blocked bookings:", error, b);
                return false;
            }
        });

        // Calculate nights that actually fall within the current month
        const bookedNights = propertyBookings.reduce((sum, booking) => {
            try {
                const arrivalDate = parseISO(booking.arrival_date);
                const departureDate = booking.departure_date 
                    ? parseISO(booking.departure_date) 
                    : addDays(arrivalDate, booking.total_nights || 0);

                const monthStart = new Date(currentYear, currentMonth - 1, 1);
                const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);

                // Calculate overlap between booking and month
                const overlapStart = arrivalDate > monthStart ? arrivalDate : monthStart;
                const overlapEnd = departureDate < monthEnd ? departureDate : monthEnd;
                
                if (overlapStart < overlapEnd) {
                    const nightsInMonth = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24));
                    return sum + Math.max(0, nightsInMonth);
                }
                
                return sum;
            } catch (error) {
                console.error("Error calculating nights in month:", error, booking);
                return sum;
            }
        }, 0);

        const blockedNights = blockedBookings.reduce((sum, booking) => {
            try {
                const arrivalDate = parseISO(booking.arrival_date);
                const departureDate = booking.departure_date 
                    ? parseISO(booking.departure_date) 
                    : addDays(arrivalDate, booking.total_nights || 0);

                const monthStart = new Date(currentYear, currentMonth - 1, 1);
                const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);

                const overlapStart = arrivalDate > monthStart ? arrivalDate : monthStart;
                const overlapEnd = departureDate < monthEnd ? departureDate : monthEnd;
                
                if (overlapStart < overlapEnd) {
                    const nightsInMonth = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24));
                    return sum + Math.max(0, nightsInMonth);
                }
                
                return sum;
            } catch (error) {
                console.error("Error calculating blocked nights in month:", error, booking);
                return sum;
            }
        }, 0);

        const availableNights = Math.max(daysInMonth - blockedNights, 1);
        const totalRevenue = propertyBookings.reduce((sum, b) => sum + Number(b.price || 0), 0);
        const occupancyRate = availableNights > 0 ? Math.min(bookedNights / availableNights, 1) * 100 : 0;

        const commissionRate = Number(propertyId) === 292355 ? 0.05 : 0.07;
        const commission = totalRevenue * commissionRate;

        return { bookedNights, occupancyRate, totalRevenue, commission, commissionRate };
    };

    const formatDateRange = (booking: Booking) => {
        try {
            if (!booking.arrival_date) return "Datum unbekannt";
            
            const arrival = format(parseISO(booking.arrival_date), "d. MMM", { locale: de });
            const departure = booking.departure_date
                ? format(parseISO(booking.departure_date), "d. MMM", { locale: de })
                : "?";
            return `${arrival} – ${departure}`;
        } catch (error) {
            console.error("Date formatting error:", error, booking);
            return "Ungültiges Datum";
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-foreground">Unterkünfte</h2>
                        <p className="text-muted-foreground mt-1">
                            Übersicht aller Unterkünfte und aktueller Verfügbarkeiten
                        </p>
                    </div>
                    <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Unterkunft hinzufügen
                    </Button>
                </div>

                {showAddForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <SimpleAddPropertyForm onClose={() => setShowAddForm(false)} />
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Laden...</div>
                ) : properties.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">Keine Unterkünfte gefunden</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {properties.map((property) => {
                            const todayArrivals = getTodayArrivals(property.id);
                            const todayDepartures = getTodayDepartures(property.id);
                            const currentlyStaying = getCurrentlyStaying(property.id);
                            const stats = getMonthlyStats(property.id);

                            return (
                                <Card key={property.id} className="overflow-hidden">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2">
                                            <Building2 className="h-5 w-5 text-primary" />
                                            {property.name}
                                        </CardTitle>
                                        {property.address && (
                                            <p className="text-sm text-muted-foreground">{property.address}</p>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-4">

                                        {/* Today's Activity */}
                                        <div className="space-y-3">

                                            {/* Arrivals */}
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-md bg-green-500/10">
                                                    <LogIn className="h-4 w-4 text-green-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-muted-foreground">
                                                        Ankünfte heute
                                                    </p>
                                                    {todayArrivals.length > 0 ? (
                                                        todayArrivals.map((b) => (
                                                            <p key={b.id} className="text-sm truncate">
                                                                {(b.first_name ?? "") + " " + (b.last_name ?? "")}
                                                                <span className="text-muted-foreground"> ({formatDateRange(b)})</span>
                                                            </p>
                                                        ))
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground">—</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Departures */}
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-md bg-red-500/10">
                                                    <LogOut className="h-4 w-4 text-red-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-muted-foreground">
                                                        Abreisen heute
                                                    </p>
                                                    {todayDepartures.length > 0 ? (
                                                        todayDepartures.map((b) => (
                                                            <p key={b.id} className="text-sm truncate">
                                                                {(b.first_name ?? "") + " " + (b.last_name ?? "")}
                                                                <span className="text-muted-foreground"> ({formatDateRange(b)})</span>
                                                            </p>
                                                        ))
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground">—</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Currently Staying */}
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-md bg-blue-500/10">
                                                    <Moon className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-muted-foreground">
                                                        Aktuell im Aufenthalt
                                                    </p>
                                                    {currentlyStaying.length > 0 ? (
                                                        currentlyStaying.map((b) => (
                                                            <p key={b.id} className="text-sm truncate">
                                                                {(b.first_name ?? "") + " " + (b.last_name ?? "")}
                                                                <span className="text-muted-foreground"> ({formatDateRange(b)})</span>
                                                            </p>
                                                        ))
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground">Verfügbar</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Monthly Stats */}
                                        <div className="pt-3 border-t border-border">
                                            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                                                {format(today, "MMMM yyyy", { locale: de })} Statistik
                                            </p>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="text-center p-2 rounded-md bg-muted/50">
                                                    <CalendarDays className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                                                    <p className="text-lg font-semibold">{stats.bookedNights}</p>
                                                    <p className="text-xs text-muted-foreground">Nächte</p>
                                                </div>
                                                <div className="text-center p-2 rounded-md bg-muted/50">
                                                    <DollarSign className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                                                    <p className="text-lg font-semibold">€{stats.totalRevenue.toFixed(0)}</p>
                                                    <p className="text-xs text-muted-foreground">Gesamtumsatz</p>
                                                </div>
                                                <div className="text-center p-2 rounded-md bg-muted/50">
                                                    <DollarSign className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                                                    <p className="text-lg font-semibold">€{stats.commission.toFixed(0)}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(stats.commissionRate * 100).toFixed(0)}% Provision
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Detail Field */}
                                        <div className="pt-3 border-t border-border space-y-2">
                                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                                <FileText className="h-4 w-4" />
                                                Anmerkungen
                                            </div>
                                            <Textarea
                                                value={editingDetails[property.id] ?? property.detail ?? ""}
                                                onChange={(e) => setEditingDetails(prev => ({ ...prev, [property.id]: e.target.value }))}
                                                placeholder="Fügen Sie Anmerkungen zu dieser Immobilie hinzu..."
                                                className="min-h-[200px] resize-none text-sm"
                                            />
                                            {(editingDetails[property.id] !== undefined && editingDetails[property.id] !== (property.detail ?? "")) && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        updateDetail.mutate({ id: property.id, value: editingDetails[property.id] });
                                                        setEditingDetails(prev => {
                                                            const next = { ...prev };
                                                            delete next[property.id];
                                                            return next;
                                                        });
                                                    }}
                                                    disabled={updateDetail.isPending}
                                                >
                                                    <Save className="h-3 w-3 mr-1" />
                                                    Speichern
                                                </Button>
                                            )}
                                        </div>

                                        {/* Details Button */}
                                        <div className="pt-3 border-t border-border space-y-2">
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => navigate(`/dashboard?property=${property.id}`)}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Details ansehen
                                            </Button>
                                            
                                            {/* Delete Button - Only for local properties (ID >= 900000) */}
                                            {property.id >= 900000 && (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => handleDeleteProperty(property.id, property.name)}
                                                    disabled={deleteProperty.isPending}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    {deleteProperty.isPending ? 'Wird gelöscht...' : 'Unterkunft löschen'}
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default () => (
    <ErrorBoundary>
        <Properties />
    </ErrorBoundary>
);
