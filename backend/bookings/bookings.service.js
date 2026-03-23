import { beds24GetBookings } from '../beds24Client.js';
import { supabaseAdmin } from '../supabaseClient.js';

export async function getUserPermissions(email) {
    try {
        // 1) Fetch user by email
        const { data: users, error: userErr } = await supabaseAdmin
            .from("users")
            .select("id, role")
            .eq("email", email);

        if (userErr) throw userErr;

        if (!users || users.length === 0) {
            return { role: "guest", allowed: [] };
        }

        const user = users[0];

        // 2) Fetch allowed properties for this user
        const { data: accessRows, error: accessErr } = await supabaseAdmin
            .from("user_property_access")
            .select("property_id")
            .eq("user_id", user.id);

        if (accessErr) throw accessErr;

        return {
            role: user.role,
            allowed: accessRows?.map(r => r.property_id) || []
        };

    } catch (err) {
        console.error("Supabase get user permission error:", err);
        return { role: "guest", allowed: [] };
    }
}

export async function updateBookingData(id, field, value) {
    try {
        const { error } = await supabaseAdmin
            .from("cached_bookings")
            .update({ [field]: value })
            .eq("id", id);

        if (error) throw error;
    } catch (err) {
        console.error("Supabase update error:", err);
        throw err;
    }
}

/**
 * Fetch cached bookings filtered for a user (by email exact or name partial).
 * Returns full row columns (not just data JSONB) so frontend receives "whole columns".
 */
export async function fetchFilteredBookings({ userEmail, month, year }) {
    try {
        console.log(`[BOOKINGS] Fetching bookings for user: ${userEmail}, month: ${month}, year: ${year}`);
        
        // --- 1) Get permissions ---
        const { role, allowed } = await getUserPermissions(userEmail);
        console.log(`[BOOKINGS] User permissions - Role: ${role}, Allowed properties: [${allowed.join(', ')}]`);

        if (role !== "guest" && role !== "admin") {
            console.log(`[BOOKINGS] Invalid role: ${role}, returning empty array`);
            return [];
        }

        // --- 2) Build base query ---
        let query = supabaseAdmin
            .from("cached_bookings")
            .select(`
        id,
        property_id,
        properties(name),
        api_source,
        channel,
        status,
        arrival_date,
        departure_date,
        total_nights,
        num_adult,
        num_child,
        first_name,
        last_name,
        email,
        phone,
        mobile,
        price,
        commission,
        remarks,
        check_in,
        paid,
        data
      `, { foreignTable: "properties" });

        // --- 3) Property restrictions ---
        if (role === "guest") {
            if (!allowed || allowed.length === 0) {
                console.log(`[BOOKINGS] Guest user has no allowed properties, returning empty array`);
                return [];
            }
            console.log(`[BOOKINGS] Filtering bookings for guest user, allowed properties: [${allowed.join(', ')}]`);
            query = query.in("property_id", allowed);
        } else {
            console.log(`[BOOKINGS] Admin user - no property restrictions`);
        }

        // --- 4) Month/year filters ---
        if (month && year) {
            console.log(`[BOOKINGS] Applying month/year filter: ${month}/${year}`);
            query = query
                .filter("date_part('month', arrival_date)", "eq", parseInt(month, 10))
                .filter("date_part('year', arrival_date)", "eq", parseInt(year, 10));
        } else {
            console.log(`[BOOKINGS] No month/year filter applied - fetching all bookings`);
        }

        // --- 5) Order ---
        query = query.order("arrival_date", { ascending: true });

        // --- 6) Execute ---
        const { data, error } = await query;

        if (error) {
            console.error(`[BOOKINGS] Query error:`, error);
            throw error;
        }

        console.log(`[BOOKINGS] Query successful - returned ${data?.length || 0} bookings`);
        
        // Log first few bookings for debugging
        if (data && data.length > 0) {
            console.log(`[BOOKINGS] Sample bookings:`, data.slice(0, 3).map(b => ({
                id: b.id,
                property_id: b.property_id,
                property_name: b.properties?.name,
                guest: `${b.first_name} ${b.last_name}`,
                arrival: b.arrival_date
            })));
        }

        return data || [];

    } catch (err) {
        console.error("[BOOKINGS] Fetch from Supabase error:", err);
        return [];
    }
}

/**
 * Run a sync job: fetch bookings from Beds24 for a sliding window and upsert into cached_bookings.
 * - By default uses BEDS24_SYNC_WINDOW_DAYS (default 7)
 * - If forceFull OR FULL_RESYNC=true, fetch past 365 days (use cautiously).
 * The function stores full booking JSON in data and also extracts many columns for fast queries.
 */
export async function runSyncJob({ forceFull = false } = {}) {
    const apiData = await beds24GetBookings();

    if (!apiData || !apiData.data) {
        console.log("No booking records fetched!");
        return;
    }

    const newBookings = apiData.data;

    try {
        // ---------------------------------------------------------
        // 1. Prepare batch UPSERT payload
        // ---------------------------------------------------------
        const upsertPayload = newBookings.map(b => {
            const arrival_date = b.arrival ?? null;
            const departure_date = b.departure ?? null;

            const total_nights =
                arrival_date && departure_date
                    ? (new Date(departure_date) - new Date(arrival_date)) / (1000 * 60 * 60 * 24)
                    : null;

            return {
                id: b.id,
                property_id: b.propertyId ?? null,
                api_source: b.apiSource ?? null,
                channel: b.channel ?? null,
                status: b.status ?? null,

                arrival_date,
                departure_date,
                total_nights,

                num_adult: b.numAdult ?? null,
                num_child: b.numChild ?? null,

                first_name: b.firstName ?? null,
                last_name: b.lastName ?? null,

                email: b.email ?? null,
                phone: b.phone ?? null,
                mobile: b.mobile ?? null,

                price: b.price ?? null,
                commission: b.commission ?? null,

                booking_time: b.bookingTime ?? null,
                modified_time: b.modifiedTime ?? null,

                data: b,
                updated_at: new Date().toISOString()
            };
        });

        // ---------------------------------------------------------
        // 2. Get list of existing booking IDs in Supabase
        // ---------------------------------------------------------
        const { data: existingRows, error: fetchErr } = await supabaseAdmin
            .from("cached_bookings")
            .select("id");

        if (fetchErr) {
            console.error("Error fetching existing booking IDs:", fetchErr);
            return;
        }

        const incomingIds = newBookings.map(b => b.id);
        const existingIds = existingRows.map(r => r.id);

        // ---------------------------------------------------------
        // 3. Determine which IDs must be deleted
        // ---------------------------------------------------------
        const idsToDelete = existingIds.filter(id => !incomingIds.includes(id));

        if (idsToDelete.length > 0) {
            const { error: delErr } = await supabaseAdmin
                .from("cached_bookings")
                .delete()
                .in("id", idsToDelete);

            if (delErr) {
                console.error("Delete error:", delErr);
            }
        }

        // ---------------------------------------------------------
        // 4. Perform batch UPSERT
        // ---------------------------------------------------------
        const { error: upsertErr } = await supabaseAdmin
            .from("cached_bookings")
            .upsert(upsertPayload, {
                onConflict: "id"
            });

        if (upsertErr) {
            console.error("Batch UPSERT error:", upsertErr);
        }

        console.log(
            `Bookings sync complete: ${upsertPayload.length} upserted, ${idsToDelete.length} deleted.`
        );

    } catch (err) {
        console.error("runSyncJob error:", err);
    }
}
