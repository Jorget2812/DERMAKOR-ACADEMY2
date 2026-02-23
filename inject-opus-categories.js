
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

/**
 * OPUS 4.6 CATEGORY INJECTOR
 * Performs a robust, idempotent insertion of product categories.
 */
async function injectCategories() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Error: Missing Supabase credentials in .env.local');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const categories = [
        { name: 'Gamme HomeCare', slug: 'gamme-homecare' },
        { name: 'Gamme Pfect-A', slug: 'gamme-pfect-a' },
        { name: 'Traitement Spécialisé', slug: 'traitement-specialise' },
        { name: 'MesoBooster Ampoule', slug: 'mesobooster-ampoule' },
        { name: 'Solution HydraFacial', slug: 'solution-hydrafacial' },
        { name: 'Démaquillant - Nettoyant', slug: 'demaquillant-nettoyant' },
        { name: 'Tonique', slug: 'tonique' },
        { name: 'Exfoliant', slug: 'exfoliant' },
        { name: 'Peeling', slug: 'peeling' },
        { name: 'Sérum', slug: 'serum' },
        { name: 'Crème', slug: 'creme' },
        { name: 'Masques', slug: 'masques' },
        { name: 'Accessoire', slug: 'accessoire' }
    ];

    console.log(`🚀 Starting injection of ${categories.length} categories...`);

    const { data, error } = await supabase
        .from('categories')
        .upsert(categories, { onConflict: 'name', ignoreDuplicates: false })
        .select();

    if (error) {
        console.error('❌ Injection failed:', error.message);
        process.exit(1);
    }

    console.log('✅ Injection successful!');
    console.table(data.map(c => ({ ID: c.id, Name: c.name, Slug: c.slug })));
}

injectCategories().catch(err => {
    console.error('💥 Fatal error during category injection:', err);
    process.exit(1);
});
