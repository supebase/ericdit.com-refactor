import { defineEventHandler } from "h3";

// 获取指定 GitHub 仓库的基本信息
async function getRepoInfo(owner: string, repo: string, headers: Record<string, string>) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!res.ok) throw new Error("获取仓库信息失败");
  return res.json();
}

// 获取指定 GitHub 仓库的 Pull Request 列表
async function getPullRequests(owner: string, repo: string, headers: Record<string, string>) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, { headers });
  // 处理 API 速率限制
  if (res.status === 403) {
    const retryAfter = res.headers.get("Retry-After");
    if (retryAfter) {
      console.warn(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
      return [];
    }
  }
  if (!res.ok) throw new Error("获取 Pull Request 信息失败");
  return res.json();
}

// 获取指定 GitHub 仓库的主要编程语言（按代码量最大判断）
async function getRepoMainLanguage(owner: string, repo: string, headers: Record<string, string>) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers });
  if (!res.ok) throw new Error("获取仓库语言信息失败");
  const languages = await res.json();
  // 取代码量最大的语言
  let mainLanguage = "N/A";
  let max = 0;
  for (const [lang, bytes] of Object.entries(languages)) {
    if (typeof bytes === "number" && bytes > max) {
      max = bytes;
      mainLanguage = lang;
    }
  }
  return mainLanguage;
}

// 事件处理器，响应前端请求，聚合并返回仓库及 PR 信息
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  // 解析请求体，获取仓库标识
  const { githubRepo } = await readBody(event);

  // 兼容 URL 或 owner/repo 格式，提取 owner 和 repo
  const urlParts = githubRepo.replace("https://github.com/", "").split("/");
  if (urlParts.length < 2) throw new Error("Invalid GitHub URL");

  const [owner, repo] = urlParts;
  // 使用私有 GitHub Token 进行 API 鉴权
  const headers = { Authorization: `token ${config.privateGitHubToken}` };

  try {
    // 并发获取 PR、仓库信息和主要语言
    const [pullData, repoData, mainLanguage] = await Promise.all([
      getPullRequests(owner, repo, headers),
      getRepoInfo(owner, repo, headers),
      getRepoMainLanguage(owner, repo, headers),
    ]);

    // 若存在 PR，则返回第一个 PR 的关键信息及仓库信息
    if (pullData.length > 0) {
      const pr = pullData[0];
      return {
        owner,
        repo,
        title: pr.title,
        prNumber: pr.number,
        stage: pr.labels.find((label: any) => label.name.includes("RFC"))?.name || "N/A",
        description: pr.body,
        prAuthor: pr.user.login,
        avatarUrl: pr.user.avatar_url,
        projectAuthor: repoData.owner.login,
        projectAvatarUrl: repoData.owner.avatar_url,
        forksCount: repoData.forks_count,
        stargazersCount: repoData.stargazers_count,
        watchersCount: repoData.subscribers_count,
        projectDescription: repoData.description,
        projectUpdatedAt: repoData.updated_at,
        mainLanguage: mainLanguage,
      };
    } else {
      // 若无 PR，则返回仓库信息及默认提示
      return {
        owner,
        repo,
        title: "未找到此存储库的拉取请求",
        prNumber: 0,
        stage: "N/A",
        description: "未找到此存储库的拉取请求",
        prAuthor: "",
        avatarUrl: "",
        projectAuthor: repoData.owner.login,
        projectAvatarUrl: repoData.owner.avatar_url,
        forksCount: repoData.forks_count,
        stargazersCount: repoData.stargazers_count,
        watchersCount: repoData.watchers_count,
        projectDescription: repoData.description,
        projectUpdatedAt: repoData.updated_at,
        mainLanguage: mainLanguage,
      };
    }
  } catch (err) {
    // 捕获并抛出异常，便于前端统一处理
    throw new Error(err instanceof Error ? err.message : "An error occurred");
  }
});
