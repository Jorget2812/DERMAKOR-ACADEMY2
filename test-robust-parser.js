
// Standalone test for the robust parser logic implemented in product-actions.ts

// Mock function to test the parser logic locally if needed, 
// but we will use node to test a standalone version of the parser logic.

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

const complexCSV = `Handle,Title,Body (HTML)
"test-1","Product 1","<p>Line 1
Line 2 with ""quotes""
Line 3</p>"
"test-2","Product 2","Simple"`;

console.log("Testing Robust Parser...");
const result = robustParse(complexCSV);

console.log(JSON.stringify(result, null, 2));

const p1Body = result[0]['Body (HTML)'];
if (p1Body.includes('\n') && p1Body.includes('"quotes"')) {
    console.log("✅ SUCCESS: Multiline and escaped quotes parsed correctly.");
} else {
    console.log("❌ FAILURE: Parser mismanaged complex fields.");
    process.exit(1);
}
