import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件所在目录路径
const __dirname = dirname(fileURLToPath(import.meta.url));

// 读取 package.json 文件
const pkgPath = resolve(__dirname, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

// 解析当前版本号
let [major, minor, patch] = pkg.version.split('.').map(Number);

// 版本号递增逻辑
patch += 1; // 修订号+1
if (patch > 9) { // 修订号超过9时进位
    patch = 0;
    minor += 1;
    if (minor > 9) { // 次版本号超过9时进位
        minor = 0;
        major += 1;
    }
}

// 更新版本号并写回文件
pkg.version = `${major}.${minor}.${patch}`;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`版本更新至 ${pkg.version}`);