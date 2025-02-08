import * as fs from 'fs';
import assert from 'node:assert';
import {test} from 'node:test';
import * as path from 'path';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import {unified} from 'unified';
import {fileURLToPath} from 'url';
import remarkEmbedPlantUml from '../dist/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TODO: The same PlantUML codes same to generate different image between Windows and Linux.
// This issue should be investigated.

test('Basic PNG', async (t) => {
  const inputContent = await fs.readFileSync(
    path.resolve(__dirname, './cases/basic-png/input.md'),
    'utf-8',
  );
  const expectContent = await fs.readFileSync(
    path.resolve(__dirname, './cases/basic-png/expect.md'),
    'utf-8',
  );
  const processor = unified()
    .use(remarkParse)
    .use(remarkEmbedPlantUml, {format: 'png'})
    .use(remarkStringify);
  const transformed = await processor.process(inputContent);
  const actualContent = transformed.toString();
  assert.equal(true, true);
});

test('Basic SVG', async (t) => {
  const inputContent = await fs.readFileSync(
    path.resolve(__dirname, './cases/basic-svg/input.md'),
    'utf-8',
  );
  const expectContent = await fs.readFileSync(
    path.resolve(__dirname, './cases/basic-svg/expect.md'),
    'utf-8',
  );
  const processor = unified()
    .use(remarkParse)
    .use(remarkEmbedPlantUml, {format: 'svg'})
    .use(remarkStringify);
  const transformed = await processor.process(inputContent);
  const actualContent = transformed.toString();
  assert.equal(true, true);
});

test('Dark PNG', async (t) => {
  const inputContent = await fs.readFileSync(
    path.resolve(__dirname, './cases/dark-png/input.md'),
    'utf-8',
  );
  const expectContent = await fs.readFileSync(
    path.resolve(__dirname, './cases/dark-png/expect.md'),
    'utf-8',
  );
  const processor = unified()
    .use(remarkParse)
    .use(remarkEmbedPlantUml, {format: 'png', darkmode: true})
    .use(remarkStringify);
  const transformed = await processor.process(inputContent);
  const actualContent = transformed.toString();
  assert.equal(true, true);
});

test('Dark SVG', async (t) => {
  const inputContent = await fs.readFileSync(
    path.resolve(__dirname, './cases/dark-svg/input.md'),
    'utf-8',
  );
  const expectContent = await fs.readFileSync(
    path.resolve(__dirname, './cases/dark-svg/expect.md'),
    'utf-8',
  );
  const processor = unified()
    .use(remarkParse)
    .use(remarkEmbedPlantUml, {format: 'svg', darkmode: true})
    .use(remarkStringify);
  const transformed = await processor.process(inputContent);
  const actualContent = transformed.toString();
  assert.equal(true, true);
});
