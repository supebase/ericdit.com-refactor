export interface GitHubProjectInfo {
    owner: string;
    repo: string;
    title: string;
    stage?: string | null;
    description: string | null;
    prNumber?: number | null;
    prAuthor: string;
    avatarUrl: string;
    projectAuthor: string;
    projectAvatarUrl: string;
    projectDescription: string;
    projectUpdatedAt: string | null;
    forksCount: number;
    stargazersCount: number;
    watchersCount: number;
    mainLanguage?: string | null;
}