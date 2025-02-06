import * as child_process from 'child_process';
import type {Code, Image} from 'mdast';
import * as path from 'path';
import {PassThrough} from 'stream';
import type {Node} from 'unist';
import {visit} from 'unist-util-visit';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PLANTUML_BINFILE_PATH = path.resolve(__dirname, 'bin', 'plantuml.jar');
const JAVA_JRE_BINFILE_PATH = path.resolve(__dirname, 'jre', 'bin', 'java');

interface PlantUMLOptions {
  format?: 'png' | 'svg';
  theme?: string;
  darkmode?: boolean;
  charset?: string;
  stdrpt?: '' | 1 | 2;
  verbose?: boolean;
  quiet?: boolean;
  timeout?: number;
}

function addOptionToArgs(
  args: string[],
  key: string,
  value: any,
  handlers: Record<string, (value: any) => string>,
) {
  if (value !== undefined && handlers[key]) {
    args.push(handlers[key](value));
  }
}

function transformOptionsToArguments(options: PlantUMLOptions): string[] {
  const defaultArgs = ['-jar', PLANTUML_BINFILE_PATH];
  const args = [...defaultArgs];

  const optionHandlers: Record<string, (value: any) => string> = {
    format: (value: string) => `-t${value}`,
    theme: (value: string) => `-theme ${value}`,
    darkmode: () => '-darkmode',
    charset: (value: string) => `-charset ${value}`,
    stdrpt: (value: '' | 1 | 2) => `-stdrpt ${value}`,
    verbose: () => '-verbose',
    quiet: () => '-quiet',
    timeout: (value: number) => `-timeout ${value}`,
  };

  Object.entries(options).forEach(([key, value]) => {
    addOptionToArgs(args, key, value, optionHandlers);
  });

  args.push('-pipe');
  return args;
}

function callPlantUML(plantUmlCode: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const plantuml = child_process.spawn(JAVA_JRE_BINFILE_PATH, args, {
      stdio: ['pipe', 'pipe', process.stderr],
    });

    const pipeStream = new PassThrough();

    plantuml.stdin.write(plantUmlCode);
    plantuml.stdin.end();

    plantuml.stdout.pipe(pipeStream);

    pipeStream.on('data', (chunk) => {
      const base64Code = chunk.toString('base64');
      resolve(base64Code);
    });

    plantuml.on('error', reject);
    plantuml.on('close', (code) => {
      if (code !== 0) {
        console.log(`PlantUML process exited with code ${code}`);
        return;
      }
    });
  });
}

const defaultOptions: PlantUMLOptions = {
  format: 'png',
  charset: 'utf-8',
};
export default function remarkPlantuml(options: PlantUMLOptions = {}) {
  const opts: PlantUMLOptions = {...defaultOptions, ...options};
  const plantUmlArguments = transformOptionsToArguments(opts);

  return async function transformer(mdast: Node) {
    const promises: Promise<void>[] = [];
    visit(mdast, 'code', (node, index: number, parent: any) => {
      const codeNode = node as Code;
      if (
        codeNode.lang?.toLowerCase() === 'plantuml' &&
        parent &&
        index !== null
      ) {
        promises.push(
          (async () => {
            try {
              const base64Data = await callPlantUML(
                codeNode.value!,
                plantUmlArguments,
              );

              parent.children[index] = {
                type: 'image',
                url: `data:image/${opts.format};base64,${base64Data}`,
                alt: 'PlantUML Diagram',
              } as Image;
            } catch (error: any) {
              parent.children[index] = {
                type: 'text',
                value: `Error rendering PlantUML: ${error.message}`,
              };
            }
          })(),
        );
      }
    });

    await Promise.all(promises);
  };
}
