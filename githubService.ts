export const getGitHubConfig = (): GitHubConfig => {
  return {
    token: import.meta.env.VITE_GITHUB_TOKEN || '',
    owner: import.meta.env.VITE_GITHUB_OWNER || '',
    repo: import.meta.env.VITE_GITHUB_REPO || '',
    path: 'wochenprogramm.txt',
    branch: 'main',
  };
};