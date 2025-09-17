/**
 * Script to apply the web patch for @react-native-voice/voice
 */

const fs = require('fs');
const path = require('path');

// Paths
const patchFilePath = path.join(__dirname, '..', 'patches', 'react-native-voice-web.js');
const targetDir = path.join(__dirname, '..', 'node_modules', '@react-native-voice', 'voice', 'lib', 'module');
const targetFilePath = path.join(targetDir, 'index.web.js');

// Ensure the target directory exists
if (!fs.existsSync(targetDir)) {
  console.log(`Creating directory: ${targetDir}`);
  fs.mkdirSync(targetDir, { recursive: true });
}

// Read the patch file
try {
  const patchContent = fs.readFileSync(patchFilePath, 'utf8');
  
  // Write the patch to the target file
  fs.writeFileSync(targetFilePath, patchContent);
  
  console.log(`Successfully applied web patch to: ${targetFilePath}`);
} catch (error) {
  console.error('Error applying patch:', error);
  process.exit(1);
}
