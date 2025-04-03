import { writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";

export default defineNitroPlugin(() => {
  // 生成随机版本号
  const version = Date.now().toString();

  // 创建版本文件
  const versionData = JSON.stringify({ version });

  // 确保目标目录存在
  const versionFilePath = resolve("./public/version.json");
  const targetDir = dirname(versionFilePath);

  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  // 写入到 public 目录
  writeFileSync(versionFilePath, versionData);
});
