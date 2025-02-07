# Remark Embed PlantUML

> ⚠ **NOTE:**  
> This package is in the early stages of development and requires user feedback and further investigation. If you encounter any issues, please [submit an issue](https://github.com/PrinOrange/remark-embed-plantuml/issues).

This is a **Remark** plugin that allows you to embed **PlantUML** diagrams directly in your markdown documents. It scans all **PlantUML** code blocks in the markdown file and converts them into **Base64-encoded** images locally.

PlantUML requires a **Java Runtime Environment (JRE)**, but you do **not** need to install it manually. This package includes an integrated JRE and automatically executes PlantUML commands, making it easy to use out of the box.

> **Note:** Since this package includes a bundled Java JRE and PlantUML JAR file, it is only compatible with a **Node.js** environment. It will not work in **browsers** or **Electron render processes**. Additionally, because building tools like **Webpack** and **Vite** cannot recognize Java binaries, this package will not function properly if bundled into a project.

## Installation

Install this package using npm:

```bash
npm install remark-embed-plantuml
```

## Usage

Consider the following markdown file:

```plaintext
# Hello, PlantUML

Here is a simple PlantUML diagram:

\`\`\`plantuml
@startuml
Alice -> Bob: test
@enduml
\`\`\`
```

Now, integrate this plugin into your code:

```javascript
import remarkEmbedPlantUml from 'remark-embed-plantuml';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import {unified} from 'unified';
import {readFile} from 'node:fs/promises';

(async () => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkEmbedPlantUml, {format: 'png', stdrpt: 2, darkmode: true})
    .use(remarkStringify);

  const transformed = await processor.process(await readFile('doc.md'));
  console.log(transformed.toString());
})();
```

### Output:

```markdown
# Hello, PlantUML

Here is a simple PlantUML diagram:

![PlantUML Diagram](data:image/png;base64,xxxxxxxxxx....)
```

## API

This package is **ESM-only** and provides a default export: `remarkEmbedPlantUML`. You can integrate it with **unified.js**.

### `unified().use(remarkEmbedPlantUML, options?)`

This plugin supports [PlantUML command-line arguments](https://plantuml.com/en/command-line) and executes **PlantUML** via a CLI pipe.

### Options

#### `format?: 'png' | 'svg'`

Specifies the output format. Defaults to `'png'`. Only `'svg'` and `'png'` are supported. The result is embedded as a **Base64-encoded** image.

#### `theme?: string`

Specifies the **theme** for the diagram. See the [official theme documentation](https://plantuml.com/en/theme) for available options.

#### `darkmode?: boolean`

Enables **dark mode** for diagrams.

#### `stdrpt?: '' | 1 | 2`

Controls the error output format using the `-stdrpt` option. See [PlantUML command-line documentation](https://plantuml.com/en/command-line) for details.

#### `verbose?: boolean`

Enables logging output.

#### `quiet?: boolean`

Suppresses error messages in the console.

#### `timeout?: number`

Sets the **processing timeout** in seconds. Defaults to **900 seconds (15 minutes)**.

If you need support for additional arguments, [submit an issue](https://github.com/PrinOrange/remark-plantuml) to request it.

## Compatibility

This package requires **Node.js 18** or later.

- **Bundled JRE Version:** 17.0.14+7
- **PlantUML Version:** 1.2025.0

## 🔗 Related Projects

- [PlantUML](https://github.com/plantuml/plantuml)

## Contributing

Test fixtures are generated and verified using **Linux**. Rendering results may slightly differ across platforms. If adding new test cases, don’t modify existing ones that cause CI failures. For general contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTION.MD).

## License

[MIT](./LICENSE.MD) © [但为君故](https://github.com/PrinOrange)
