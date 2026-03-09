import { NextResponse } from 'next/server';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    const zip = new AdmZip();
    const rootDir = process.cwd();

    // Pastas e arquivos que queremos incluir (ignorando node_modules, .next, etc)
    const includePaths = [
      'app',
      'components',
      'lib',
      'public',
      'package.json',
      'tsconfig.json',
      'postcss.config.mjs',
      'tailwind.config.ts',
      'next.config.ts',
      '.env.example'
    ];

    for (const item of includePaths) {
      const itemPath = path.join(rootDir, item);
      if (fs.existsSync(itemPath)) {
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory()) {
          zip.addLocalFolder(itemPath, item);
        } else {
          zip.addLocalFile(itemPath);
        }
      }
    }

    const zipBuffer = zip.toBuffer();

    return new NextResponse(zipBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="marmoraria-landing-page.zip"',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar o ZIP:', error);
    return NextResponse.json({ error: 'Erro ao gerar o arquivo ZIP' }, { status: 500 });
  }
}
