import fs from 'node:fs';
import path from 'node:path';

const srcTemplates = path.join(
  process.cwd(),
  'src',
  'services',
  'mail',
  'templates',
);
const distTemplates = path.join(
  process.cwd(),
  'dist',
  'services',
  'mail',
  'templates',
);

if (fs.existsSync(srcTemplates)) {
  fs.mkdirSync(distTemplates, { recursive: true });
  fs.cpSync(srcTemplates, distTemplates, { recursive: true });
  console.log('✔ Email templates copied to dist successfully');
}
