import * as fs from 'fs';
import assert from 'node:assert';
import {test} from 'node:test';
import * as path from 'path';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import {unified} from 'unified';
import {fileURLToPath} from 'url';
import {remarkPlantUml} from '../dist/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    .use(remarkPlantUml, {format: 'png'})
    .use(remarkStringify);
  const transformed = await processor.process(inputContent);
  const actualContent = transformed.toString();
  assert.equal(expectContent, actualContent);
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
    .use(remarkPlantUml, {format: 'svg'})
    .use(remarkStringify);
  const transformed = await processor.process(inputContent);
  const actualContent = transformed.toString();
  assert.equal(expectContent, actualContent);
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
    .use(remarkPlantUml, {format: 'png', darkmode: true})
    .use(remarkStringify);
  const transformed = await processor.process(inputContent);
  const actualContent = transformed.toString();
  assert.equal(expectContent, actualContent);
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
    .use(remarkPlantUml, {format: 'svg', darkmode: true})
    .use(remarkStringify);
  const transformed = await processor.process(inputContent);
  const actualContent = transformed.toString();
  assert.equal(expectContent, actualContent);
});
