
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
    "prod-1,Product 1,SKU-1,10.00,5\n" +
    "prod-1,Product 1,,,";

console.log("--- Rows Parsed ---");
const rows = robustParse(csv);
console.log(JSON.stringify(rows, null, 2));

console.log("\n--- Grouping Logic Simulation ---");
const groupedProducts = {}
for (const row of rows) {
    const handle = row['Handle']
    if (!handle) continue
    if (!groupedProducts[handle]) groupedProducts[handle] = []
    groupedProducts[handle].push(row)
}
console.log(JSON.stringify(groupedProducts, null, 2));

console.log("\n--- Variant Loop Simulation ---");
for (const handle in groupedProducts) {
    const variantRows = groupedProducts[handle]
    console.log("Processing handle: " + handle + ", rows: " + variantRows.length)
    for (const vRow of variantRows) {
        const sku = vRow['Variant SKU'] || vRow['sku']
        console.log("Checking SKU: [" + sku + "]")
        if (!sku) {
            console.log("Skipping row: No SKU")
            continue
        }
        console.log("Would create variant for SKU: " + sku)
    }
}
