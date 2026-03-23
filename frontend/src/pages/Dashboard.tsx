import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { format, addDays, isSameDay, isWithinInterval, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { useBookings, useUpdateBooking } from "@/hooks/useBookings";
import { useProperties } from "@/hooks/useProperties";
// Removed useAvailability import - endpoint doesn't exist
import { EditableCell } from "@/components/EditableCell";
import { cn } from "@/lib/utils";

const getStatusVariant = (status: string | null): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toLowerCase()) {
        case "confirmed":
            return "default";
        case "cancelled":
        case "black":
        case "blind":
        case "closed":
        case "unavailable":
        case "blocked":
        case "maintenance":
        case "inventory_closed":
        case "no_availability":
        case "0":
            return "destructive";
        case "request":
        case "inquiry":
        case "new":
            return "outline";
        default:
            return "secondary";
    }
};

// Safe Calendar component without Radix UI Popover
const SafeCalendar = ({ selectedMonth, selectedYear, bookings, onMonthChange, propertyId }: {
    selectedMonth: number;
    selectedYear: number;
    bookings: any[];
    onMonthChange: (month: number, year: number) => void;
    propertyId?: string;
}) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showTooltip, setShowTooltip] = useState(false);

    // Availability data removed - endpoint doesn't exist
    // Using booking data for calendar display instead

    // Reset tooltip state when month/year changes
    useEffect(() => {
        setSelectedDate(null);
        setShowTooltip(false);
    }, [selectedMonth, selectedYear]);

    const today = new Date();
    const monthStart = new Date(selectedYear, selectedMonth - 1, 1);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - monthStart.getDay()); // Start from Sunday

    const days = [];
    const current = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    const getBookingForDate = (date: Date) => {
        const booking = bookings.find((booking) => {
            try {
                const arrival = parseISO(booking.arrival_date);
                const departure = booking.departure_date ? parseISO(booking.departure_date) : addDays(arrival, booking.total_nights);
                const lastNight = addDays(departure, -1);
                return isWithinInterval(date, { start: arrival, end: lastNight });
            } catch (error) {
                return false;
            }
        });
        
        // Debug: Log booking status for dates that have bookings
        if (booking && booking.status) {
            console.log(`Date ${format(date, 'yyyy-MM-dd')}: Status = "${booking.status}"`);
        }
        
        return booking;
    };

    // Removed availability functions - using booking data instead for calendar display

    const isToday = (date: Date) => isSameDay(date, today);
    const isCurrentMonth = (date: Date) => date.getMonth() === selectedMonth - 1;

    const handlePrevMonth = () => {
        if (selectedMonth === 1) {
            onMonthChange(12, selectedYear - 1);
        } else {
            onMonthChange(selectedMonth - 1, selectedYear);
        }
    };

    const handleNextMonth = () => {
        if (selectedMonth === 12) {
            onMonthChange(1, selectedYear + 1);
        } else {
            onMonthChange(selectedMonth + 1, selectedYear);
        }
    };

    const handleDateClick = (date: Date, booking: any) => {
        setSelectedDate(date);
        setShowTooltip(!!booking);
    };

    const handleMouseEnter = (booking: any) => {
        if (booking) {
            setShowTooltip(true);
        }
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
    };

    return (
        <div className="space-y-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-gray-100 rounded"
                >
                    ←
                </button>
                <div className="font-medium">
                    {format(monthStart, "MMMM yyyy", { locale: de })}
                </div>
                <button
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-gray-100 rounded"
                >
                    →
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
                {/* Day headers */}
                {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map((day) => (
                    <div key={day} className="text-xs font-medium text-gray-500 p-2">
                        {day}
                    </div>
                ))}
                
                {/* Calendar days */}
                {days.map((date, index) => {
                    const booking = getBookingForDate(date);
                    // Removed availability check - using booking data only
                    const isTodayDate = isToday(date);
                    const isCurrentMonthDate = isCurrentMonth(date);
                    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                    
                    return (
                        <div key={dateKey} className="relative">
                            <button
                                className={cn(
                                    "w-8 h-8 text-sm rounded-md transition-colors relative",
                                    isTodayDate && "ring-2 ring-blue-500 font-bold",
                                    booking && booking.status === 'confirmed' && "bg-blue-500 text-white hover:bg-blue-600",
                                    booking && (booking.status === 'black' || booking.status === 'blind' || booking.status === 'closed' || booking.status === 'unavailable' || booking.status === 'blocked' || booking.status === 'maintenance' || booking.status === 'inventory_closed' || booking.status === 'no_availability' || booking.status === '0') && "bg-red-500 text-white hover:bg-red-600",
                                    booking && booking.status !== 'confirmed' && booking.status !== 'black' && booking.status !== 'blind' && booking.status !== 'closed' && booking.status !== 'unavailable' && booking.status !== 'blocked' && booking.status !== 'maintenance' && booking.status !== 'inventory_closed' && booking.status !== 'no_availability' && booking.status !== '0' && "bg-yellow-200 text-yellow-800 hover:bg-yellow-300",
                                    !booking && isCurrentMonthDate && "hover:bg-gray-100",
                                    !isCurrentMonthDate && "text-gray-300"
                                )}
                                onClick={() => handleDateClick(date, booking)}
                                onMouseEnter={() => handleMouseEnter(booking)}
                                onMouseLeave={handleMouseLeave}
                            >
                                {date.getDate()}
                            </button>
                            
                            {/* Simple tooltip without Radix UI */}
                            {booking && selectedDate && isSameDay(selectedDate, date) && showTooltip && (
                                <div className="absolute z-10 top-10 left-0 bg-white border border-gray-200 rounded-md shadow-lg p-3 min-w-[200px]">
                                    <div className="space-y-1 text-xs text-left">
                                        <div className="font-semibold">
                                            {(booking.first_name || "") + " " + (booking.last_name || "")}
                                        </div>
                                        <div><span className="font-medium">Ankunft:</span> {format(parseISO(booking.arrival_date), "dd.MM.yyyy")}</div>
                                        <div><span className="font-medium">Abreise:</span> {booking.departure_date ? format(parseISO(booking.departure_date), "dd.MM.yyyy") : "-"}</div>
                                        <div><span className="font-medium">Nächte:</span> {booking.total_nights}</div>
                                        <div><span className="font-medium">Gäste:</span> {booking.num_adult}A {booking.num_child > 0 && `${booking.num_child}K`}</div>
                                        {booking.phone && <div><span className="font-medium">Tel:</span> {booking.phone}</div>}
                                        {booking.email && <div><span className="font-medium">Email:</span> {booking.email}</div>}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Bestätigt</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-200 rounded"></div>
                    <span>Anfrage</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Gesperrt/Nicht verfügbar</span>
                </div>
            </div>
        </div>
    );
};

// Error boundary wrapper
const DashboardErrorBoundary = ({ children }: { children: React.ReactNode }) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            console.error('Dashboard error caught:', event.error);
            setHasError(true);
        };

        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

    if (hasError) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <div className="text-red-500 text-lg font-semibold">
                        Ein Fehler ist aufgetreten
                    </div>
                    <button 
                        onClick={() => setHasError(false)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Erneut versuchen
                    </button>
                </div>
            </Layout>
        );
    }

    return <>{children}</>;
};

const Dashboard = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [monthEnabled, setMonthEnabled] = useState(true);

    const [searchParams] = useSearchParams();
    const propertyId = searchParams.get("property");

    const { data: allBookings = [], isLoading } = useBookings();
    const { data: properties = [] } = useProperties();

    const selectedProperty = propertyId ? properties.find(p => Number(p.id) === Number(propertyId)) : null;

    const updateBookingMutation = useUpdateBooking();

    const today = new Date();

    // Filter bookings by property if specified
    const filteredBookings = useMemo(() => {
        if (propertyId) {
            return allBookings.filter((b) => Number(b.property_id) === Number(propertyId));
        }
        return allBookings;
    }, [allBookings, propertyId]);


    // Get confirmed bookings for the selected period (for reservations list and analysis)
    const confirmedPeriodBookings = useMemo(() => {
        return filteredBookings.filter((booking) => {
            try {
                if (!booking.arrival_date || booking.status !== 'confirmed') return false;
                
                const arrivalDate = parseISO(booking.arrival_date);
                const departureDate = booking.departure_date 
                    ? parseISO(booking.departure_date) 
                    : addDays(arrivalDate, booking.total_nights);

                if (monthEnabled) {
                    // Check if booking has any nights within the selected month
                    const monthStart = new Date(selectedYear, selectedMonth - 1, 1);
                    const monthEnd = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);
                    
                    return arrivalDate <= monthEnd && departureDate > monthStart;
                } else {
                    // For yearly view, check if booking has any nights within the selected year
                    const yearStart = new Date(selectedYear, 0, 1);
                    const yearEnd = new Date(selectedYear, 11, 31, 23, 59, 59);
                    
                    return arrivalDate <= yearEnd && departureDate > yearStart;
                }
            } catch (error) {
                console.error("Date parsing error in confirmedPeriodBookings:", error, booking);
                return false;
            }
        });
    }, [filteredBookings, selectedMonth, selectedYear, monthEnabled]);

    // Get blocked bookings for occupancy calculation only
    const blockedPeriodBookings = useMemo(() => {
        return filteredBookings.filter((booking) => {
            try {
                if (!booking.arrival_date) return false;
                
                // Check if booking is a blocking status
                const blockingStatuses = ['black', 'blind', 'closed', 'unavailable', 'blocked', 'maintenance', 'inventory_closed', 'no_availability', '0'];
                if (!blockingStatuses.includes(booking.status?.toLowerCase())) return false;
                
                const arrivalDate = parseISO(booking.arrival_date);
                const departureDate = booking.departure_date 
                    ? parseISO(booking.departure_date) 
                    : addDays(arrivalDate, booking.total_nights);

                if (monthEnabled) {
                    const monthStart = new Date(selectedYear, selectedMonth - 1, 1);
                    const monthEnd = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);
                    
                    return arrivalDate <= monthEnd && departureDate > monthStart;
                } else {
                    const yearStart = new Date(selectedYear, 0, 1);
                    const yearEnd = new Date(selectedYear, 11, 31, 23, 59, 59);
                    
                    return arrivalDate <= yearEnd && departureDate > yearStart;
                }
            } catch (error) {
                console.error("Date parsing error in blockedPeriodBookings:", error, booking);
                return false;
            }
        });
    }, [filteredBookings, selectedMonth, selectedYear, monthEnabled]);

    // Calculate nights that actually fall within the selected period
    const totalNights = confirmedPeriodBookings.reduce((sum, booking) => {
        try {
            if (!booking.arrival_date) return sum;
            
            const arrivalDate = parseISO(booking.arrival_date);
            const departureDate = booking.departure_date 
                ? parseISO(booking.departure_date) 
                : addDays(arrivalDate, booking.total_nights);

            let periodStart, periodEnd;
            if (monthEnabled) {
                periodStart = new Date(selectedYear, selectedMonth - 1, 1);
                periodEnd = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);
            } else {
                periodStart = new Date(selectedYear, 0, 1);
                periodEnd = new Date(selectedYear, 11, 31, 23, 59, 59);
            }

            // Calculate overlap between booking and period
            const overlapStart = arrivalDate > periodStart ? arrivalDate : periodStart;
            const overlapEnd = departureDate < periodEnd ? departureDate : periodEnd;
            
            if (overlapStart < overlapEnd) {
                const nightsInPeriod = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24));
                return sum + Math.max(0, nightsInPeriod);
            }
            
            return sum;
        } catch (error) {
            console.error("Error calculating nights in period:", error, booking);
            return sum;
        }
    }, 0);

    const totalRevenue = confirmedPeriodBookings.reduce((sum, b) => sum + Number(b.price), 0);

    // Calculate days in period for occupancy rate
    const daysInPeriod = useMemo(() => {
        if (monthEnabled) {
            // Calculate days in the selected month
            const selectedMonthStart = new Date(selectedYear, selectedMonth - 1, 1);
            const selectedMonthEnd = new Date(selectedYear, selectedMonth, 0);
            return selectedMonthEnd.getDate(); // This gives the number of days in the selected month
        } else {
            // Calculate days in the selected year
            const isLeapYear = (selectedYear % 4 === 0 && selectedYear % 100 !== 0) || (selectedYear % 400 === 0);
            return isLeapYear ? 366 : 365;
        }
    }, [monthEnabled, selectedMonth, selectedYear]);
    
    // Calculate blocked nights (black and blind bookings) for occupancy calculation
    const blockedNights = blockedPeriodBookings.reduce((sum, booking) => {
        try {
            if (!booking.arrival_date) return sum;
            
            const arrivalDate = parseISO(booking.arrival_date);
            const departureDate = booking.departure_date 
                ? parseISO(booking.departure_date) 
                : addDays(arrivalDate, booking.total_nights);

            let periodStart, periodEnd;
            if (monthEnabled) {
                periodStart = new Date(selectedYear, selectedMonth - 1, 1);
                periodEnd = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);
            } else {
                periodStart = new Date(selectedYear, 0, 1);
                periodEnd = new Date(selectedYear, 11, 31, 23, 59, 59);
            }

            // Calculate overlap between booking and period
            const overlapStart = arrivalDate > periodStart ? arrivalDate : periodStart;
            const overlapEnd = departureDate < periodEnd ? departureDate : periodEnd;
            
            if (overlapStart < overlapEnd) {
                const nightsInPeriod = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24));
                return sum + Math.max(0, nightsInPeriod);
            }
            
            return sum;
        } catch (error) {
            console.error("Error calculating blocked nights in period:", error, booking);
            return sum;
        }
    }, 0);

    const availableNights = Math.max(daysInPeriod - blockedNights, 1); // Ensure at least 1 to avoid division by zero

    const stats = {
        totalNights,
        totalAdults: confirmedPeriodBookings.reduce((sum, b) => sum + b.num_adult, 0),
        totalChildren: confirmedPeriodBookings.reduce((sum, b) => sum + b.num_child, 0),
        totalRevenue,
        totalCommission: confirmedPeriodBookings.reduce((sum, b) => sum + Number(b.commission), 0),

        occupancyRate:
            availableNights > 0
                ? Math.min(totalNights / availableNights, 1) * 100
                : 0,

        averageRate: (() => {
            // Calculate total nights from all bookings (full nights, not just period nights)
            const totalBookingNights = confirmedPeriodBookings.reduce((sum, booking) => {
                return sum + (booking.total_nights || 0);
            }, 0);
            
            return totalBookingNights > 0 ? totalRevenue / totalBookingNights : 0;
        })(),
    };

    const months = [
        "Januar", "Februar", "März", "April", "Mai", "Juni",
        "Juli", "August", "September", "Oktober", "November", "Dezember"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-foreground">
                            {selectedProperty ? selectedProperty.name : "Buchungsübersicht"}
                        </h2>
                        <p className="text-muted-foreground mt-1">
                            {selectedProperty ? "Buchungen für diese Unterkunft" : "Verwalten und verfolgen Sie Ihre Ferienwohnung Reservierungen"}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="month-toggle"
                                checked={monthEnabled}
                                onChange={(e) => setMonthEnabled(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Label htmlFor="month-toggle" className="text-sm">Monat</Label>
                        </div>
                        <select
                            value={String(selectedMonth)}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            disabled={!monthEnabled}
                            className={cn(
                                "px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                                !monthEnabled && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {months.map((month, index) => (
                                <option key={month} value={String(index + 1)}>
                                    {month}
                                </option>
                            ))}
                        </select>
                        <select
                            value={String(selectedYear)}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {years.map((year) => (
                                <option key={year} value={String(year)}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <Card className="lg:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Kalender</CardTitle>
                            <CardDescription>Buchungsübersicht für {months[selectedMonth - 1]} {selectedYear}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SafeCalendar
                                selectedMonth={selectedMonth}
                                selectedYear={selectedYear}
                                bookings={filteredBookings}
                                onMonthChange={(month, year) => {
                                    setSelectedMonth(month);
                                    setSelectedYear(year);
                                }}
                            />
                        </CardContent>
                    </Card>

                    <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Card className="flex justify-center items-center">
                            <CardHeader className="pb-2 text-center">
                                <CardDescription>Gesamtnächte</CardDescription>
                                <CardTitle className="text-5xl ">{stats.totalNights}</CardTitle>
                            </CardHeader>

                        </Card>
                        <Card className="flex justify-center items-center">
                            <CardHeader className="pb-2 text-center">
                                <CardDescription>Gesamtanzahl Erwachsene</CardDescription>
                                <CardTitle className="text-5xl">{stats.totalAdults}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="flex justify-center items-center">
                            <CardHeader className="pb-2 text-center">
                                <CardDescription>Gesamtanzahl Kinder</CardDescription>
                                <CardTitle className="text-5xl">{stats.totalChildren}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="flex justify-center items-center">
                            <CardHeader className="pb-2 text-center">
                                <CardDescription>Belegung</CardDescription>
                                <CardTitle className="text-5xl">{stats.occupancyRate.toFixed(0)}%</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="flex justify-center items-center">
                            <CardHeader className="pb-2 text-center">
                                <CardDescription>Kommission</CardDescription>
                                <CardTitle className="text-5xl">€{stats.totalCommission.toFixed(0)}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="flex justify-center items-center">
                            <CardHeader className="pb-2 text-center">
                                <CardDescription>Durchschnittsrate</CardDescription>
                                <CardTitle className="text-5xl">€{stats.averageRate.toFixed(0)}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Reservierungen</CardTitle>
                        <CardDescription>
                            {monthEnabled ? `${months[selectedMonth - 1]} ` : ""} {selectedYear} • {confirmedPeriodBookings.length} buchung(en)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-8 text-muted-foreground">Buchungen werden geladen...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Gastname</TableHead>
                                            <TableHead>Ankunft</TableHead>
                                            <TableHead>Abreise</TableHead>
                                            <TableHead>Nächte</TableHead>
                                            <TableHead>Anzahl der Erwachsenen</TableHead>
                                            <TableHead>Anzahl der Kinder</TableHead>
                                            <TableHead>Telefon</TableHead>
                                            <TableHead>E-Mail</TableHead>
                                            <TableHead>Check-in</TableHead>
                                            <TableHead>Bemerkungen</TableHead>
                                            <TableHead>Kanal</TableHead>
                                            <TableHead>Rate</TableHead>
                                            <TableHead>Kommission</TableHead>
                                            <TableHead>Gezahlt </TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {confirmedPeriodBookings.map((booking) => (
                                            <TableRow key={booking.id}>
                                                {booking ? (
                                                    <>
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium">
                                                                    {(booking.first_name == null ? "" : booking.first_name) + " " + (booking.last_name == null ? "" : booking.last_name)}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {format(new Date(booking.arrival_date), "dd.MM.yyyy")}
                                                        </TableCell>
                                                        <TableCell>
                                                            {format(new Date(booking.departure_date), "dd.MM.yyyy")}
                                                        </TableCell>
                                                        <TableCell>{booking.total_nights}</TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">
                                                                {booking.num_adult}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">
                                                                {booking.num_child}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">
                                                                {booking.phone == null ? booking.mobile : booking.phone}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">
                                                                {booking.email}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <EditableCell
                                                                value={booking.check_in}
                                                                onSave={(value) => updateBookingMutation.mutate({ id: booking.id, field: "check_in", value })}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="min-w-[150px]">
                                                            <EditableCell
                                                                value={booking.remarks}
                                                                onSave={(value) => updateBookingMutation.mutate({ id: booking.id, field: "remarks", value })}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary">{booking.api_source}</Badge>
                                                        </TableCell>
                                                        <TableCell>€{Number(booking.price).toFixed(2)}</TableCell>
                                                        <TableCell>€{Number(booking.commission).toFixed(2)}</TableCell>
                                                        <TableCell>
                                                            <EditableCell
                                                                value={booking.paid}
                                                                onSave={(value) => updateBookingMutation.mutate({ id: booking.id, field: "paid", value })}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            {booking.status && (
                                                                <Badge variant={getStatusVariant(booking.status)}>
                                                                    {booking.status}
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                    </>
                                                ) : (
                                                    <>
                                                        <TableCell>-</TableCell>
                                                        <TableCell>-</TableCell>
                                                        <TableCell>-</TableCell>
                                                        <TableCell>-</TableCell>
                                                        <TableCell>-</TableCell>
                                                        <TableCell>-</TableCell>
                                                        <TableCell>-</TableCell>
                                                        <TableCell>-</TableCell>
                                                        <TableCell>-</TableCell>
                                                        <TableCell>-</TableCell>
                                                        <TableCell>-</TableCell>
                                                    </>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default () => (
    <DashboardErrorBoundary>
        <Dashboard />
    </DashboardErrorBoundary>
);