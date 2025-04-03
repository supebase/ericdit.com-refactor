import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { resolve, dirname } from "path";

export default defineNitroPlugin(() => {
  // 只在生产构建时生成版本文件
  if (process.env.NODE_ENV !== "production" || process.env.NITRO_PRESET === "node-server") {
    return;
  }

  console.log("Version plugin is running...");

  try {
    // 读取 package.json 中的版本号
    const packagePath = resolve(process.cwd(), "package.json");
    console.log("Reading package.json from:", packagePath);

    const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));
    const buildTime = new Date().toISOString();
    const version = {
      version: packageJson.version,
      buildTime,
      fullVersion: `${packageJson.version}-${buildTime.split("T")[0]}`,
    };

    // 创建版本文件
    const versionData = JSON.stringify(version, null, 2);

    // 确保目标目录存在
    const versionFilePath = resolve(process.cwd(), "public/version.json");
    console.log("Writing version file to:", versionFilePath);

    const targetDir = dirname(versionFilePath);

    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    // 写入到 public 目录
    writeFileSync(versionFilePath, versionData);
    console.log("Version file generated successfully");
  } catch (error) {
    console.error("Error generating version file:", error);
  }
});
