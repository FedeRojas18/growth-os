const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/ffederojas/growth-os/main';

export async function fetchMarkdownFromGitHub(path: string): Promise<string> {
  const url = `${GITHUB_RAW_BASE}/${path}`;
  const response = await fetch(url, {
    headers: {
      'Accept': 'text/plain',
    },
    next: { revalidate: 60 } // Cache for 60 seconds
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
  }

  return response.text();
}
