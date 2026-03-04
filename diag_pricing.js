
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function diagnose() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('--- 1) Pricing Rules ---');
    const { data: rules, error: rulesError } = await supabase
        .from('pricing_rules')
        .select('*')
        .order('created_at', { ascending: false });

    if (rulesError) {
        console.error('Error fetching pricing_rules:', rulesError);
        // Try to see if there are other tables
        const { data: tables, error: tablesError } = await supabase
            .rpc('get_tables'); // Custom RPC or common way
        console.log('Available tables (partial check):', tables);
    } else {
        console.log('Pricing Rules Found:', rules.length);
        console.table(rules);
    }

    console.log('\n--- 5) RLS Policies ---');
    const { data: policies, error: policiesError } = await supabase
        .rpc('get_policies_for_table', { table_name: 'pricing_rules' }); // Using a common helper or direct SQL if allowed via RPC

    if (policiesError) {
        // Fallback to direct SQL query via a generic RPC if available
        const { data: sqlPolicies, error: sqlError } = await supabase.rpc('exec_sql', {
            sql_query: "SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'pricing_rules';"
        });
        if (sqlError) {
            console.error('Error fetching policies:', sqlError);
        } else {
            console.log('RLS Policies for pricing_rules:');
            console.table(sqlPolicies);
        }
    } else {
        console.table(policies);
    }
}

diagnose();
