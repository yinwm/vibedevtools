import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function readTemplate(
  templateName: string, 
  variables: Record<string, string> = {}
): Promise<string> {
  // 从 src/utils 向上两级到项目根目录，然后进入 templates
  const templatePath = join(__dirname, '../../templates', templateName);
  console.error(`[MCP] Reading template: ${templatePath}`);
  
  let content = await readFile(templatePath, 'utf-8');
  
  // 替换变量
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    content = content.replace(regex, value);
  });
  
  return content;
}