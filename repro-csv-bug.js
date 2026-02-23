
const testCSV = `Handle,Title,Body (HTML)\nproduct-1,Product 1,"<p>\nThis is a multiline\nHTML field\n</p>"\nproduct-2,Product 2,Simple body`;

function faultyParse(csvText) {
    const lines = csvText.split(/\r?\n/).filter(l => l.trim());
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, i) => {
            obj[header] = values[i];
            return obj;
        }, {});
    });
}

console.log("--- Input CSV ---");
console.log(testCSV);

const result = faultyParse(testCSV);

console.log("\n--- Parsed Result (Faulty) ---");
console.log(JSON.stringify(result, null, 2));

console.log("\n--- WHY IT FAILS ---");
console.log("1. The multiline HTML field caused the parser to see 5 lines instead of 3.");
console.log("2. Rows 2, 3, and 4 are garbage with misaligned columns.");
console.log("3. When serializing thousands of such broken rows, the JSON string can end abruptly due to a body size limit (e.g., 10MB).");
