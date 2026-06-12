#!/usr/bin/env node

// Genera public/llms.txt (guía para motores generativos, según llmstxt.org)
// y public/sitemap.xml a partir del catálogo PUBLIC_PAGES. Corre antes de
// `vite build` (ver package.json) para que ambos artefactos lleguen al deploy.

import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://aksha.life';

const EXTRACTION_REGEX = {
	route: /<Route\s+[^>]*>/g,
	path: /path=["']([^"']+)["']/,
	element: /element=\{<(\w+)[^}]*\/?\s*>\}/,
};

// Rutas que no aportan a buscadores ni a motores generativos: privadas,
// transaccionales o de autenticación. Se excluyen de llms.txt y sitemap.xml.
const PRIVATE_ROUTES = new Set([
	'/dashboard', '/checkout', '/payment-success', '/thank-you', '/login', '/signup',
]);

// Catálogo editorial de páginas públicas: única fuente para llms.txt y
// sitemap.xml. Los títulos de las páginas son expresiones JSX dinámicas
// (bilingües), imposibles de extraer con fiabilidad por regex, así que aquí
// se mantienen las versiones canónicas. Si App.jsx gana una ruta pública
// nueva que no esté aquí, el build lo avisa por consola.
const PUBLIC_PAGES = [
	{
		url: '/',
		title: 'AKSHA LIFE — Mapa de Propósito',
		description: 'Descubre quién eres realmente: AKSHA LIFE sintetiza neurociencia, psicología, arquetipos y cronobiología en un mapa claro de tus talentos naturales, fortalezas y propósito.',
	},
	{
		url: '/science',
		title: 'La Ciencia detrás de AKSHA LIFE',
		description: 'Las disciplinas que fundamentan el Mapa de Propósito: neurociencia, psicología, arquetipos y cronobiología, sintetizadas alrededor de una sola persona.',
	},
	{
		url: '/sample-analysis',
		title: 'Análisis de Ejemplo — AKSHA',
		description: 'Un Mapa de Propósito real de ejemplo: la estructura, la profundidad y el tipo de hallazgos que recibe cada persona.',
	},
	{
		url: '/discover',
		title: 'Descubre tu Propósito — AKSHA',
		description: 'Introduce tu fecha de nacimiento y recibe un mapa claro de tus talentos naturales, fortalezas y propósito.',
	},
	{
		url: '/pricing',
		title: 'Precios — Mapa de Propósito AKSHA',
		description: 'Mapa de Propósito personalizado por un pago único de 47 USD (precio fundador). Sin suscripciones.',
	},
	{
		url: '/why-we-exist',
		title: 'Por Qué Existimos — AKSHA LIFE',
		description: 'La misión de AKSHA LIFE: mientras la IA lo transforma todo, revelamos lo único que no puede reemplazar — quién eres tú.',
	},
];

function extractRoutes(appJsxPath) {
	if (!fs.existsSync(appJsxPath)) return new Map();

	try {
		const content = fs.readFileSync(appJsxPath, 'utf8');
		const routes = new Map();
		const routeMatches = [...content.matchAll(EXTRACTION_REGEX.route)];

		for (const match of routeMatches) {
			const routeTag = match[0];
			const pathMatch = routeTag.match(EXTRACTION_REGEX.path);
			const elementMatch = routeTag.match(EXTRACTION_REGEX.element);
			const isIndex = routeTag.includes('index');

			if (elementMatch) {
				const componentName = elementMatch[1];
				let routePath;

				if (isIndex) {
					routePath = '/';
				} else if (pathMatch) {
					routePath = pathMatch[1].startsWith('/') ? pathMatch[1] : `/${pathMatch[1]}`;
				}

				routes.set(componentName, routePath);
			}
		}

		return routes;
	} catch (error) {
		return new Map();
	}
}

function generateLlmsTxt(pages) {
	const sortedPages = pages.sort((a, b) => a.title.localeCompare(b.title));
	const pageEntries = sortedPages.map(page =>
		`- [${page.title}](${SITE_URL}${page.url}): ${page.description}`
	).join('\n');

	return `# AKSHA LIFE

> Sistema de mapeo de propósito basado en ciencia del comportamiento.
> AKSHA LIFE sintetiza neurociencia, psicología, arquetipos y cronobiología
> en un Mapa de Propósito personalizado: talentos naturales, fortalezas y
> un plan de acción claro. Disponible en español e inglés.

Sitio: ${SITE_URL}
Contacto: Purpose@aksha.life

## Pages
${pageEntries}
`;
}

function generateSitemapXml(pages) {
	const lastmod = new Date().toISOString().slice(0, 10);
	const routePriority = (url) => (url === '/' ? '1.0' : '0.8');

	const urls = pages
		.sort((a, b) => a.url.localeCompare(b.url))
		.map(page => `  <url>
    <loc>${SITE_URL}${page.url === '/' ? '/' : page.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${routePriority(page.url)}</priority>
  </url>`)
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function ensureDirectoryExists(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}

function main() {
	const appJsxPath = path.join(process.cwd(), 'src', 'App.jsx');

	// Detecta rutas públicas presentes en el router pero ausentes del catálogo,
	// para que el llms.txt/sitemap no se queden atrás en silencio.
	const routerPaths = new Set([...extractRoutes(appJsxPath).values()].filter(Boolean));
	const knownPaths = new Set(PUBLIC_PAGES.map(p => p.url));
	for (const routePath of routerPaths) {
		if (!PRIVATE_ROUTES.has(routePath) && !knownPaths.has(routePath)) {
			console.warn(`⚠️ Ruta pública sin entrada en PUBLIC_PAGES (tools/generate-llms.js): ${routePath}`);
		}
	}

	const publicDir = path.join(process.cwd(), 'public');
	ensureDirectoryExists(publicDir);

	fs.writeFileSync(path.join(publicDir, 'llms.txt'), generateLlmsTxt([...PUBLIC_PAGES]), 'utf8');
	fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), generateSitemapXml([...PUBLIC_PAGES]), 'utf8');
	console.log(`✅ llms.txt y sitemap.xml generados (${PUBLIC_PAGES.length} páginas públicas)`);
}

const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
	main();
}
