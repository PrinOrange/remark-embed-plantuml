import * as fs from 'fs';
import * as https from 'https';
import njre from 'njre';
import * as path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JreDir = path.resolve(__dirname, '../dist/jre');

const binFilename = 'plantuml.jar';
const binFileDir = path.resolve(__dirname, '../dist/bin');
const binFilePath = path.resolve(binFileDir, binFilename);

const plantUmlDownloadUrl =
  'https://github.com/plantuml/plantuml/releases/download/v1.2025.0/plantuml-mit-1.2025.0.jar';

async function cleanJreDirectory() {
  if (!fs.existsSync(JreDir)) return;
  console.log('Cleaning JRE directory...');

  try {
    await fs.promises.rm(JreDir, {recursive: true, force: true});
  } catch (err) {
    console.warn('Direct removal failed, trying rename method...');
    const tempDir = JreDir + '_old_' + Date.now();
    fs.renameSync(JreDir, tempDir);
    await fs.promises.rm(tempDir, {recursive: true, force: true});
  }
}

async function cleanJBinFileDirectory() {
  if (!fs.existsSync(binFilePath)) return;
  console.log('Cleaning PlantUML Binary File directory...');

  try {
    await fs.promises.rm(JreDir, {recursive: true, force: true});
  } catch (err) {
    console.warn('Direct removal failed, trying rename method...');
    const tempDir = JreDir + '_old_' + Date.now();
    fs.renameSync(JreDir, tempDir);
    await fs.promises.rm(tempDir, {recursive: true, force: true});
  }
}

async function downloadPlantUMLBinFile() {
  console.log('Downloading PlantUML...');
  fs.mkdirSync(binFileDir, {recursive: true});
  return new Promise<void>((resolve, reject) => {
    const fileStream = fs.createWriteStream(binFilePath);
    https
      .get(plantUmlDownloadUrl, (response) => {
        if (response.statusCode == null || response.statusCode >= 400) {
          reject(new Error(`Failed to download file: ${response.statusCode}`));
          return;
        }
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`Downloaded PlantUML: ${binFilePath}`);
          resolve();
        });
      })
      .on('error', (err) => {
        fs.unlinkSync(binFilePath);
        reject(err);
      });
  });
}

async function downloadAndExtractJre() {
  try {
    fs.mkdirSync(JreDir, {recursive: true});

    console.log('Downloading JRE...');
    await njre.install(17, {installPath: JreDir});

    const extractedJreDir = fs
      .readdirSync(JreDir)
      .map((name) => path.join(JreDir, name))
      .find((fullPath) => fs.statSync(fullPath).isDirectory());

    if (!extractedJreDir) return;

    fs.readdirSync(extractedJreDir).forEach((file) => {
      fs.cpSync(path.join(extractedJreDir, file), path.join(JreDir, file), {
        recursive: true,
        force: true,
      });
    });
    fs.rmSync(extractedJreDir, {recursive: true, force: true});
    console.log(`Installed JRE on directory: ${JreDir}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

async function main() {
  await cleanJreDirectory();
  await cleanJBinFileDirectory();
  await downloadAndExtractJre();
  await downloadPlantUMLBinFile();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
