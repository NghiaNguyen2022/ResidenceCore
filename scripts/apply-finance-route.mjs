#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();

function findFirstExisting(paths) {
  return paths.find((relativePath) => fs.existsSync(path.join(root, relativePath)));
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function write(relativePath, content) {
  fs.writeFileSync(path.join(root, relativePath), content, 'utf8');
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

function insertBeforeFirst(content, patterns, insertText) {
  if (content.includes(insertText.trim())) return content;

  for (const pattern of patterns) {
    const index = content.search(pattern);
    if (index >= 0) {
      return `${content.slice(0, index)}${insertText}\n${content.slice(index)}`;
    }
  }

  return `${content}\n${insertText}\n`;
}

function patchAppRoute() {
  const appPath = findFirstExisting([
    'src/App.tsx',
    'src/App.jsx',
    'src/app.tsx',
    'src/routes.tsx',
    'src/router.tsx',
    'src/Routes.tsx',
    'client/src/App.tsx',
    'client/src/routes.tsx',
  ]);

  if (!appPath) {
    console.log('[finance-route] Không tìm thấy App/routes file. Bỏ qua App route.');
    return false;
  }

  let content = read(appPath);

  if (content.includes('path="/finance"') || content.includes("path='/finance'")) {
    console.log(`[finance-route] ${appPath} đã có /finance.`);
    return true;
  }

  content = ensureImport(content, "import FinanceLite from '@/pages/FinanceLite';");

  const routeLine = '      <Route path="/finance" component={FinanceLite} />';

  content = insertBeforeFirst(
    content,
    [
      /<Route\s+component=\{NotFound\}\s*\/>/,
      /<Route\s+path=["']\*["']/,
      /<Route\s+path=["']\/:rest\*["']/,
      /<Route\s+path=["']\/404["']/,
      /<NotFound\s*\/>/,
    ],
    routeLine
  );

  write(appPath, content);
  console.log(`[finance-route] Đã cập nhật route /finance trong ${appPath}.`);
  return true;
}

function patchFinanceMenu() {
  const navPath = findFirstExisting([
    'src/navigation/managerNavigation.ts',
    'client/src/navigation/managerNavigation.ts',
  ]);

  if (!navPath) {
    console.log('[finance-route] Không tìm thấy managerNavigation.ts. Bỏ qua menu.');
    return false;
  }

  let content = read(navPath);

  if (content.includes('path: "/finance"') || content.includes("path: '/finance'")) {
    console.log(`[finance-route] ${navPath} đã có menu /finance.`);
    return true;
  }

  const financeItem = `                  {
                        label: "Tài chính lưu xá",
                        path: "/finance",
                        icon: "💰",
                        roles: ["manager"],
                  },`;

  const organizationBlock = `                  {
                        label: "Tổ chức lưu xá",
                        path: "/organization",
                        icon: "🏛️",
                        roles: ["manager"],
                  },`;

  if (content.includes(organizationBlock)) {
    content = content.replace(organizationBlock, `${organizationBlock}\n${financeItem}`);
  } else {
    const financialGroup = `      {
            label: "Tài chính",
            icon: "💰",
            roles: ["manager"],
            children: [`;

    if (content.includes(financialGroup)) {
      content = content.replace(financialGroup, `${financialGroup}\n${financeItem}`);
    } else {
      console.log('[finance-route] Không tìm thấy vị trí menu phù hợp. Bỏ qua menu.');
      return false;
    }
  }

  write(navPath, content);
  console.log(`[finance-route] Đã cập nhật menu /finance trong ${navPath}.`);
  return true;
}

function patchTrpcRouter() {
  const routerPath = findFirstExisting([
    'server/routers/index.ts',
    'server/routers/_app.ts',
    'server/router.ts',
    'server/routers/root.ts',
    'src/server/routers/index.ts',
    'src/server/routers/_app.ts',
  ]);

  if (!routerPath) {
    console.log('[finance-route] Không tìm thấy root tRPC router. Bỏ qua finance router.');
    return false;
  }

  let content = read(routerPath);

  if (content.includes('finance: financeRouter')) {
    console.log(`[finance-route] ${routerPath} đã có finance router.`);
    return true;
  }

  content = ensureImport(content, "import { financeRouter } from './modules/finance';");

  const routerObjectPattern = /router\(\s*\{/m;
  const match = content.match(routerObjectPattern);

  if (!match || match.index === undefined) {
    console.log(`[finance-route] Không tìm thấy router({}) trong ${routerPath}. Bỏ qua finance router.`);
    return false;
  }

  const insertAt = match.index + match[0].length;
  content = `${content.slice(0, insertAt)}\n      finance: financeRouter,${content.slice(insertAt)}`;

  write(routerPath, content);
  console.log(`[finance-route] Đã cập nhật finance router trong ${routerPath}.`);
  return true;
}

patchFinanceMenu();
patchAppRoute();
patchTrpcRouter();

console.log('[finance-route] Hoàn tất. Nếu dev server đang chạy, hãy restart lại.');
