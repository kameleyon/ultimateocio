// Auto-generated boilerplate for component-builder

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';

// Supported frameworks/libraries
type SupportedFramework = 'react' | 'vue' | 'angular' | 'svelte' | 'solid';

// Supported component types
type ComponentType = 'functional' | 'class' | 'hooks' | 'styled' | 'hoc';

// Component template
interface ComponentTemplate {
  name: string;
  framework: SupportedFramework;
  type: ComponentType;
  content: string;
  styles?: string;
  tests?: string;
}

// Component part types
type ComponentPart = 'component' | 'styles' | 'tests' | 'stories' | 'types';

// Framework detection info
interface FrameworkDetection {
  framework: SupportedFramework;
  version?: string;
  typescript: boolean;
  styling: string[];
  testingLibraries: string[];
  detected: boolean;
}

// Templates storage
const templates: { [key: string]: ComponentTemplate } = {
  // React functional component
  'react-functional': {
    name: 'Component',
    framework: 'react',
    type: 'functional',
    content: `import React from 'react';
import './{{name}}.css';

interface {{name}}Props {
  title?: string;
  children?: React.ReactNode;
}

const {{name}} = ({ title = 'Default Title', children }: {{name}}Props) => {
  return (
    <div className="{{name}}">
      <h2>{title}</h2>
      <div className="{{name}}__content">
        {children}
      </div>
    </div>
  );
};

export default {{name}};
`,
    styles: `.{{name}} {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 16px;
  margin: 16px 0;
}

.{{name}}__content {
  margin-top: 8px;
}
`,
    tests: `import React from 'react';
import { render, screen } from '@testing-library/react';
import {{name}} from './{{name}}';

describe('{{name}} Component', () => {
  test('renders with default title', () => {
    render(<{{name}} />);
    expect(screen.getByText('Default Title')).toBeInTheDocument();
  });

  test('renders with custom title', () => {
    render(<{{name}} title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  test('renders children content', () => {
    render(
      <{{name}}>
        <p>Test Content</p>
      </{{name}}>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
`
  },

  // React class component
  'react-class': {
    name: 'Component',
    framework: 'react',
    type: 'class',
    content: `import React, { Component } from 'react';
import './{{name}}.css';

interface {{name}}Props {
  title?: string;
  children?: React.ReactNode;
}

interface {{name}}State {
  count: number;
}

class {{name}} extends Component<{{name}}Props, {{name}}State> {
  constructor(props: {{name}}Props) {
    super(props);
    this.state = {
      count: 0
    };
  }

  incrementCount = () => {
    this.setState(prevState => ({
      count: prevState.count + 1
    }));
  };

  render() {
    const { title = 'Default Title', children } = this.props;
    const { count } = this.state;

    return (
      <div className="{{name}}">
        <h2>{title}</h2>
        <div className="{{name}}__content">
          {children}
          <p>Count: {count}</p>
          <button onClick={this.incrementCount}>Increment</button>
        </div>
      </div>
    );
  }
}

export default {{name}};
`,
    styles: `.{{name}} {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 16px;
  margin: 16px 0;
}

.{{name}}__content {
  margin-top: 8px;
}

.{{name}} button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 8px;
}

.{{name}} button:hover {
  background-color: #0069d9;
}
`
  },

  // Vue component
  'vue-functional': {
    name: 'Component',
    framework: 'vue',
    type: 'functional',
    content: `<template>
  <div class="{{name}}">
    <h2>{{ title }}</h2>
    <div class="{{name}}__content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: '{{name}}',
  props: {
    title: {
      type: String,
      default: 'Default Title'
    }
  }
}
</script>

<style scoped>
.{{name}} {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 16px;
  margin: 16px 0;
}

.{{name}}__content {
  margin-top: 8px;
}
</style>
`
  },

  // Vue 3 Composition API
  'vue-composition': {
    name: 'Component',
    framework: 'vue',
    type: 'hooks',
    content: `<template>
  <div class="{{name}}">
    <h2>{{ title }}</h2>
    <div class="{{name}}__content">
      <slot></slot>
      <p>Count: {{ count }}</p>
      <button @click="increment">Increment</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: '{{name}}',
  props: {
    title: {
      type: String,
      default: 'Default Title'
    }
  },
  setup() {
    const count = ref(0)
    
    const increment = () => {
      count.value++
    }
    
    return {
      count,
      increment
    }
  }
}
</script>

<style scoped>
.{{name}} {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 16px;
  margin: 16px 0;
}

.{{name}}__content {
  margin-top: 8px;
}

.{{name}} button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 8px;
}

.{{name}} button:hover {
  background-color: #3aa876;
}
</style>
`
  },

  // Angular component
  'angular-component': {
    name: 'Component',
    framework: 'angular',
    type: 'class',
    content: `import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-{{name-kebab}}',
  templateUrl: './{{name-kebab}}.component.html',
  styleUrls: ['./{{name-kebab}}.component.css']
})
export class {{name}}Component {
  @Input() title: string = 'Default Title';
  count: number = 0;

  increment(): void {
    this.count++;
  }
}
`,
    styles: `:host {
  display: block;
}

.{{name}} {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 16px;
  margin: 16px 0;
}

.{{name}}__content {
  margin-top: 8px;
}

.{{name}} button {
  background-color: #3f51b5;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 8px;
}

.{{name}} button:hover {
  background-color: #303f9f;
}
`
  },

  // Svelte component
  'svelte-component': {
    name: 'Component',
    framework: 'svelte',
    type: 'functional',
    content: `<script>
  export let title = 'Default Title';
  let count = 0;
  
  function increment() {
    count += 1;
  }
</script>

<div class="{{name}}">
  <h2>{title}</h2>
  <div class="{{name}}__content">
    <slot></slot>
    <p>Count: {count}</p>
    <button on:click={increment}>Increment</button>
  </div>
</div>

<style>
  .{{name}} {
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 16px;
    margin: 16px 0;
  }

  .{{name}}__content {
    margin-top: 8px;
  }

  button {
    background-color: #ff3e00;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 8px;
  }

  button:hover {
    background-color: #dd3600;
  }
</style>
`
  }
};

// Available templates cache
const availableTemplates = Object.keys(templates);

// Detect framework info from project structure
let detectedFramework: FrameworkDetection = {
  framework: 'react',
  typescript: false,
  styling: [],
  testingLibraries: [],
  detected: false
};

export function activate() {
  console.log("[TOOL] component-builder activated");
  
  // Detect project framework and structure
  detectProjectFramework();
}

/**
 * Detect project framework and setup
 */
function detectProjectFramework() {
  try {
    // Check for package.json
    if (fsSync.existsSync('package.json')) {
      const packageJson = JSON.parse(fsSync.readFileSync('package.json', 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // Detect React
      if (dependencies.react) {
        detectedFramework.framework = 'react';
        detectedFramework.version = dependencies.react;
        detectedFramework.detected = true;
        
        // Detect styling libraries for React
        if (dependencies['styled-components']) {
          detectedFramework.styling.push('styled-components');
        }
        if (dependencies.sass || dependencies['node-sass']) {
          detectedFramework.styling.push('sass');
        }
        if (dependencies['emotion'] || dependencies['@emotion/core'] || dependencies['@emotion/react']) {
          detectedFramework.styling.push('emotion');
        }
        
        // Detect testing libraries for React
        if (dependencies['@testing-library/react']) {
          detectedFramework.testingLibraries.push('testing-library');
        }
        if (dependencies.enzyme) {
          detectedFramework.testingLibraries.push('enzyme');
        }
        if (dependencies.jest) {
          detectedFramework.testingLibraries.push('jest');
        }
      }
      
      // Detect Vue
      else if (dependencies.vue) {
        detectedFramework.framework = 'vue';
        detectedFramework.version = dependencies.vue;
        detectedFramework.detected = true;
        
        // Detect Vue styling
        if (dependencies.sass || dependencies['node-sass']) {
          detectedFramework.styling.push('sass');
        }
        
        // Detect Vue testing
        if (dependencies['@vue/test-utils']) {
          detectedFramework.testingLibraries.push('vue-test-utils');
        }
      }
      
      // Detect Angular
      else if (dependencies['@angular/core']) {
        detectedFramework.framework = 'angular';
        detectedFramework.version = dependencies['@angular/core'];
        detectedFramework.detected = true;
        
        // Angular styling is usually sass
        detectedFramework.styling.push('sass');
        
        // Detect Angular testing
        if (dependencies.jasmine) {
          detectedFramework.testingLibraries.push('jasmine');
        }
        if (dependencies.karma) {
          detectedFramework.testingLibraries.push('karma');
        }
      }
      
      // Detect Svelte
      else if (dependencies.svelte) {
        detectedFramework.framework = 'svelte';
        detectedFramework.version = dependencies.svelte;
        detectedFramework.detected = true;
      }
      
      // Detect SolidJS
      else if (dependencies.solid || dependencies['solid-js']) {
        detectedFramework.framework = 'solid';
        detectedFramework.version = dependencies.solid || dependencies['solid-js'];
        detectedFramework.detected = true;
      }
      
      // Detect TypeScript
      detectedFramework.typescript = !!(
        dependencies.typescript || 
        fsSync.existsSync('tsconfig.json')
      );
      
      console.log(`[Component Builder] Detected ${detectedFramework.framework} framework`);
      if (detectedFramework.typescript) {
        console.log('[Component Builder] TypeScript support detected');
      }
      if (detectedFramework.styling.length > 0) {
        console.log(`[Component Builder] Styling libraries: ${detectedFramework.styling.join(', ')}`);
      }
      if (detectedFramework.testingLibraries.length > 0) {
        console.log(`[Component Builder] Testing libraries: ${detectedFramework.testingLibraries.join(', ')}`);
      }
    }
  } catch (error) {
    console.error('[Component Builder] Error detecting project framework:', error);
  }
}

/**
 * Handles file write events
 */
export function onFileWrite(event: { path: string; content: string }) {
  // Not used in this tool
}

/**
 * Handles session start logic
 */
export function onSessionStart(session: { id: string; startTime: number }) {
  console.log(`[Component Builder] Session started: ${session.id}`);
  
  // Re-detect framework in case project structure has changed
  detectProjectFramework();
}

/**
 * Handles component-builder commands
 */
export async function onCommand(command: { name: string; args: any[] }) {
  switch (command.name) {
    case 'component-builder:create':
      console.log('[Component Builder] Creating component...');
      return await handleCreateComponent(command.args[0]);
    case 'component-builder:list-templates':
      console.log('[Component Builder] Listing available templates...');
      return await handleListTemplates(command.args[0]);
    case 'component-builder:add-part':
      console.log('[Component Builder] Adding component part...');
      return await handleAddComponentPart(command.args[0]);
    case 'component-builder:analyze':
      console.log('[Component Builder] Analyzing component...');
      return await handleAnalyzeComponent(command.args[0]);
    default:
      console.warn(`[Component Builder] Unknown command: ${command.name}`);
      return { error: `Unknown command: ${command.name}` };
  }
}

// Define schemas for Component Builder tool
export const CreateComponentSchema = z.object({
  name: z.string(),
  framework: z.enum(['react', 'vue', 'angular', 'svelte', 'solid']).optional(),
  type: z.enum(['functional', 'class', 'hooks', 'styled', 'hoc']).optional(),
  outputDir: z.string().optional(),
  includeStyles: z.boolean().optional().default(true),
  includeTests: z.boolean().optional().default(false),
  includeStories: z.boolean().optional().default(false),
  customTemplate: z.string().optional(),
  customProps: z.record(z.any()).optional(),
});

export const ListTemplatesSchema = z.object({
  framework: z.enum(['react', 'vue', 'angular', 'svelte', 'solid']).optional(),
  type: z.enum(['functional', 'class', 'hooks', 'styled', 'hoc']).optional(),
  includeDetails: z.boolean().optional().default(false),
});

export const AddComponentPartSchema = z.object({
  componentPath: z.string(),
  part: z.enum(['styles', 'tests', 'stories', 'types']),
  content: z.string().optional(),
  overwrite: z.boolean().optional().default(false),
});

export const AnalyzeComponentSchema = z.object({
  path: z.string(),
  detectDependencies: z.boolean().optional().default(true),
  suggestImprovements: z.boolean().optional().default(true),
});

/**
 * Helper to convert component name to different case formats
 */
function convertCase(name: string, format: 'pascal' | 'camel' | 'kebab' | 'snake'): string {
  // First normalize to pascal case
  let pascalCase = name.replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
  
  // Then convert to the desired format
  switch (format) {
    case 'pascal':
      return pascalCase;
    case 'camel':
      return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);
    case 'kebab':
      return pascalCase
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .toLowerCase();
    case 'snake':
      return pascalCase
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .toLowerCase();
    default:
      return pascalCase;
  }
}

/**
 * Process template with replacements
 */
function processTemplate(template: string, replacements: Record<string, string>): string {
  // Replace template placeholders
  let result = template;
  
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  
  return result;
}

/**
 * Create a component based on template and options
 */
async function createComponent(options: {
  name: string;
  framework: SupportedFramework;
  type: ComponentType;
  outputDir: string;
  includeStyles: boolean;
  includeTests: boolean;
  includeStories: boolean;
  customTemplate?: string;
  customProps?: Record<string, any>;
}): Promise<{ path: string; files: string[] }> {
  // Get template
  const templateKey = options.customTemplate || `${options.framework}-${options.type}`;
  
  let template = templates[templateKey];
  if (!template) {
    // Fall back to framework default
    const fallbackKey = availableTemplates.find(key => key.startsWith(`${options.framework}-`));
    if (!fallbackKey) {
      throw new Error(`No template available for ${options.framework}`);
    }
    template = templates[fallbackKey];
  }
  
  // Prepare replacements
  const replacements: Record<string, string> = {
    'name': options.name,
    'name-kebab': convertCase(options.name, 'kebab'),
    'name-camel': convertCase(options.name, 'camel'),
    'name-snake': convertCase(options.name, 'snake'),
    ...options.customProps
  };
  
  // Process templates
  const componentContent = processTemplate(template.content, replacements);
  
  // Ensure output directory exists
  await fs.mkdir(options.outputDir, { recursive: true });
  
  // Determine file extensions
  const componentExt = options.framework === 'svelte' ? '.svelte' :
                       options.framework === 'vue' ? '.vue' :
                       detectedFramework.typescript ? '.tsx' : '.jsx';
  
  const isInlineStyles = options.framework === 'svelte' || options.framework === 'vue';
  
  // Create files
  const createdFiles: string[] = [];
  
  // Main component file
  const componentFilePath = options.framework === 'angular' 
    ? path.join(options.outputDir, `${convertCase(options.name, 'kebab')}.component${componentExt}`)
    : path.join(options.outputDir, `${options.name}${componentExt}`);
  
  await fs.writeFile(componentFilePath, componentContent);
  createdFiles.push(componentFilePath);
  
  // For Angular, create template file
  if (options.framework === 'angular') {
    const templateContent = `<div class="${options.name}">
  <h2>{{ title }}</h2>
  <div class="${options.name}__content">
    <ng-content></ng-content>
    <p>Count: {{ count }}</p>
    <button (click)="increment()">Increment</button>
  </div>
</div>`;
    
    const templatePath = path.join(options.outputDir, `${convertCase(options.name, 'kebab')}.component.html`);
    await fs.writeFile(templatePath, templateContent);
    createdFiles.push(templatePath);
  }
  
  // Styles file (if not inline and includeStyles is true)
  if (options.includeStyles && !isInlineStyles && template.styles) {
    const stylesContent = processTemplate(template.styles, replacements);
    
    const styleExt = detectedFramework.styling.includes('sass') ? '.scss' : 
                     options.framework === 'angular' ? '.css' : '.css';
    
    const stylesPath = options.framework === 'angular'
      ? path.join(options.outputDir, `${convertCase(options.name, 'kebab')}.component${styleExt}`)
      : path.join(options.outputDir, `${options.name}${styleExt}`);
    
    await fs.writeFile(stylesPath, stylesContent);
    createdFiles.push(stylesPath);
  }
  
  // Tests file
  if (options.includeTests && template.tests) {
    const testsContent = processTemplate(template.tests, replacements);
    
    const testExt = detectedFramework.typescript ? '.test.tsx' : '.test.jsx';
    const testFileName = options.framework === 'angular'
      ? `${convertCase(options.name, 'kebab')}.component.spec.ts`
      : `${options.name}${testExt}`;
    
    const testsPath = path.join(options.outputDir, testFileName);
    await fs.writeFile(testsPath, testsContent);
    createdFiles.push(testsPath);
  }
  
  // Storybook story
  if (options.includeStories) {
    const storyContent = createStoryContent(options.name, options.framework);
    
    const storyExt = detectedFramework.typescript ? '.stories.tsx' : '.stories.jsx';
    const storyPath = path.join(options.outputDir, `${options.name}${storyExt}`);
    
    await fs.writeFile(storyPath, storyContent);
    createdFiles.push(storyPath);
  }
  
  return {
    path: componentFilePath,
    files: createdFiles
  };
}

/**
 * Create storybook story content
 */
function createStoryContent(componentName: string, framework: SupportedFramework): string {
  switch (framework) {
    case 'react':
      return `import React from 'react';
import { Story, Meta } from '@storybook/react';
import ${componentName} from './${componentName}';

export default {
  title: 'Components/${componentName}',
  component: ${componentName},
  argTypes: {
    title: { control: 'text' },
  },
} as Meta;

const Template: Story = (args) => <${componentName} {...args} />;

export const Default = Template.bind({});
Default.args = {
  title: 'Default Title',
};

export const CustomTitle = Template.bind({});
CustomTitle.args = {
  title: 'Custom Component Title',
};

export const WithContent = Template.bind({});
WithContent.args = {
  title: 'With Content',
  children: <p>This is some custom content for the component.</p>,
};
`;

    case 'vue':
      return `import ${componentName} from './${componentName}.vue';

export default {
  title: 'Components/${componentName}',
  component: ${componentName},
  argTypes: {
    title: { control: 'text' },
  },
};

const Template = (args) => ({
  components: { ${componentName} },
  setup() {
    return { args };
  },
  template: '<${convertCase(componentName, 'kebab')} v-bind="args"><p>Slot content</p></${convertCase(componentName, 'kebab')}>',
});

export const Default = Template.bind({});
Default.args = {
  title: 'Default Title',
};

export const CustomTitle = Template.bind({});
CustomTitle.args = {
  title: 'Custom Component Title',
};
`;

    case 'angular':
      return `import { moduleMetadata } from '@storybook/angular';
import { Story, Meta } from '@storybook/angular/types-6-0';
import { ${componentName}Component } from './${convertCase(componentName, 'kebab')}.component';

export default {
  title: 'Components/${componentName}',
  component: ${componentName}Component,
  decorators: [
    moduleMetadata({
      declarations: [${componentName}Component],
    }),
  ],
  argTypes: {
    title: { control: 'text' },
  },
} as Meta;

const Template: Story<${componentName}Component> = (args: ${componentName}Component) => ({
  props: args,
  template: \`<app-${convertCase(componentName, 'kebab')} [title]="title">Some content</app-${convertCase(componentName, 'kebab')}>\`,
});

export const Default = Template.bind({});
Default.args = {
  title: 'Default Title',
};

export const CustomTitle = Template.bind({});
CustomTitle.args = {
  title: 'Custom Component Title',
};
`;

    case 'svelte':
      return `import ${componentName} from './${componentName}.svelte';

export default {
  title: 'Components/${componentName}',
  component: ${componentName},
  argTypes: {
    title: { control: 'text' },
  },
};

const Template = (args) => ({
  Component: ${componentName},
  props: args,
  slot: '<p>Slot content</p>',
});

export const Default = Template.bind({});
Default.args = {
  title: 'Default Title',
};

export const CustomTitle = Template.bind({});
CustomTitle.args = {
  title: 'Custom Component Title',
};
`;

    default:
      return `// Storybook for ${framework} not supported yet`;
  }
}

/**
 * Handles creating a component
 */
async function handleCreateComponent(args: any) {
  try {
    const result = CreateComponentSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for creating component"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const {
      name,
      framework = detectedFramework.framework,
      type = 'functional',
      outputDir,
      includeStyles,
      includeTests,
      includeStories,
      customTemplate,
      customProps
    } = result.data;
    
    // Validate component name
    if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: "Component name must start with an uppercase letter and contain only alphanumeric characters",
            message: "Invalid component name"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // Determine output directory
    let componentDir = outputDir;
    
    if (!componentDir) {
      // Default output directory based on framework
      switch (framework) {
        case 'react':
          componentDir = 'src/components';
          break;
        case 'vue':
          componentDir = 'src/components';
          break;
        case 'angular':
          componentDir = `src/app/components/${convertCase(name, 'kebab')}`;
          break;
        case 'svelte':
          componentDir = 'src/components';
          break;
        case 'solid':
          componentDir = 'src/components';
          break;
        default:
          componentDir = 'src/components';
      }
    }
    
    // Create full component directory
    const fullOutputDir = componentDir.startsWith('/') 
      ? componentDir 
      : path.join(process.cwd(), componentDir);
    
    // Create component
    const { path: componentPath, files } = await createComponent({
      name,
      framework,
      type,
      outputDir: fullOutputDir,
      includeStyles,
      includeTests,
      includeStories,
      customTemplate,
      customProps
    });
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          componentName: name,
          componentPath,
          files,
          framework,
          type,
          message: `Successfully created ${framework} ${type} component: ${name}`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to create component"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles listing available templates
 */
async function handleListTemplates(args: any) {
  try {
    const result = ListTemplatesSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for listing templates"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { framework, type, includeDetails } = result.data;
    
    // Filter templates based on framework and type
    let filteredTemplates = availableTemplates;
    
    if (framework) {
      filteredTemplates = filteredTemplates.filter(key => key.startsWith(`${framework}-`));
    }
    
    if (type) {
      filteredTemplates = filteredTemplates.filter(key => key.includes(`-${type}`));
    }
    
    // Prepare result
    const templatesList = filteredTemplates.map(key => {
      const template = templates[key];
      const parts = key.split('-');
      
      const templateInfo: any = {
        id: key,
        framework: template.framework,
        type: template.type
      };
      
      if (includeDetails) {
        templateInfo.hasStyles = !!template.styles;
        templateInfo.hasTests = !!template.tests;
        templateInfo.description = `${template.framework} ${template.type} component`;
      }
      
      return templateInfo;
    });
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          templates: templatesList,
          count: templatesList.length,
          detected: detectedFramework,
          message: `Found ${templatesList.length} component templates`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to list templates"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles adding a component part (styles, tests, etc.)
 */
async function handleAddComponentPart(args: any) {
  try {
    const result = AddComponentPartSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for adding component part"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { componentPath, part, content, overwrite } = result.data;
    
    // Check if component exists
    if (!fsSync.existsSync(componentPath)) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: `Component not found at path: ${componentPath}`,
            message: "Failed to add component part"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // Determine component properties
    const componentDir = path.dirname(componentPath);
    const componentExt = path.extname(componentPath);
    const componentName = path.basename(componentPath, componentExt);
    
    // Determine framework from extension or content
    let framework: SupportedFramework = 'react';
    
    if (componentExt === '.vue') {
      framework = 'vue';
    } else if (componentExt === '.svelte') {
      framework = 'svelte';
    } else if (componentPath.includes('.component.')) {
      framework = 'angular';
    } else {
      // Try to detect from content
      const componentContent = await fs.readFile(componentPath, 'utf8');
      
      if (componentContent.includes('<template>')) {
        framework = 'vue';
      } else if (componentContent.includes('@Component')) {
        framework = 'angular';
      } else if (componentContent.includes('export default function')) {
        framework = 'react';
      }
    }
    
    // Generate file path for the part
    let partPath = '';
    let partContent = '';
    
    const kebabName = convertCase(componentName.replace(/Component$/, ''), 'kebab');
    
    switch (part) {
      case 'styles':
        // Determine style extension
        const styleExt = detectedFramework.styling.includes('sass') ? '.scss' :
                          framework === 'angular' ? '.css' : '.css';
        
        partPath = framework === 'angular'
          ? path.join(componentDir, `${kebabName}.component${styleExt}`)
          : path.join(componentDir, `${componentName}${styleExt}`);
        
        partContent = content || `.${componentName} {
  display: block;
  margin: 0;
  padding: 0;
}

.${componentName}__content {
  margin-top: 16px;
}`;
        break;
        
      case 'tests':
        const testExt = detectedFramework.typescript ? '.test.tsx' : '.test.jsx';
        
        partPath = framework === 'angular'
          ? path.join(componentDir, `${kebabName}.component.spec.ts`)
          : path.join(componentDir, `${componentName}${testExt}`);
        
        // Generate test content based on framework
        partContent = content || createTestContent(componentName, framework);
        break;
        
      case 'stories':
        const storyExt = detectedFramework.typescript ? '.stories.tsx' : '.stories.jsx';
        
        partPath = path.join(componentDir, `${componentName}${storyExt}`);
        
        // Generate story content
        partContent = content || createStoryContent(componentName, framework);
        break;
        
      case 'types':
        partPath = path.join(componentDir, `${componentName}.types.ts`);
        
        // Generate types content
        partContent = content || `export interface ${componentName}Props {
  /**
   * The title to display in the component
   * @default 'Default Title'
   */
  title?: string;
  
  /**
   * CSS class name to apply to the component root
   */
  className?: string;
  
  /**
   * Children elements to render inside the component
   */
  children?: React.ReactNode;
}`;
        break;
    }
    
    // Check if part file already exists
    if (fsSync.existsSync(partPath) && !overwrite) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: `File already exists at ${partPath}. Use 'overwrite: true' to replace it.`,
            message: "Failed to add component part"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // Write the part file
    await fs.writeFile(partPath, partContent);
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          componentName,
          partType: part,
          partPath,
          framework,
          message: `Successfully added ${part} to ${componentName} component`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to add component part"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Create test content for a component
 */
function createTestContent(componentName: string, framework: SupportedFramework): string {
  switch (framework) {
    case 'react':
      return `import React from 'react';
import { render, screen } from '@testing-library/react';
import ${componentName} from './${componentName}';

describe('${componentName} Component', () => {
  it('renders with default title', () => {
    render(<${componentName} />);
    expect(screen.getByText('Default Title')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<${componentName} title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <${componentName}>
        <p>Test Content</p>
      </${componentName}>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});`;

    case 'vue':
      return `import { mount } from '@vue/test-utils';
import ${componentName} from './${componentName}.vue';

describe('${componentName}', () => {
  it('renders with default title', () => {
    const wrapper = mount(${componentName});
    expect(wrapper.text()).toContain('Default Title');
  });

  it('renders with custom title', () => {
    const wrapper = mount(${componentName}, {
      props: {
        title: 'Custom Title'
      }
    });
    expect(wrapper.text()).toContain('Custom Title');
  });

  it('renders slot content', () => {
    const wrapper = mount(${componentName}, {
      slots: {
        default: '<p>Test Content</p>'
      }
    });
    expect(wrapper.text()).toContain('Test Content');
  });
});`;

    case 'angular':
      return `import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ${componentName}Component } from './${convertCase(componentName, 'kebab')}.component';

describe('${componentName}Component', () => {
  let component: ${componentName}Component;
  let fixture: ComponentFixture<${componentName}Component>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ${componentName}Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(${componentName}Component);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render default title', () => {
    expect(element.textContent).toContain('Default Title');
  });

  it('should render custom title', () => {
    component.title = 'Custom Title';
    fixture.detectChanges();
    expect(element.textContent).toContain('Custom Title');
  });
});`;

    case 'svelte':
      return `import { render, fireEvent } from '@testing-library/svelte';
import ${componentName} from './${componentName}.svelte';

describe('${componentName} Component', () => {
  it('renders with default title', () => {
    const { getByText } = render(${componentName});
    expect(getByText('Default Title')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    const { getByText } = render(${componentName}, { props: { title: 'Custom Title' } });
    expect(getByText('Custom Title')).toBeInTheDocument();
  });
  
  it('increments count when button is clicked', async () => {
    const { getByText } = render(${componentName});
    expect(getByText('Count: 0')).toBeInTheDocument();
    
    await fireEvent.click(getByText('Increment'));
    expect(getByText('Count: 1')).toBeInTheDocument();
  });
});`;

    default:
      return `// Tests for ${framework} not supported yet`;
  }
}

/**
 * Handles analyzing a component
 */
async function handleAnalyzeComponent(args: any) {
  try {
    const result = AnalyzeComponentSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for analyzing component"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { path: componentPath, detectDependencies, suggestImprovements } = result.data;
    
    // Check if component exists
    if (!fsSync.existsSync(componentPath)) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: `Component not found at path: ${componentPath}`,
            message: "Failed to analyze component"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // Read component content
    const componentContent = await fs.readFile(componentPath, 'utf8');
    
    // Get basic component info
    const componentExt = path.extname(componentPath);
    const componentName = path.basename(componentPath, componentExt);
    const directory = path.dirname(componentPath);
    
    // Determine component framework
    let framework: SupportedFramework = 'react';
    
    if (componentExt === '.vue') {
      framework = 'vue';
    } else if (componentExt === '.svelte') {
      framework = 'svelte';
    } else if (componentPath.includes('.component.')) {
      framework = 'angular';
    } else if (componentContent.includes('<template>')) {
      framework = 'vue';
    } else if (componentContent.includes('@Component')) {
      framework = 'angular';
    }
    
    // Analyze the component
    const analysis: any = {
      name: componentName,
      path: componentPath,
      framework,
      extension: componentExt,
      isTypeScript: componentExt === '.tsx' || componentExt === '.ts',
      size: componentContent.length,
      lines: componentContent.split('\n').length
    };
    
    // Check for related files
    const relatedFiles = [];
    
    const possibleExtensions = [
      '.css', '.scss', '.less', '.sass',
      '.test.js', '.test.jsx', '.test.ts', '.test.tsx', '.spec.js', '.spec.ts',
      '.stories.js', '.stories.jsx', '.stories.ts', '.stories.tsx',
      '.types.ts', '.d.ts'
    ];
    
    for (const ext of possibleExtensions) {
      const filePath = path.join(directory, `${componentName}${ext}`);
      if (fsSync.existsSync(filePath)) {
        relatedFiles.push(filePath);
      }
    }
    
    analysis.relatedFiles = relatedFiles;
    
    // Detect dependencies
    if (detectDependencies) {
      const dependencies = new Set<string>();
      
      // Extract imports
      const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+[^;]*|[^;]*)\s+from\s+['"]([^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(componentContent)) !== null) {
        dependencies.add(match[1]);
      }
      
      // Extract requires
      const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
      while ((match = requireRegex.exec(componentContent)) !== null) {
        dependencies.add(match[1]);
      }
      
      analysis.dependencies = Array.from(dependencies);
    }
    
    // Suggest improvements
    if (suggestImprovements) {
      const suggestions = [];
      
      // Check for large component
      if (analysis.lines > 200) {
        suggestions.push({
          type: 'structure',
          message: 'Consider breaking this component into smaller subcomponents',
          severity: 'medium'
        });
      }
      
      // Check for missing prop types/interface
      if (analysis.isTypeScript) {
        if (!componentContent.includes('interface') && !componentContent.includes('type ')) {
          suggestions.push({
            type: 'typescript',
            message: 'Add a TypeScript interface or type for component props',
            severity: 'medium'
          });
        }
      } else if (framework === 'react' && !componentContent.includes('propTypes')) {
        suggestions.push({
          type: 'props',
          message: 'Add PropTypes validation for component props',
          severity: 'medium'
        });
      }
      
      // Check for test file
      const hasTests = relatedFiles.some(file => file.includes('.test.') || file.includes('.spec.'));
      if (!hasTests) {
        suggestions.push({
          type: 'testing',
          message: 'Add unit tests for this component',
          severity: 'low'
        });
      }
      
      analysis.suggestions = suggestions;
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          analysis,
          message: `Successfully analyzed ${componentName} component`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to analyze component"
        }, null, 2)
      }],
      isError: true
    };
  }
}