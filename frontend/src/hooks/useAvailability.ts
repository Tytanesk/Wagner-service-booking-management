import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import axios from "axios";

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export interface AvailabilityData {
    property_id: number;
    date: string;
    inventory: number; // 1 = available, 0 = not available
    min_stay?: number;
    max_stay?: number;
    rate?: number;
}

export const useAvailability = (propertyId?: number, startDate?: string, endDate?: string) => {
    return useQuery({
        queryKey: ["availability", propertyId, startDate, endDate],
        queryFn: async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                const accessToken = session?.access_token;
                
                // Build query parameters
                const params = new URLSearchParams();
                if (propertyId) params.append('property_id', propertyId.toString());
                if (startDate) params.append('start_date', startDate);
                if (endDate) params.append('end_date', endDate);
                
                const url = `${VITE_BACKEND_URL}/availability${params.toString() ? '?' + params.toString() : ''}`;
                    
                const res = await axios.get(url, { 
                    headers: { 'Authorization': `Bearer ${accessToken}` } 
                });
                
                return res.data.data as AvailabilityData[];
            } catch (err) {
                console.error("Availability API error:", err);
                // Return empty array if availability API doesn't exist
                return [] as AvailabilityData[];
            }
        },
        enabled: true, // Always try to fetch
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 1, // Retry once if it fails
    });
};