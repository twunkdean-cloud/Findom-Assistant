import { describe, it, expect } from 'vitest';
import { mapProfileFromDB, mapProfileToDB } from '@/services/profile-mapper';

describe('profile mapper', () => {
  it('maps DB snake_case to camelCase with defaults', () => {
    const dbRow = {
      id: 'uuid-123',
      first_name: 'Jane',
      last_name: 'Doe',
      avatar_url: 'http://example.com/a.png',
      bio: 'bio text',
      persona: 'seductive',
      gender: 'female',
      energy: 'feminine',
      onboarding_completed: true,
      onboarding_completed_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-02T00:00:00.000Z',
    };
    const app = mapProfileFromDB(dbRow)!;
    expect(app.id).toBe('uuid-123');
    expect(app.firstName).toBe('Jane');
    expect(app.lastName).toBe('Doe');
    expect(app.avatarUrl).toBe('http://example.com/a.png');
    expect(app.bio).toBe('bio text');
    expect(app.persona).toBe('seductive');
    expect(app.gender).toBe('female');
    expect(app.energy).toBe('feminine');
    expect(app.onboardingCompleted).toBe(true);
    expect(app.onboardingCompletedAt).toBe('2025-01-01T00:00:00.000Z');
    expect(app.updated_at).toBe('2025-01-02T00:00:00.000Z');
  });

  it('maps camelCase to DB snake_case with nulls for missing values', () => {
    const app = {
      firstName: 'John',
      persona: 'dominant' as const,
      gender: 'male' as const,
      energy: 'masculine' as const,
      onboardingCompleted: false,
    };
    const db = mapProfileToDB(app);
    expect(db.first_name).toBe('John');
    expect(db.last_name).toBeNull();
    expect(db.avatar_url).toBeNull();
    expect(db.persona).toBe('dominant');
    expect(db.gender).toBe('male');
    expect(db.energy).toBe('masculine');
    expect(db.onboarding_completed).toBe(false);
    expect(db.onboarding_completed_at).toBeNull();
  });
});