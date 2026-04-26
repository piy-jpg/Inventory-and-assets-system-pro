// Debug mockData structure
const fs = require('fs');
const path = require('path');

console.log('Debugging mockData structure...');

// Read the file directly to check for syntax errors
const filePath = path.join(__dirname, '../frontend/src/data/mockData.js');
const fileContent = fs.readFileSync(filePath, 'utf8');

console.log('\n1. File exists and readable:', !!fileContent);
console.log('- File size:', fileContent.length, 'characters');

// Try to evaluate the file
try {
  // Remove the export statements to test the object structure
  const testContent = fileContent
    .replace(/export const.*?;/g, '')
    .replace(/export default mockData;/g, '')
    .replace(/\/\/.*$/gm, '');
  
  eval(testContent);
  
  console.log('\n2. mockData object evaluation:');
  console.log('- mockData exists:', typeof mockData !== 'undefined');
  console.log('- mockData type:', typeof mockData);
  
  if (mockData) {
    console.log('- mockData keys:', Object.keys(mockData));
    console.log('- mockData.sales exists:', 'sales' in mockData);
    console.log('- mockData.sales type:', typeof mockData.sales);
    console.log('- mockData.sales length:', mockData.sales?.length || 'undefined');
    
    if (mockData.sales && mockData.sales.length > 0) {
      console.log('- First sale ID:', mockData.sales[0]?._id);
      console.log('- Last sale ID:', mockData.sales[mockData.sales.length - 1]?._id);
    }
  }
} catch (error) {
  console.log('\nERROR evaluating mockData:', error.message);
  console.log('Error details:', error);
}

// Try importing the ES6 module way
console.log('\n3. Testing ES6 import simulation...');
try {
  // Create a temporary CommonJS version
  const tempContent = `
const mockData = ${fileContent.split('const mockData = {')[1].split('export default mockData;')[0]};
module.exports = { mockData };
`;
  
  const tempPath = path.join(__dirname, 'temp_mockdata.js');
  fs.writeFileSync(tempPath, tempContent);
  
  const tempModule = require('./temp_mockdata.js');
  console.log('- tempModule.mockData exists:', !!tempModule.mockData);
  console.log('- tempModule.mockData.sales exists:', !!tempModule.mockData?.sales);
  console.log('- tempModule.mockData.sales length:', tempModule.mockData?.sales?.length || 0);
  
  // Clean up
  fs.unlinkSync(tempPath);
} catch (error) {
  console.log('ERROR with ES6 import simulation:', error.message);
}
