export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  path: string;
  branch: string;
}

export const getGitHubConfig = (): GitHubConfig => {
  // Nutzt VITE_ Variablen von Vercel oder Fallback für lokale Entwicklung
  return {
    token: import.meta.env.VITE_GITHUB_TOKEN || '',
    owner: import.meta.env.VITE_GITHUB_OWNER || '',
    repo: import.meta.env.VITE_GITHUB_REPO || '',
    path: 'wochenprogramm.txt',
    branch: 'main',
  };
};

export const saveGitHubConfig = (_config: GitHubConfig) => {
  // In der neuen Struktur nicht mehr für Persistenz nötig, da Vercel die Quelle ist
};

const getHeaders = (token?: string) => {
  const headers: any = {
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
  if (token && token.trim() !== '') {
    headers['Authorization'] = `token ${token}`;
  }
  return headers;
};

const utf8_to_b64 = (str: string) => {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_match, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));
};

const b64_to_utf8 = (str: string) => {
  try {
    return decodeURIComponent(Array.prototype.map.call(atob(str), (c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  } catch (e) {
    return atob(str);
  }
};

export const fetchFileFromGitHub = async (config: GitHubConfig, specificPath?: string) => {
  const filePath = specificPath || config.path;
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}?ref=${config.branch}`;
  
  try {
    const response = await fetch(url, { headers: getHeaders(config.token) });
    if (!response.ok) {
      if (response.status === 404) return { content: '', sha: null };
      throw new Error(`GitHub Status ${response.status}`);
    }
    const data = await response.json();
    const content = b64_to_utf8(data.content);
    return { content, sha: data.sha };
  } catch (error) {
    console.error("Fetch Error:", error);
    throw error;
  }
};

export const updateFileOnGitHub = async (config: GitHubConfig, content: string, sha: string | null, specificPath?: string) => {
  const filePath = specificPath || config.path;
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`;
  
  const body = {
    message: `Admin Update: ${new Date().toLocaleString('de-DE')}`,
    content: utf8_to_b64(content),
    branch: config.branch,
    sha: sha || undefined,
  };

  const response = await fetch(url, {
    method: 'PUT',
    headers: getHeaders(config.token),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Speichern fehlgeschlagen');
  }
  return await response.json();
};