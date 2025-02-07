# Remark Embed PlantUML

> ⚠ **NOTE:**  \
> This package is on the early development stage and it needs more user-side fallbacks and investigations. Please [submit your issue](https://github.com/PrinOrange/remark-embed-plantuml/issues) if you have any questions you have encountered.

This is a Remark Plugin that allows you embed PlantUML graph in your markdown document. It will read all PUML code blocks in markdown and transform them into images of Base64 Encodings on your local machine.

The PlantUML requires the JRE for runtime, but you need not install the JRE manually. This package has integrated JRE and it will execute PlantUML callings automatically, it realized out-of-the-box use.

**NOTE:** This package comes with own Java JRE and PlantUML Jar file so that it could only running on Node.js environment. So it may be invalid if you run them on Browser/Electron Renderer. Also because the Java JRE and binary files can not be recognized by building tools like Webpack, Vite, so it does not work if you reference this package but build your project.

## Usage

Install this package

```bash
npm i remark-embed-plantuml
```

We take this code for example

```plaintext
# Hello, PlantUML

Here is a simple PlantUML Graph

\`\`\`plantuml
@startuml
Alice -> Bob: test
@enduml
\`\`\`

```

And take it into your code,

```javascript
import remarkEmbedPlantUml from 'remark-embed-plantuml';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import {unified} from 'unified';
import {readFile} from 'node:fs/promises';

await (async (t) => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkPlantUml, {format: 'png', stdrpt: 2, darkmode: true})
    .use(remarkStringify);
  const transformed = await processor.process(await readFile('doc.md'));
  const output = transformed.toString();
  console.log(output);
})();
```

It will outputs:

```markdown
# Hello, PlantUML

Here is a simple PlantUML Graph

![PlantUML Image](data:image/png;base64,xxxxxxxxxx....)
```

## API

This package is `ESM` only and has a default export `remarkEmbedPlantUML`. You could integrate this plugin with unified.js.

### `unified().use(remarkEmbedPlantUML, options?)`

This plugin supports [partial arguments of PlantUML](https://plantuml.com/en/command-line) and it calls the PlantUML by CLI pipe way.

#### `format?: 'png' | 'svg'`

The output format, default to `PNG`, only `SVG` or `PNG` is supported, and finally it will rendered in base64 encoding.

#### `theme?: string`

The theme that you want to applied. Refer to [official theme description](https://plantuml.com/en/theme) for more details.

#### `darkmode?: boolean`

Use dark mode for diagrams.

#### `stdrpt?: '' | 1 | 2`

Using the `-stdrpt` (standard report) option, you can change the format of the error output of your PlantUML scripts. See [description of stdrpt](https://plantuml.com/en/command-line).

#### `verbose?: boolean`

Have log information.

#### `quiet?: boolean`

To NOT print error message into the console.

#### `timeout?: number`

Processing timeout in (N) seconds. Defaults to 15 minutes (900 seconds).

This project is under long-term maintaining and if you need more arguments support, [please submit your issue](https://github.com/PrinOrange/remark-plantuml) to tell me.

## Compatibility

This project is compatible with Node.js 18 or greater.

- JRE Version: 17.0.14+7
- PlantUML Version: 1.2025.0

## Related Projects

- [PlantUML](https://github.com/plantuml/plantuml)

## Contributing

Test fixtures are generated and verified using Linux. Rendering on other platforms may yield slightly different results. Don’t worry about adding new fixtures, but don’t update existing ones that cause CI to fail. Furthermore see my global [contributing guidelines](./CONTRIBUTION.MD).

## LICENSE

[MIT](./LICENSE.MD) © [但为君故](https://github.com/PrinOrange)
