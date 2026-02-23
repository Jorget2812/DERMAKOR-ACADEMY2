
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkProfilesSchema() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    console.log("--- Verificando columnas de la tabla profiles ---");
    const { data, error } = await supabase.from('profiles').select('*').limit(1);

    if (error) {
        console.error("Error al consultar profiles:", error.message);
    } else {
        console.log("Columnas encontradas en profiles:", Object.keys(data[0] || {}));
    }

    console.log("\n--- Verificando si existe la función is_admin ---");
    try {
        const { data: funcExists, error: funcErr } = await supabase.rpc('is_admin');
        if (funcErr) {
            console.log("La función is_admin() no parece existir o falló:", funcErr.message);
        } else {
            console.log("La función is_admin() existe.");
        }
    } catch (e) {
        console.log("Fallo al llamar rpc('is_admin'):", e.message);
    }
}

checkProfilesSchema();
