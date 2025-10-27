export type DBProfile = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  persona?: 'dominant' | 'seductive' | 'strict' | 'caring' | null;
  gender?: 'male' | 'female' | null;
  energy?: 'masculine' | 'feminine' | null;
  onboarding_completed?: boolean | null;
  onboarding_completed_at?: string | null;
  updated_at?: string | null;
};

export type AppProfile = {
  id: string;
  firstName: string;
  lastName?: string;
  avatarUrl?: string | null;
  bio: string;
  persona: 'dominant' | 'seductive' | 'strict' | 'caring';
  gender: 'male' | 'female';
  energy: 'masculine' | 'feminine';
  onboardingCompleted: boolean;
  onboardingCompletedAt?: string | null;
  updated_at?: string | null;
};

export const mapProfileFromDB = (row?: DBProfile | null): AppProfile | null => {
  if (!row) return null;
  return {
    id: row.id,
    firstName: row.first_name ?? '',
    lastName: row.last_name ?? '',
    avatarUrl: row.avatar_url ?? null,
    bio: row.bio ?? '',
    persona: (row.persona as AppProfile['persona']) ?? 'dominant',
    gender: (row.gender as AppProfile['gender']) ?? 'male',
    energy: (row.energy as AppProfile['energy']) ?? 'masculine',
    onboardingCompleted: row.onboarding_completed ?? false,
    onboardingCompletedAt: row.onboarding_completed_at ?? null,
    updated_at: row.updated_at ?? null,
  };
};

export const mapProfileToDB = (profile?: Partial<AppProfile> | null): Partial<DBProfile> => {
  if (!profile) return {};
  return {
    first_name: profile.firstName ?? null,
    last_name: profile.lastName ?? null,
    avatar_url: profile.avatarUrl ?? null,
    bio: profile.bio ?? null,
    persona: profile.persona ?? null,
    gender: profile.gender ?? null,
    energy: profile.energy ?? null,
    onboarding_completed: profile.onboardingCompleted ?? null,
    onboarding_completed_at: profile.onboardingCompletedAt ?? null,
  };
};