import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pug from 'pug';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function renderTemplate(template: string, data: object): string {
  const candidatePaths = [
    path.join(__dirname, 'templates', `${template}.pug`),
    path.join(
      process.cwd(),
      'src',
      'services',
      'mail',
      'templates',
      `${template}.pug`,
    ),
    path.join(
      process.cwd(),
      'dist',
      'services',
      'mail',
      'templates',
      `${template}.pug`,
    ),
  ];

  const filePath =
    candidatePaths.find((p) => fs.existsSync(p)) || candidatePaths[0];

  return pug.renderFile(filePath, data);
}
