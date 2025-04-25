import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// 获取当前文件所在目录路径
const __dirname = dirname(fileURLToPath(import.meta.url));

// 读取 package.json 文件
const pkgPath = resolve(__dirname, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

// 解析当前版本号
let [major, minor, patch] = pkg.version.split(".").map(Number);

// 简单的版本号递增逻辑，选这个？
patch += 1; // 修订号+1
if (patch > 9) {
  // 修订号超过9时进位
  patch = 0;
  minor += 1;
  if (minor > 9) {
    // 次版本号超过9时进位
    minor = 0;
    major += 1;
  }
}

// 逻辑更贴合 semver 规范，支持命令行参数：major/minor/patch 还是选这个？
// node bump-version.js minor 或 major
// 或者在 package.json 中配置脚本："bump": "node bump-version.js", "bump:major": "node bump-version.js major", "bump:minor": "node bump-version.js minor"
// const type = process.argv[2] || "patch";
// switch (type) {
//   case "major":
//     major += 1;
//     minor = 0;
//     patch = 0;
//     break;
//   case "minor":
//     minor += 1;
//     patch = 0;
//     break;
//   default:
//     patch += 1;
// }

// 更新版本号并写回文件
pkg.version = `${major}.${minor}.${patch}`;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log(`版本更新至 ${pkg.version}`);
