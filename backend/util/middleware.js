
import { da } from 'date-fns/locale';
import { supabaseAdmin } from '../supabaseClient.js';

export async function supabaseAuthMiddleware(req, res, next) {
    try {
        const auth = req.headers.authorization;
        if (!auth) return res.status(401).json({ error: 'missing authorization header' });
        const token = auth.replace('Bearer ', '');
        // use Supabase admin to get user
        const { data, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !data?.user) {
            console.log("Invalid token");
            return res.status(401).json({ error: 'Invalid token' });
        }
        // user info available at data.user
        req.user = data.user;
        next();
    } catch (err) {
        console.log("Invalid token");
        return res.status(401).json({ error: 'Invalid token', details: err.message });
    }
}


export function adminOnly(req, res, next) {
    // Check if user is admin by email or role
    const userEmail = req.user?.email;
    const adminEmails = ['freeburner80@gmail.com', 'info@wagner-service.org'];
    
    if (adminEmails.includes(userEmail) || req.user?.role === 'admin' || process.env.DEBUG_ALLOW_ADMIN === 'true') {
        return next();
    }
    
    return res.status(403).json({ error: 'Forbidden: admin only' });
}