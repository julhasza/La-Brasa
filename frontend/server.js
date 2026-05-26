const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5500;
const HOST = '127.0.0.1';
const ROOT = __dirname;

const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.eot': 'application/vnd.ms-fontobject'
};

function resolverArquivo(url) {
    const caminhoUrl = decodeURIComponent(url.split('?')[0]);
    const caminho = caminhoUrl === '/' ? '/login.html' : caminhoUrl;
    const arquivo = path.resolve(ROOT, `.${caminho}`);
    return arquivo.startsWith(ROOT) ? arquivo : null;
}

const server = http.createServer((req, res) => {
    const arquivo = resolverArquivo(req.url);

    if (!arquivo) {
        res.writeHead(403);
        res.end('Acesso negado.');
        return;
    }

    fs.readFile(arquivo, (error, conteudo) => {
        if (error) {
            res.writeHead(404);
            res.end('Arquivo não encontrado.');
            return;
        }

        const contentType = contentTypes[path.extname(arquivo).toLowerCase()] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(conteudo);
    });
});

server.listen(PORT, HOST, () => {
    console.log(`Frontend rodando em http://${HOST}:${PORT}/home.html`);
});
