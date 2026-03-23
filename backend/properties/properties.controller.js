import { fetchPropertiesForUser, updatePropertyDetail, runPropertiesSyncJob, createProperty, deleteProperty } from './properties.service.js';


export async function getProperties(req, res) {
    try {
        const userEmail = req.query.email || req.user.email || null;
        const props = await fetchPropertiesForUser({ userEmail });
        res.json({ success: true, data: props });
    } catch (err) {
        console.error('getProperties error', err);
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function updateProperty(req, res) {
    try {
        await updatePropertyDetail(req.body.id, req.body.value);
        res.json({ success: true });
    } catch (err) {
        console.error('Update Property Detail error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
}


export async function createPropertyHandler(req, res) {
    try {
        const userEmail = req.user.email;
        await createProperty(req.body, userEmail);
        res.json({ success: true, message: 'Property created successfully' });
    } catch (err) {
        console.error('Create Property error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function deletePropertyHandler(req, res) {
    try {
        const propertyId = parseInt(req.params.id);
        const userEmail = req.user.email;
        
        if (!propertyId || isNaN(propertyId)) {
            return res.status(400).json({ success: false, error: 'Invalid property ID' });
        }
        
        const result = await deleteProperty(propertyId, userEmail);
        res.json({ success: true, message: result.message });
    } catch (err) {
        console.error('Delete Property error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
}


export async function triggerPropertiesSync(req, res) {
    try {
        await runPropertiesSyncJob({ forceFull: req.body?.forceFull === true });
        res.json({ success: true, message: 'Properties sync triggered' });
    } catch (err) {
        console.error('triggerPropertiesSync error', err);
        res.status(500).json({ success: false, error: err.message });
    }
}