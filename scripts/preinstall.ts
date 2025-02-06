import njre from "njre";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JreDir = path.resolve(__dirname, "../jre");

async function cleanJreDirectory() {
  if (!fs.existsSync(JreDir)) return;
  console.log("Cleaning JRE directory...");

  try {
    await fs.promises.rm(JreDir, { recursive: true, force: true });
  } catch (err) {
    console.warn("Direct removal failed, trying rename method...");
    const tempDir = JreDir + "_old_" + Date.now();
    fs.renameSync(JreDir, tempDir);
    await fs.promises.rm(tempDir, { recursive: true, force: true });
  }
}

async function downloadAndExtractJRE() {
  try {
    fs.mkdirSync(JreDir, { recursive: true });
    console.log("Downloading JRE...");
    await njre.install(17, { installPath: JreDir });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

function moveJreFilesToJreDir() {
  try {
    const extractedJreDir = fs.readdirSync(JreDir)
      .map(name => path.join(JreDir, name))
      .find(fullPath => fs.statSync(fullPath).isDirectory());

    if (!extractedJreDir) return;

    fs.readdirSync(extractedJreDir).forEach(file => {
      fs.cpSync(path.join(extractedJreDir, file), path.join(JreDir, file), {
        recursive: true,
        force: true,
      });
    });

    fs.rmSync(extractedJreDir, { recursive: true, force: true });
    console.log(`Installed JRE on directory: ${JreDir}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

async function main() {
  await cleanJreDirectory();
  await downloadAndExtractJRE();
  moveJreFilesToJreDir();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
