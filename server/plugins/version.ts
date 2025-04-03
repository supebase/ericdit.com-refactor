import { writeFileSync } from "fs";
import { resolve } from "path";

export default defineNitroPlugin(() => {
  // 生成随机版本号
  const version = Date.now().toString();

  // 创建版本文件
  const versionData = JSON.stringify({ version });

  // 写入到 public 目录
  writeFileSync(resolve("./public/version.json"), versionData);
});
