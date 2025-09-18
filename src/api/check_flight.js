import axios from 'axios';
import Fetcher from '../lib/Fetcher.js';

export const SUPABASE_URL = 'https://idnlcfdmgkviseokogdv.supabase.co';
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkbmxjZmRtZ2t2aXNlb2tvZ2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5MTcxOTAsImV4cCI6MjA1OTQ5MzE5MH0._-FYJ6W-JnJj993AcpCdi_nzB4Q37lGVqeLHt5UX5i0'

export const checkFlight = async ({ data, user, _place }) => {
    let response = {
        fetch: null,
        error: null
    };
    
    try {
        const body = {
            _routing: data?._routing,
            _hora: data?._hora,
            _asiento: data?._asiento,
            _user_name: user?.name,
            _user_code: user?.code,
            _place_id: _place
        };

        const fetch = await axios.post(
            `${SUPABASE_URL}/rest/v1/rpc/process_vuelo_registration`,
            body,
            {
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );
        response.fetch = fetch.data;
        console.log("🚀 ~ checkFlight ~ fetch.data:", fetch.data)
    } catch (error) {
        console.log("🚀 ~ checkFlight ~ error:", error)
        response.error = true
    } finally {
        return response;
    }
}


