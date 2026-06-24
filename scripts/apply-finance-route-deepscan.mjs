#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  '.turbo',
]);

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(item.name)) continue;

    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      walk(full, files);
      continue;
    }

    if (/\.(tsx|ts|jsx|js)$/.test(item.name)) {
      files.push(full);
    }
  }

  return files;
}

function rel(fullPath) {
  return path.relative(root, fullPath).replace(/\\/g, '/');
}

function read(fullPath) {
  return fs.readFileSync(fullPath, 'utf8');
}

function write(fullPath, content) {
  fs.writeFileSync(fullPath, content, 'utf8');
}

function ensureImport(content, importLine) {
  if (content.includes(importLine)) return content;

  const importMatches = [...content.matchAll(/^import .*?;$/gm)];
  if (importMatches.length === 0) {
    return `${importLine}\n${content}`;
  }

  const lastImport = importMatches[importMatches.length - 1];
  const insertAt = lastImport.index + lastImport[0].length;

  return `${content.slice(0, insertAt)}\n${importLine}${content.slice(insertAt)}`;
}

function hasFinanceRoute(content) {
  return (
    content.includes('path="/finance"') ||
    content.includes("path='/finance'") ||
    content.includes('path: "/finance"') ||
    content.includes("path: '/finance'")
  );
}

function patchWouterOrComponentRoute(content) {
  const routeLine = '      <Route path="/finance" component={FinanceLite} />';

  const patterns = [
    /<Route\s+component=\{NotFound\}\s*\/>/,
    /<Route\s+component=\{PageNotFound\}\s*\/>/,
    /<Route\s+path=["']\*["'][^>]*component=\{[^}]+\}\s*\/>/,
    /<Route\s+path=["']\/:rest\*["'][^>]*\/>/,
    /<Route\s+path=["']\/404["'][^>]*\/>/,
  ];

  for (const pattern of patterns) {
    const index = content.search(pattern);
    if (index >= 0) {
      return {
        patched: true,
        content: `${content.slice(0, index)}${routeLine}\n${content.slice(index)}`,
      };
    }
  }

  return { patched: false, content };
}

function patchReactRouterV6(content) {
  const routeLine = '      <Route path="/finance" element={<FinanceLite />} />';

  const patterns = [
    /<Route\s+path=["']\*["']\s+element=\{<[^>]+\/>\}\s*\/>/,
    /<Route\s+path=["']\/404["']\s+element=\{<[^>]+\/>\}\s*\/>/,
  ];

  for (const pattern of patterns) {
    const index = content.search(pattern);
    if (index >= 0) {
      return {
        patched: true,
        content: `${content.slice(0, index)}${routeLine}\n${content.slice(index)}`,
      };
    }
  }

  return { patched: false, content };
}

function patchRouteArray(content) {
  const financeObject = `      {
            path: "/finance",
            component: FinanceLite,
      },`;

  const arrayCatchAllPatterns = [
    /\{\s*path:\s*["']\*["'][\s\S]*?\},/,
    /\{\s*path:\s*["']\/404["'][\s\S]*?\},/,
  ];

  for (const pattern of arrayCatchAllPatterns) {
    const index = content.search(pattern);
    if (index >= 0) {
      return {
        patched: true,
        content: `${content.slice(0, index)}${financeObject}\n${content.slice(index)}`,
      };
    }
  }

  return { patched: false, content };
}

function candidateScore(content, filePath) {
  let score = 0;
  const name = rel(filePath).toLowerCase();

  if (name.includes('app.')) score += 50;
  if (name.includes('route') || name.includes('router')) score += 40;
  if (content.includes('<Route')) score += 60;
  if (content.includes('Switch')) score += 40;
  if (content.includes('Routes')) score += 25;
  if (content.includes('NotFound') || content.includes('PageNotFound')) score += 50;
  if (content.includes('404') || content.includes('Page Not Found')) score += 30;
  if (content.includes('/members') || content.includes('/organization') || content.includes('/daily-routine')) score += 80;

  return score;
}

function patchAppRouteDeepScan() {
  const files = walk(path.join(root, 'src')).concat(walk(path.join(root, 'client/src')));
  const candidates = files
    .map((file) => ({ file, content: read(file) }))
    .filter(({ content }) => !hasFinanceRoute(content))
    .map((item) => ({ ...item, score: candidateScore(item.content, item.file) }))
    .filter((item) => item.score >= 90)
    .sort((a, b) => b.score - a.score);

  console.log('[finance-route] Route candidates:');
  candidates.slice(0, 10).forEach((item) => {
    console.log(`  - ${rel(item.file)} score=${item.score}`);
  });

  for (const candidate of candidates) {
    let content = candidate.content;
    content = ensureImport(content, "import FinanceLite from '@/pages/FinanceLite';");

    let patched = patchWouterOrComponentRoute(content);
    if (!patched.patched) patched = patchReactRouterV6(content);
    if (!patched.patched) patched = patchRouteArray(content);

    if (!patched.patched) continue;

    write(candidate.file, patched.content);
    console.log(`[finance-route] Đã patch /finance vào ${rel(candidate.file)}`);
    return true;
  }

  console.log('[finance-route] Chưa patch được App route. Hãy gửi file App.tsx/routes.tsx để patch trực tiếp.');
  return false;
}

function patchMenu() {
  const files = [
    path.join(root, 'src/navigation/managerNavigation.ts'),
    path.join(root, 'client/src/navigation/managerNavigation.ts'),
  ].filter(fs.existsSync);

  if (files.length === 0) {
    console.log('[finance-route] Không tìm thấy managerNavigation.ts');
    return false;
  }

  const file = files[0];
  let content = read(file);

  if (content.includes('path: "/finance"') || content.includes("path: '/finance'")) {
    console.log(`[finance-route] Menu đã có /finance: ${rel(file)}`);
    return true;
  }

  const item = `                  {
                        label: "Tài chính lưu xá",
                        path: "/finance",
                        icon: "💰",
                        roles: ["manager"],
                  },`;

  const orgBlock = `                  {
                        label: "Tổ chức lưu xá",
                        path: "/organization",
                        icon: "🏛️",
                        roles: ["manager"],
                  },`;

  if (content.includes(orgBlock)) {
    content = content.replace(orgBlock, `${orgBlock}\n${item}`);
    write(file, content);
    console.log(`[finance-route] Đã patch menu /finance vào ${rel(file)}`);
    return true;
  }

  console.log('[finance-route] Không tìm thấy vị trí menu phù hợp.');
  return false;
}

function patchTrpcRouter() {
  const files = [
    path.join(root, 'server/routers/index.ts'),
    path.join(root, 'server/routers/_app.ts'),
    path.join(root, 'server/router.ts'),
    path.join(root, 'server/routers/root.ts'),
    path.join(root, 'src/server/routers/index.ts'),
    path.join(root, 'src/server/routers/_app.ts'),
  ].filter(fs.existsSync);

  if (files.length === 0) {
    console.log('[finance-route] Không tìm thấy root tRPC router.');
    return false;
  }

  const file = files[0];
  let content = read(file);

  if (content.includes('finance: financeRouter')) {
    console.log(`[finance-route] tRPC đã có finance router: ${rel(file)}`);
    return true;
  }

  content = ensureImport(content, "import { financeRouter } from './modules/finance';");

  const match = content.match(/router\(\s*\{/m);
  if (!match || match.index === undefined) {
    console.log(`[finance-route] Không tìm thấy router({}) trong ${rel(file)}`);
    return false;
  }

  const insertAt = match.index + match[0].length;
  content = `${content.slice(0, insertAt)}\n      finance: financeRouter,${content.slice(insertAt)}`;

  write(file, content);
  console.log(`[finance-route] Đã patch tRPC finance router vào ${rel(file)}`);
  return true;
}

patchMenu();
patchAppRouteDeepScan();
patchTrpcRouter();

console.log('[finance-route] Xong. Restart dev server rồi mở lại /finance.');
