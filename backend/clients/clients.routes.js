import express from 'express';
import { createClient, listClients } from './clients.controller.js';
import { adminMiddleware } from '../util/middleware.js';


const router = express.Router();


router.get('/', adminMiddleware, listClients);
router.post('/', adminMiddleware, createClient);


export default router;