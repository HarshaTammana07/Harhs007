const fs = require('fs');
const path = require('path');

// Read the ApiService file
const filePath = path.join(__dirname, '../src/services/ApiService.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all instances of this.transform with ApiService.transform in static methods
const replacements = [
  { from: /this\.transformFamilyMember/g, to: 'ApiService.transformFamilyMember' },
  { from: /this\.transformBuilding/g, to: 'ApiService.transformBuilding' },
  { from: /this\.transformApartment/g, to: 'ApiService.transformApartment' },
  { from: /this\.transformFlat/g, to: 'ApiService.transformFlat' },
  { from: /this\.transformLand/g, to: 'ApiService.transformLand' },
  { from: /this\.transformTenant/g, to: 'ApiService.transformTenant' },
  { from: /this\.transformRentPayment/g, to: 'ApiService.transformRentPayment' },
  { from: /this\.transformInsurancePolicy/g, to: 'ApiService.transformInsurancePolicy' },
  { from: /this\.transformDocument/g, to: 'ApiService.transformDocument' }
];

let changeCount = 0;
replacements.forEach(({ from, to }) => {
  const matches = content.match(from);
  if (matches) {
    changeCount += matches.length;
    content = content.replace(from, to);
  }
});

// Write the updated content back
fs.writeFileSync(filePath, content, 'utf8');

console.log(`✅ Fixed ${changeCount} transform method calls in ApiService.ts`);
console.log('All static method calls now use ApiService.methodName instead of this.methodName');