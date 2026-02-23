
function robustParse(text) {
    const rows = []
    let currentField = ''
    let inQuotes = false
    let currentRow = []
    const normalized = text.replace(/\r\n/g, '\n')

    for (let i = 0; i < normalized.length; i++) {
        const char = normalized[i]
        const nextChar = normalized[i + 1]

        if (char === '"' && inQuotes && nextChar === '"') {
            currentField += '"'
            i++
        } else if (char === '"') {
            inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentField.trim())
            currentField = ''
        } else if (char === '\n' && !inQuotes) {
            currentRow.push(currentField.trim())
            rows.push(currentRow)
            currentRow = []
            currentField = ''
        } else {
            currentField += char
        }
    }
    if (currentRow.length > 0 || currentField) {
        currentRow.push(currentField.trim())
        rows.push(currentRow)
    }
    const headers = rows[0]
    return rows.slice(1).map(row => headers.reduce((obj, h, i) => ({ ...obj, [h]: row[i] }), {}));
}

const csv = "Handle,Title,Variant SKU,Variant Price,Variant Inventory Qty\n" +
    "prod-1,Product 1,SKU-1,10.00,5";

const rows = robustParse(csv);
const row = rows[0];

console.log("Keys found in row:", Object.keys(row));
const skuKey = 'Variant SKU';
console.log("Value for '" + skuKey + "': [" + row[skuKey] + "]");

const fallbackSku = row['variant_sku'] || row['SKU'] || row['sku'];
console.log("Value for fallbacks: [" + fallbackSku + "]");
