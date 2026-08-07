import path from 'node:path';
import pug from 'pug';

export function renderTemplate(
  template: string,
  data: object,
): string {

  const filePath = path.join(
    process.cwd(),
    'src/services/mail/templates',
    `${template}.pug`,
  );

  return pug.renderFile(filePath, data);
}