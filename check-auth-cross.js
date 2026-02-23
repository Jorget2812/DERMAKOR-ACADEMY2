const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllUsers() {
    console.log('Fetching all users from auth.users...');
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error.message);
        return;
    }

    console.log(`Found ${users.length} users in auth.`);

    const usersSummary = users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.user_metadata?.full_name || u.user_metadata?.name || 'N/A',
        last_sign_in: u.last_sign_in_at
    }));

    console.table(usersSummary);

    // Check profiles for these users
    const { data: profiles } = await supabase.from('profiles').select('*');
    const profileIds = new Set(profiles.map(p => p.id));

    console.log('\nCross-referencing with profiles:');
    usersSummary.forEach(u => {
        const hasProfile = profileIds.has(u.id);
        console.log(`User ${u.email}: Profile ${hasProfile ? 'EXISTS' : 'MISSING'}`);
    });
}

checkAllUsers();
