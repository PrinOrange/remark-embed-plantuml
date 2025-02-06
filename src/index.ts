import child_process from 'child_process';
import type {Code, Image} from 'mdast';
import type {Node} from 'unist';
import {visit} from 'unist-util-visit';

interface PlantUMLOptions {
  format?: string;
  jarPath?: string;
}

const defaultOptions: PlantUMLOptions = {
  format: 'png',
  jarPath: 'plantuml.jar',
};

function renderPlantUML(
  input: string,
  options: PlantUMLOptions,
): Promise<Buffer> {
  if (!options.jarPath) {
    return Promise.reject(new Error('PlantUML JAR path is required'));
  }

  return new Promise((resolve, reject) => {
    const args: string[] = [
      '-Djava.awt.headless=true',
      '-jar',
      options.jarPath!,
      `-t${options.format}`,
      '-pipe',
    ];
    const child: child_process.ChildProcessWithoutNullStreams =
      child_process.spawn('java', args, {stdio: ['pipe', 'pipe', 'pipe']});

    const chunks: Buffer[] = [];

    child.stdout.on('data', (data) => chunks.push(data));
    child.stderr.on('data', (data) =>
      console.error(`PlantUML Error: ${data.toString()}`),
    );
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0)
        return reject(new Error(`PlantUML failed with exit code ${code}`));
      resolve(Buffer.concat(chunks));
    });

    child.stdin.write(input);
    child.stdin.end();
  });
}

export default function remarkPlantuml(options: PlantUMLOptions = {}) {
  const opts: PlantUMLOptions = {...defaultOptions, ...options};

  return async function transformer(syntaxTree: Node) {
    const promises: Promise<void>[] = [];

    visit(syntaxTree, 'code', (node, index: number, parent: any) => {
      const codeNode = node as Code;
      if (
        codeNode.lang?.toLowerCase() === 'plantuml' &&
        parent &&
        index !== null
      ) {
        promises.push(
          (async () => {
            try {
              const buffer = await renderPlantUML(codeNode.value!, opts);
              const decoded = buffer.toString('base64');

              parent.children[index] = {
                type: 'image',
                url: `data:image/${opts.format};base64,${decoded}`,
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
