import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function readTemplate(
  templateName: string, 
  variables: Record<string, string> = {}
): Promise<string> {
  // From src/utils go up two levels to the project root, then enter templates
  const templatePath = join(__dirname, '../../templates', templateName);
  console.error(`[MCP] Reading template: ${templatePath}`);
  
  let content = await readFile(templatePath, 'utf-8');
  
  // Replace variables
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\{${key}\}`, 'g');
    content = content.replace(regex, value);
  });
  
  return content;
}