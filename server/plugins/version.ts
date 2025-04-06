import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { createHash } from "crypto";

export default defineNitroPlugin(() => {
  // 只在生产构建时生成版本文件
  if (process.dev) {
    return;
  }

  try {
    // 读取 package.json 中的版本号
    const packagePath = resolve(process.cwd(), "package.json");
    const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));
    const buildTime = new Date().toISOString();

    // 生成唯一的构建哈希值
    const buildHash = createHash("md5").update(buildTime).digest("hex").substring(0, 8);

    const version = {
      version: packageJson.version,
      buildTime,
      buildHash,
      fullVersion: `${packageJson.version}-${buildTime.split("T")[0]}-${buildHash}`,
    };

    // 创建版本文件
    const versionData = JSON.stringify(version, null, 2);

    // 确保目标目录存在
    const versionFilePath = resolve(process.cwd(), "public/version.json");

    const targetDir = dirname(versionFilePath);

    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    // 写入到 public 目录
    writeFileSync(versionFilePath, versionData);
  } catch (error) {
    console.error("Error generating version file:", error);
  }
});
