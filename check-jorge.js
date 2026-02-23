const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
    console.log('Checking profiles for Jorge Torres...');
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, status, verification_status, level');

    if (error) {
        console.error('Error fetching profiles:', error.message);
        return;
    }

    console.table(profiles);

    const jorge = profiles.find(p => p.full_name?.toUpperCase().includes('JORGE'));
    if (jorge) {
        console.log('JORGE FOUND:', jorge);
    } else {
        console.log('JORGE NOT FOUND IN PROFILES TABLE.');
    }
}

checkProfiles();
