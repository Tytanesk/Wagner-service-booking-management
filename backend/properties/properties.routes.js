import express from 'express';
import { getProperties, updateProperty, triggerPropertiesSync, createPropertyHandler, deletePropertyHandler } from './properties.controller.js';
import { supabaseAuthMiddleware, adminOnly } from '../util/middleware.js';


const router = express.Router();


// returns properties visible to the authenticated user (Option C: email match)
router.get('/', supabaseAuthMiddleware, getProperties);

router.post('/update', supabaseAuthMiddleware, updateProperty);

// create new local property
router.post('/create', supabaseAuthMiddleware, createPropertyHandler);

// delete local property (only local properties with ID >= 900000)
router.delete('/:id', supabaseAuthMiddleware, deletePropertyHandler);

// admin endpoint to trigger immediate properties sync
router.post('/sync', supabaseAuthMiddleware, adminOnly, triggerPropertiesSync);


export default router;