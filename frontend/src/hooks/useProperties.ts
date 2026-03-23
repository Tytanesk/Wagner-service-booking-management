import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import axios from "axios"

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export interface Property {
    id: number;
    name: string;
    property_type: string;
    address: string | null;
    city: string | null;
    country: string | null;
    mobile: string | null;
    postcode: string | null;
    detail: string | null;
}

export const useProperties = () => {
    return useQuery({
        queryKey: ["properties"],
        queryFn: async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                const accessToken = session?.access_token;
                const res = await axios.get(`${VITE_BACKEND_URL}/properties`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
                return res.data.data as Property[];
            } catch (err) {
                console.error(err);
                return [] as Property[];
            }
        },
        // staleTime: 5 * 60 * 1000,
    });
};

export const useUpdatePropertyDetail = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, value }: { id: number; value: string }) => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                const accessToken = session?.access_token;
                const res = await axios.post(
                    `${VITE_BACKEND_URL}/properties/update`,
                    { id, value },   // request body
                    {
                        params: { id, value },  // optional if backend needs query params
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }
                );
                // const res = await axios.post(`${VITE_BACKEND_URL}/bookings/update`, { params: { id, field, value }, headers: { 'Authorization': `Bearer ${accessToken}` } });
                if (res.data.success == false) throw new Error(res.data.error);
            } catch (err) {
                console.error(err);
                throw err;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["properties"] });
            toast.success("Details gespeichert");
        },
        onError: () => {
            toast.error("Fehler beim Speichern der Details");
        },
    });
};

export interface CreatePropertyData {
    name: string;
    property_type: string;
    address?: string;
    city?: string;
    country?: string;
    postcode?: string;
    phone?: string;
    mobile?: string;
    email?: string;
    contact_first_name?: string;
    contact_last_name?: string;
}

export const useCreateProperty = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (propertyData: CreatePropertyData) => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                const accessToken = session?.access_token;
                const res = await axios.post(
                    `${VITE_BACKEND_URL}/properties/create`,
                    propertyData,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }
                );
                if (res.data.success == false) throw new Error(res.data.error);
                return res.data;
            } catch (err) {
                console.error(err);
                throw err;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["properties"] });
            toast.success("Unterkunft erfolgreich erstellt");
        },
        onError: () => {
            toast.error("Fehler beim Erstellen der Unterkunft");
        },
    });
};

export const useDeleteProperty = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (propertyId: number) => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                const accessToken = session?.access_token;
                const res = await axios.delete(
                    `${VITE_BACKEND_URL}/properties/${propertyId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }
                );
                if (res.data.success == false) throw new Error(res.data.error);
                return res.data;
            } catch (err) {
                console.error(err);
                throw err;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["properties"] });
            toast.success("Unterkunft erfolgreich gelöscht");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.error || "Fehler beim Löschen der Unterkunft");
        },
    });
};