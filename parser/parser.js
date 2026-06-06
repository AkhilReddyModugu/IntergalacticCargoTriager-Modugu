const fs = require('fs');
const path = require('path');

// Returns true if n is a prime number.
// Numbers <= 1 are not prime. 2 is prime.
// For n > 2, check divisibility from 2 up to sqrt(n).
function isPrime(n) {
  if (n <= 1) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

function parseManifest() {
  const manifestPath = path.join(__dirname, '..', 'manifest.txt');
  const raw = fs.readFileSync(manifestPath, 'utf8');
  const lines = raw.trim().split('\n');

  const records = [];
  const discarded = [];

  for (const line of lines) {
    // Format: [DATE] || CARGO_ID :: WEIGHT_IN_KG >> DESTINATION
    const match = line.match(/^\[(.+?)\] \|\| (.+?) :: (\d+(?:\.\d+)?) >> (.+)$/);
    if (!match) {
      console.warn(`Skipping malformed line: ${line}`);
      continue;
    }

    const date = match[1];
    const cargoId = match[2];
    let weightInKg = parseFloat(match[3]);
    const destination = match[4].trim();

    // Rule 1: If destination contains exact substring "Sector-7", multiply weight by 1.45
    if (destination.includes('Sector-7')) {
      weightInKg = weightInKg * 1.45;
    }

    // Rule 2: Round weight, then discard if the rounded value is a prime number
    weightInKg = Math.round(weightInKg);
    if (isPrime(weightInKg)) {
      discarded.push({ cargoId, weightInKg, reason: `weight ${weightInKg} is prime` });
      continue;
    }

    records.push({ date, cargoId, weightInKg, destination });
  }

  return { records, discarded };
}

const { records, discarded } = parseManifest();

const outputPath = path.join(__dirname, '..', 'output', 'Task 1 - Modugu - Parser.json');
fs.writeFileSync(outputPath, JSON.stringify(records, null, 2));

console.log(`\nParsed ${records.length} valid records → ${outputPath}`);
console.log(`\nDiscarded ${discarded.length} record(s):`);
for (const d of discarded) {
  console.log(`  - ${d.cargoId}: ${d.reason}`);
}
