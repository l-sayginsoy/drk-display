export const getGitHubConfig = (): GitHubConfig => {
  return {
    // Diese Befehle sagen dem Programm: "Schau in den Vercel-Tresor"
    token: import.meta.env.VITE_GITHUB_TOKEN || '',
    owner: import.meta.env.VITE_GITHUB_OWNER || '',
    repo: import.meta.env.VITE_GITHUB_REPO || '',
    path: 'wochenprogramm.txt',
    branch: 'main',
  };
};