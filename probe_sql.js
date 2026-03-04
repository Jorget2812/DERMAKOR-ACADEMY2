
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function listFunctions() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Querying pg_proc via a simple select might fail due to RLS if it was a normal table, 
    // but we can try to find RPCs by searching for what's available in the client.
    // Actually, we can use the rest API to see what's exposed.

    const { data, error } = await supabase.from('_rpc').select('*'); // This is a shot in the dark
    if (error) {
        console.log('Error listing via _rpc (expected):', error.message);
    }

    // Best way to see available RPCs is often via the swagger/openapi if we knew the URL,
    // or just trial and error with common names.

    const commonNames = ['exec_sql', 'run_sql', 'query', 'execute_sql', 'sql'];
    for (const name of commonNames) {
        const { error: rpcError } = await supabase.rpc(name, { sql: 'SELECT 1' });
        if (!rpcError || rpcError.code !== 'PGRST202') {
            console.log(`Bingo! Function ${name} might exist. Error:`, rpcError?.message || 'Success');
        }
    }
}

listFunctions();
