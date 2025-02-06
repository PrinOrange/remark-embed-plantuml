import axios from 'axios';
import * as fs from 'fs';
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

async function downloadPlantUMLBinFile(): Promise<void> {
  console.log('Downloading PlantUML...');
  fs.mkdirSync(binFileDir, {recursive: true});

  try {
    const response = await axios.get(plantUmlDownloadUrl, {
      responseType: 'stream',
      maxRedirects: 5,
    });

    if (!response.data || response.headers['content-length'] === '0') {
      throw new Error('Received empty file (Content-Length: 0)');
    }

    const fileStream = fs.createWriteStream(binFilePath);
    response.data.pipe(fileStream);

    return new Promise<void>((resolve, reject) => {
      fileStream.on('finish', () => {
        console.log(`Downloaded PlantUML: ${binFilePath}`);
        resolve();
      });

      fileStream.on('error', (err) => {
        console.error('File stream error:', err);
        fs.unlinkSync(binFilePath);
        reject(err);
      });
    });
  } catch (error) {
    console.error('Download failed:', error);
    fs.unlinkSync(binFilePath);
    throw error;
  }
}

async function downloadAndExtractJre() {
  try {
    fs.mkdirSync(JreDir, {recursive: true});

    console.log('Downloading JRE...');
    // @ts-ignore
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
