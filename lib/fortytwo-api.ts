/**
 * 42 API client using Client Credentials flow for server-side requests.
 * Used for fetching public data like projects, users who completed projects, etc.
 */

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

/**
 * Gets a valid access token using client credentials flow.
 * Caches the token until it expires.
 */
async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60000) {
    return tokenCache.accessToken;
  }

  const clientId = process.env.FORTYTWO_CLIENT_ID;
  const clientSecret = process.env.FORTYTWO_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("42 API credentials not configured");
  }

  const response = await fetch("https://api.intra.42.fr/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Failed to get 42 API token:", error);
    throw new Error("Failed to authenticate with 42 API");
  }

  const data = await response.json();

  // Cache the token (expires_in is in seconds)
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

/**
 * Makes an authenticated request to the 42 API.
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken();

  const response = await fetch(`https://api.intra.42.fr${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`42 API error (${endpoint}):`, error);
    throw new Error(`42 API request failed: ${response.status}`);
  }

  return response.json();
}

// ============= TYPE DEFINITIONS =============

export interface FortyTwoProject {
  id: number;
  name: string;
  slug: string;
  description?: string;
  tier?: number;
  difficulty?: number;
  duration?: number;
  exam: boolean;
  parent?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  children?: {
    id: number;
    name: string;
    slug: string;
  }[];
  objectives?: string[];
  skills?: {
    id: number;
    name: string;
    level: number;
  }[];
  created_at?: string;
  updated_at?: string;
}

export interface FortyTwoProjectSession {
  id: number;
  solo: boolean;
  begin_at: string | null;
  end_at: string | null;
  estimate_time: number | null;
  difficulty: number | null;
  objectives: string[];
  description: string;
  duration_days: number | null;
  terminating_after: number | null;
  project_id: number;
  campus_id: number | null;
  cursus_id: number | null;
  created_at: string;
  updated_at: string;
  max_people: number | null;
  is_subscriptable: boolean;
  scales: unknown[];
  uploads: unknown[];
  team_behaviour: string;
  project: FortyTwoProject;
}

export interface FortyTwoUser {
  id: number;
  login: string;
  email?: string;
  first_name: string;
  last_name: string;
  usual_full_name?: string;
  image?: {
    link: string;
    versions: {
      large: string;
      medium: string;
      small: string;
      micro: string;
    };
  };
  pool_month?: string;
  pool_year?: string;
  location?: string | null;
  correction_point?: number;
  wallet?: number;
  cursus_users?: {
    id: number;
    grade: string | null;
    level: number;
    cursus_id: number;
    cursus: {
      id: number;
      name: string;
      slug: string;
    };
  }[];
  campus?: {
    id: number;
    name: string;
    country: string;
  }[];
}

export interface FortyTwoProjectUser {
  id: number;
  occurrence: number;
  final_mark: number | null;
  status: string;
  validated?: boolean;
  current_team_id: number | null;
  project: FortyTwoProject;
  cursus_ids: number[];
  marked_at: string | null;
  marked: boolean;
  retriable_at: string | null;
  created_at: string;
  updated_at: string;
  user: FortyTwoUser;
}

// ============= API FUNCTIONS =============

/**
 * Fetches all projects for a given cursus.
 * The main 42 cursus is typically cursus_id=21 (42cursus).
 */
export async function getProjects(
  cursusId: number = 21,
  page: number = 1,
  perPage: number = 100
): Promise<FortyTwoProject[]> {
  return apiRequest<FortyTwoProject[]>(
    `/v2/cursus/${cursusId}/projects?page[number]=${page}&page[size]=${perPage}&sort=name`
  );
}

/**
 * Fetches all projects (paginated, across all cursus).
 */
export async function getAllProjects(
  page: number = 1,
  perPage: number = 100
): Promise<FortyTwoProject[]> {
  return apiRequest<FortyTwoProject[]>(
    `/v2/projects?page[number]=${page}&page[size]=${perPage}&sort=name`
  );
}

/**
 * Fetches a single project by ID.
 */
export async function getProject(projectId: number): Promise<FortyTwoProject> {
  return apiRequest<FortyTwoProject>(`/v2/projects/${projectId}`);
}

/**
 * Fetches a single project by slug.
 */
export async function getProjectBySlug(
  slug: string
): Promise<FortyTwoProject | null> {
  try {
    const projects = await apiRequest<FortyTwoProject[]>(
      `/v2/projects?filter[slug]=${encodeURIComponent(slug)}`
    );
    return projects[0] || null;
  } catch {
    return null;
  }
}

/**
 * Fetches project sessions for a project.
 * This gives more detailed info like difficulty/XP per campus.
 */
export async function getProjectSessions(
  projectId: number
): Promise<FortyTwoProjectSession[]> {
  return apiRequest<FortyTwoProjectSession[]>(
    `/v2/projects/${projectId}/project_sessions?page[size]=100`
  );
}

/**
 * Fetches users who completed a project.
 * Can filter by campus for location-based filtering.
 */
export async function getProjectUsers(
  projectId: number,
  options: {
    page?: number;
    perPage?: number;
    campusId?: number;
    validated?: boolean;
  } = {}
): Promise<FortyTwoProjectUser[]> {
  const { page = 1, perPage = 30, campusId, validated = true } = options;

  let endpoint = `/v2/projects/${projectId}/projects_users?page[number]=${page}&page[size]=${perPage}`;

  // Filter by validation status
  if (validated) {
    endpoint += "&filter[validated]=true";
  }

  // Filter by campus if provided
  if (campusId) {
    endpoint += `&filter[campus]=${campusId}`;
  }

  // Sort by most recent completion
  endpoint += "&sort=-marked_at";

  return apiRequest<FortyTwoProjectUser[]>(endpoint);
}

/**
 * Fetches all campuses.
 */
export async function getCampuses(): Promise<
  { id: number; name: string; country: string }[]
> {
  return apiRequest(`/v2/campus?page[size]=100&sort=name`);
}

/**
 * Search projects by name.
 */
export async function searchProjects(
  query: string,
  cursusId: number = 21
): Promise<FortyTwoProject[]> {
  return apiRequest<FortyTwoProject[]>(
    `/v2/cursus/${cursusId}/projects?filter[name]=${encodeURIComponent(
      query
    )}&page[size]=50`
  );
}
