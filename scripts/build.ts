import {execSync} from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const binFileName = 'plantuml-mit-1.2025.0.jar';

const sourceFile = path.join('bin', binFileName);
const destDir = path.join('dist', 'bin');
const destFile = path.join(destDir, binFileName);

function copyFileSync(source: string, destination: string) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, {recursive: true});
  }
  fs.copyFileSync(source, destination);
  console.log(`Moving binary file to: ${destination}`);
}

function runTsc() {
  console.log('Compiling TypeScript');
  execSync('tsc', {stdio: 'inherit'});
  console.log('TypeScript compiled.');
}

function main() {
  try {
    copyFileSync(sourceFile, destFile);
    runTsc();
  } catch (error) {
    console.error('Error in compiling:', error);
    process.exit(1);
  }
}

main();
