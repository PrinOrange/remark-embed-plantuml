import * as child_process from 'child_process';
import type * as mdast from 'mdast';
import type {Code} from 'mdast';
import * as path from 'path';
import type * as unified from 'unified';
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
  stdrpt?: '' | 1 | 2;
  verbose?: boolean;
  quiet?: boolean;
  timeout?: number;
}

function transformOptionsToArguments(options: PlantUMLOptions): string[] {
  const defaultArgs = ['-jar', PLANTUML_BINFILE_PATH];
  const args = [...defaultArgs];

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

  const optionHandlers: Record<string, (value: any) => string> = {
    format: (value: string) => `-t${value}`,
    theme: (value: string) => `-theme ${value}`,
    darkmode: () => '-darkmode',
    charset: (value: string) => `-charset ${value}`,
    stdrpt: (value: '' | 1 | 2) => `-stdrpt${value}`,
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

    const chunks: Buffer[] = [];

    plantuml.stdin.write(plantUmlCode);
    plantuml.stdin.end();

    plantuml.stdout.on('data', (chunk) => {
      chunks.push(chunk);
    });

    plantuml.on('error', (err) => {
      reject(new Error(`Failed to spawn PlantUML process: ${err.message}`));
    });

    plantuml.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`PlantUML process exited with code ${code}`));
      } else {
        resolve(Buffer.concat(chunks).toString('base64'));
      }
    });
  });
}

const remarkPlantUml: unified.Plugin<[PlantUMLOptions], mdast.Root> = (
  opts: PlantUMLOptions = {},
) => {
  const options: PlantUMLOptions = {format: 'png', ...opts};
  const plantUmlArguments = transformOptionsToArguments(options);

  async function applyChange(codeNode: Code, index: number, parent: any) {
    {
      try {
        const base64Data = await callPlantUML(
          codeNode.value!,
          plantUmlArguments,
        );
        parent.children[index] = {
          type: 'paragraph',
          children: [
            {
              type: 'image',
              url: `data:image/${opts.format};base64,${base64Data}`,
              alt: 'PlantUML Diagram',
            },
          ],
        } as mdast.Paragraph;
      } catch (error: any) {
        parent.children[index] = {
          type: 'text',
          value: `Error rendering PlantUML: ${error.message}`,
        };
      }
    }
  }

  return async function transformer(tree) {
    const promises: Promise<void>[] = [];
    console.log(JSON.stringify(tree));
    visit(tree, 'code', (node, index, parent) => {
      const codeNode = node;
      if (
        codeNode.type === 'code' &&
        (codeNode as Code).lang?.toLowerCase() === 'plantuml' &&
        parent &&
        index !== null
      ) {
        console.log(JSON.stringify(parent));
        promises.push(applyChange(codeNode as Code, index!, parent));
      }
    });
    await Promise.all(promises);
  };
};

export default remarkPlantUml;
