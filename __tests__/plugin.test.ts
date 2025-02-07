import {test} from 'node:test';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import {unified} from 'unified';
import {remarkPlantuml} from '../dist/index';

const plantumlCode = `
\n
# Hello World  
 
This is the graph.
 
\`\`\`plantuml
@startuml
!theme spacelab
Bob -> Alice :  hello
@enduml
\`\`\`
`;

test('base64 output', async (t) => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkPlantuml, {format: 'png', stdrpt: 2, darkmode: true})
    .use(remarkStringify, {ruleSpaces: true});
  const transformed = await processor.process(plantumlCode);
  const output = transformed.toString();
  t.diagnostic(output);
});
