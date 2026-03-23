import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import axios from "axios"

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export interface Booking {
    id: string;
    property_id: number;
    property_name: string;
    api_source: string | null;
    channel: string | null;
    status: string | null;
    arrival_date: string;
    departure_date: string | null;
    total_nights: number | null;
    num_adult: number;
    num_child: number;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    email: string | null;
    mobile: string | null;
    price: number;
    commission: number;
    remarks: string | null;
    check_in: string | null;
    paid: string | null;
    data: JSON;
}

export const useBookings = () => {
    return useQuery({
        queryKey: ["bookings"],
        queryFn: async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                const accessToken = session?.access_token;
                const res = await axios.get(`${VITE_BACKEND_URL}/bookings`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
                return res.data.data as Booking[];
            } catch (err) {
                console.error(err);
                return [] as Booking[];
            }

        },
        // staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useUpdateBooking = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, field, value }: { id: string; field: string; value: string }) => {
            // const { error } = await supabase
            //     .from("bookings")
            //     .update({ [field]: value })
            //     .eq("id", id);
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                const accessToken = session?.access_token;
                const res = await axios.post(
                    `${VITE_BACKEND_URL}/bookings/update`,
                    { id, field, value },   // request body
                    {
                        params: { id, field, value },  // optional if backend needs query params
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }
                );
                // const res = await axios.post(`${VITE_BACKEND_URL}/bookings/update`, { params: { id, field, value }, headers: { 'Authorization': `Bearer ${accessToken}` } });
                if (res.data.success == false) throw new Error(res.data.error);
                return { id, field, value };
            } catch (err) {
                console.error(err);
                throw err;
            }
        },
        onSuccess: ({ id, field, value }) => {
            queryClient.setQueryData<Booking[]>(["bookings"], (old) =>
                old?.map((b) => (b.id === id ? { ...b, [field]: value } : b))
            );
            toast.success("Buchung aktualisiert");
        },
        onError: () => {
            toast.error("Fehler beim Aktualisieren der Buchung");
        },
    });
};