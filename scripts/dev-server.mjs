import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = process.argv[2] ?? '.';
const port = Number(process.env.PORT ?? 5173);
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url ?? '/', `http://${request.headers.host}`).pathname;
    const safePath = normalize(pathname).replace(/^\.\.(\/|\\|$)/, '');
    const filePath = join(root, safePath === '/' ? 'index.html' : safePath);
    const info = await stat(filePath);
    const finalPath = info.isDirectory() ? join(filePath, 'index.html') : filePath;
    const body = await readFile(finalPath);
    response.writeHead(200, { 'Content-Type': mimeTypes[extname(finalPath)] ?? 'application/octet-stream' });
    response.end(body);
  } catch {
    const body = await readFile(join(root, 'index.html'));
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(body);
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`Flexbox game running at http://localhost:${port}`);
});
