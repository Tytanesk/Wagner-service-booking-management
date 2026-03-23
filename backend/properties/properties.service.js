import { beds24GetProperties, beds24GetBookings, extractPropertiesFromBookings } from '../beds24Client.js';
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

export async function updatePropertyDetail(id, value) {
    try {
        const { error } = await supabaseAdmin
            .from("properties")
            .update({ "detail": value })
            .eq("id", id);

        if (error) throw error;
    } catch (err) {
        console.error("Supabase update error:", err);
        throw err;
    }
}

export async function createProperty(propertyData, userEmail) {
    try {
        // Generate a local ID that won't conflict with Beds24 IDs
        // Use high numbers (900000+) to avoid conflicts with Beds24 IDs
        const localId = 900000 + Math.floor(Math.random() * 99999);
        
        const { error } = await supabaseAdmin
            .from("properties")
            .insert([{
                id: localId,
                name: propertyData.name,
                property_type: propertyData.property_type,
                address: propertyData.address,
                city: propertyData.city,
                country: propertyData.country,
                postcode: propertyData.postcode,
                phone: propertyData.phone,
                mobile: propertyData.mobile,
                email: propertyData.email,
                email_lc: propertyData.email ? propertyData.email.toLowerCase() : null,
                contact_first_name: propertyData.contact_first_name,
                contact_last_name: propertyData.contact_last_name,
                data: {}, // Use empty object instead of null to satisfy NOT NULL constraint
                updated_at: new Date().toISOString()
            }]);

        if (error) throw error;
        
        // Grant access to the creating user (if not admin)
        if (userEmail) {
            await grantUserAccessToProperty(userEmail, localId);
        }
        
        console.log(`Local property created with ID: ${localId}`);
        return localId;
    } catch (err) {
        console.error("Supabase create property error:", err);
        throw err;
    }
}

async function grantUserAccessToProperty(userEmail, propertyId) {
    try {
        // Get user ID from email
        const { data: users, error: userErr } = await supabaseAdmin
            .from("users")
            .select("id, role")
            .eq("email", userEmail);

        if (userErr) throw userErr;

        if (!users || users.length === 0) {
            console.log(`User ${userEmail} not found, skipping access grant`);
            return;
        }

        const user = users[0];
        
        // Admin users have access to all properties, no need to grant explicit access
        if (user.role === 'admin') {
            console.log(`User ${userEmail} is admin, no explicit access needed`);
            return;
        }

        // Grant access to the property
        const { error: accessErr } = await supabaseAdmin
            .from("user_property_access")
            .insert([{
                user_id: user.id,
                property_id: propertyId
            }]);

        if (accessErr) {
            // Ignore duplicate key errors (user already has access)
            if (accessErr.code !== '23505') {
                throw accessErr;
            }
        }

        console.log(`Granted access to property ${propertyId} for user ${userEmail}`);
    } catch (err) {
        console.error("Error granting user access to property:", err);
        // Don't throw - property creation should succeed even if access grant fails
    }
}

/**
 * Fetch properties where property.email matches the user's email (case-insensitive)
 * Returns full columns including data JSONB
 */
export async function fetchPropertiesForUser({ userEmail }) {
    if (!userEmail) return [];

    try {
        // --- 1) Permissions ---
        const { role, allowed } = await getUserPermissions(userEmail);

        if (role !== "guest" && role !== "admin") return [];

        // --- 2) Start building query ---
        let query = supabaseAdmin
            .from("properties")
            .select("id, name, property_type, address, city, country, mobile, postcode, detail")
            .order("name", { ascending: true });

        // --- 3) Restrict properties for guests ---
        if (role === "guest") {
            if (!allowed || allowed.length === 0) return [];
            query = query.in("id", allowed);
        }

        // --- 4) Execute ---
        const { data, error } = await query;
        if (error) throw error;

        return data || [];

    } catch (err) {
        console.error("Supabase get properties for user error:", err);
        return [];
    }
}

/**
 * Delete a property and all related records (cascading delete)
 * Only allows deletion of local properties (ID >= 900000)
 */
export async function deleteProperty(propertyId, userEmail) {
    try {
        // Verify this is a local property (ID >= 900000)
        if (propertyId < 900000) {
            throw new Error('Cannot delete Beds24 properties. Only local properties can be deleted.');
        }

        // Check if user has permission to delete this property
        const { role, allowed } = await getUserPermissions(userEmail);
        
        if (role !== 'admin' && !allowed.includes(propertyId)) {
            throw new Error('You do not have permission to delete this property');
        }

        console.log(`Deleting local property ${propertyId} and related records...`);
        
        // Delete related records first to avoid foreign key constraints
        
        // 1. Delete user access records
        const { error: accessErr } = await supabaseAdmin
            .from("user_property_access")
            .delete()
            .eq("property_id", propertyId);
        
        if (accessErr) {
            console.error(`Error deleting access records for property ${propertyId}:`, accessErr);
            throw accessErr;
        }

        // 2. Delete cached bookings
        const { error: bookingsErr } = await supabaseAdmin
            .from("cached_bookings")
            .delete()
            .eq("property_id", propertyId);
        
        if (bookingsErr) {
            console.error(`Error deleting bookings for property ${propertyId}:`, bookingsErr);
            throw bookingsErr;
        }

        // 3. Finally delete the property itself
        const { error: propErr } = await supabaseAdmin
            .from("properties")
            .delete()
            .eq("id", propertyId)
            .gte('id', 900000); // Only delete local properties (ID >= 900000)

        if (propErr) {
            console.error(`Error deleting property ${propertyId}:`, propErr);
            throw propErr;
        }

        console.log(`Successfully deleted local property ${propertyId} and all related records`);
        return { success: true, message: 'Property deleted successfully' };

    } catch (err) {
        console.error(`Delete property error for ${propertyId}:`, err);
        throw err;
    }
}

/**
 * Run properties sync: fetch all properties and upsert into properties table.
 * By default fetches all properties (Beds24 typically returns all). Use caution.
 */
export async function runPropertiesSyncJob({ forceFull = false } = {}) {
    let apiData = await beds24GetProperties();
    
    // If properties API fails, try to extract from bookings
    if (!apiData || !apiData.data || apiData.data.length === 0) {
        console.log('Properties API failed, trying to extract from bookings...');
        apiData = await extractPropertiesFromBookings();
    }
    
    // If still no data, preserve existing properties
    if (!apiData || !apiData.data || apiData.data.length === 0) {
        console.log('No properties available from any source - preserving existing properties');
        return;
    }

    const newRecords = apiData.data;

    try {
        // Only proceed with sync if we have actual data from Beds24
        console.log(`Syncing ${newRecords.length} properties from Beds24`);
        
        // ---------------------------------------------------------
        // 1. Prepare batch UPSERT payload
        // ---------------------------------------------------------
        const upsertPayload = newRecords.map(p => ({
            id: p.id,
            name: p.name || null,
            property_type: p.propertyType || null,
            address: p.address || null,
            city: p.city || null,
            country: p.country || null,
            postcode: p.postcode || null,
            phone: p.phone || null,
            mobile: p.mobile || null,
            fax: p.fax || null,
            email: p.email || null,
            email_lc: p.email ? String(p.email).toLowerCase() : null,
            web: p.web || null,
            contact_first_name: p.contactFirstName || null,
            contact_last_name: p.contactLastName || null,
            checkin_start: p.checkInStart || null,
            checkin_end: p.checkInEnd || null,
            checkout_end: p.checkOutEnd || null,
            offer_type: p.offerType || null,
            sell_priority: p.sellPriority ?? null,
            control_priority: p.controlPriority ?? null,
            room_charge_display: p.roomChargeDisplay || null,
            data: p,
            updated_at: new Date().toISOString(),
        }));

        // ---------------------------------------------------------
        // 2. Get list of existing Beds24 properties (don't touch local ones)
        // ---------------------------------------------------------
        const { data: existingRows, error: fetchErr } = await supabaseAdmin
            .from("properties")
            .select("id, data")
            .gte('id', 1)
            .lt('id', 900000); // Only Beds24 properties (ID < 900000)

        if (fetchErr) {
            console.error("Error fetching existing properties:", fetchErr);
            return;
        }

        const incomingIds = newRecords.map(p => p.id);
        const existingBeds24Ids = existingRows.map(r => r.id);

        // ---------------------------------------------------------
        // 3. Only delete Beds24 properties that are no longer in API
        // ---------------------------------------------------------
        const idsToDelete = existingBeds24Ids.filter(id => !incomingIds.includes(id));

        if (idsToDelete.length > 0) {
            // First delete related records to avoid foreign key constraints
            for (const propertyId of idsToDelete) {
                try {
                    // Delete user access records
                    await supabaseAdmin
                        .from("user_property_access")
                        .delete()
                        .eq("property_id", propertyId);

                    // Delete cached bookings
                    await supabaseAdmin
                        .from("cached_bookings")
                        .delete()
                        .eq("property_id", propertyId);

                    // Now delete the property
                    await supabaseAdmin
                        .from("properties")
                        .delete()
                        .eq("id", propertyId)
                        .lt('id', 900000); // Only delete Beds24 properties (ID < 900000)

                } catch (delErr) {
                    console.error(`Delete error for property ${propertyId}:`, delErr);
                }
            }
        }

        // ---------------------------------------------------------
        // 4. Batch UPSERT Beds24 properties
        // ---------------------------------------------------------
        const { error: upsertErr } = await supabaseAdmin
            .from("properties")
            .upsert(upsertPayload, {
                onConflict: "id"
            });

        if (upsertErr) {
            console.error("Batch UPSERT error:", upsertErr);
        }

        console.log(`Properties sync complete: ${upsertPayload.length} upserted, ${idsToDelete.length} deleted.`);

    } catch (err) {
        console.error("runPropertiesSyncJob fatal error:", err);
    }
}