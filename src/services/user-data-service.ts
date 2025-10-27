import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse } from '@/types';

export class UserDataService {
  private supabase = supabase;

  private mapProfileFromDB(row: any) {
    if (!row) return {};
    return {
      id: row.id,
      firstName: row.first_name ?? '',
      lastName: row.last_name ?? '',
      avatarUrl: row.avatar_url ?? null,
      bio: row.bio ?? '',
      persona: row.persona ?? 'dominant',
      gender: row.gender ?? 'male',
      energy: row.energy ?? 'masculine',
      onboardingCompleted: row.onboarding_completed ?? false,
      onboardingCompletedAt: row.onboarding_completed_at ?? null,
      updated_at: row.updated_at ?? null,
    };
  }

  private mapProfileToDB(profile: any) {
    if (!profile) return {};
    const mapped: any = {
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
    return mapped;
  }

  async getApiKey(userId: string): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('user_data')
        .select('data')
        .eq('user_id', userId)
        .eq('data_type', 'api_key')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data?.data?.apiKey || '';
    } catch (error) {
      console.error('Error getting API key:', error);
      return '';
    }
  }

  async setApiKey(userId: string, apiKey: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          data_type: 'api_key',
          data: { apiKey },
        }, {
          onConflict: 'user_id,data_type',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error setting API key:', error);
      throw error;
    }
  }

  async getPersona(userId: string): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('user_data')
        .select('data')
        .eq('user_id', userId)
        .eq('data_type', 'persona')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data?.data?.persona || 'dominant';
    } catch (error) {
      console.error('Error getting persona:', error);
      return 'dominant';
    }
  }

  async setPersona(userId: string, persona: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          data_type: 'persona',
          data: { persona },
        }, {
          onConflict: 'user_id,data_type',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error setting persona:', error);
      throw error;
    }
  }

  async getGoal(userId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('user_data')
        .select('data')
        .eq('user_id', userId)
        .eq('data_type', 'goal')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data?.data || { weekly: 0, monthly: 0 };
    } catch (error) {
      console.error('Error getting goal:', error);
      return { weekly: 0, monthly: 0 };
    }
  }

  async setGoal(userId: string, goal: any): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          data_type: 'goal',
          data: goal,
        }, {
          onConflict: 'user_id,data_type',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error setting goal:', error);
      throw error;
    }
  }

  async getResponses(userId: string): Promise<Record<string, string>> {
    try {
      const { data, error } = await this.supabase
        .from('user_data')
        .select('data')
        .eq('user_id', userId)
        .eq('data_type', 'responses')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data?.data || {};
    } catch (error) {
      console.error('Error getting responses:', error);
      return {};
    }
  }

  async setResponses(userId: string, responses: Record<string, string>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          data_type: 'responses',
          data: responses,
        }, {
          onConflict: 'user_id,data_type',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error setting responses:', error);
      throw error;
    }
  }

  async getScreenTime(userId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('user_data')
        .select('data')
        .eq('user_id', userId)
        .eq('data_type', 'screen_time')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data?.data?.screenTime || 0;
    } catch (error) {
      console.error('Error getting screen time:', error);
      return 0;
    }
  }

  async setScreenTime(userId: string, screenTime: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          data_type: 'screen_time',
          data: { screenTime },
        }, {
          onConflict: 'user_id,data_type',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error setting screen time:', error);
      throw error;
    }
  }

  async getTimerStart(userId: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_data')
        .select('data')
        .eq('user_id', userId)
        .eq('data_type', 'timer_start')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data?.data?.timerStart || null;
    } catch (error) {
      console.error('Error getting timer start:', error);
      return null;
    }
  }

  async setTimerStart(userId: string, timerStart: string | null): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          data_type: 'timer_start',
          data: { timerStart },
        }, {
          onConflict: 'user_id,data_type',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error setting timer start:', error);
      throw error;
    }
  }

  async getUploadedImageData(userId: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_data')
        .select('data')
        .eq('user_id', userId)
        .eq('data_type', 'uploaded_image_data')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data?.data?.uploadedImageData || null;
    } catch (error) {
      console.error('Error getting uploaded image data:', error);
      return null;
    }
  }

  async setUploadedImageData(userId: string, uploadedImageData: string | null): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          data_type: 'uploaded_image_data',
          data: { uploadedImageData },
        }, {
          onConflict: 'user_id,data_type',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error setting uploaded image data:', error);
      throw error;
    }
  }

  async getProfile(userId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return this.mapProfileFromDB(data) || {};
    } catch (error) {
      console.error('Error getting profile:', error);
      return {};
    }
  }

  async setProfile(userId: string, profile: any): Promise<void> {
    try {
      const payload = {
        id: userId,
        ...this.mapProfileToDB(profile),
      };
      const { error } = await this.supabase
        .from('profiles')
        .upsert(payload, {
          onConflict: 'id',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error setting profile:', error);
      throw error;
    }
  }

  async getSettings(userId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('user_data')
        .select('data')
        .eq('user_id', userId)
        .eq('data_type', 'settings')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data?.data || {
        emailNotifications: true,
        pushNotifications: true,
        dailyReminders: true,
        profileVisibility: 'private',
        dataSharing: false,
        theme: 'auto',
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return {
        emailNotifications: true,
        pushNotifications: true,
        dailyReminders: true,
        profileVisibility: 'private',
        dataSharing: false,
        theme: 'auto',
      };
    }
  }

  async setSettings(userId: string, settings: any): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          data_type: 'settings',
          data: settings,
        }, {
          onConflict: 'user_id,data_type',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error setting settings:', error);
      throw error;
    }
  }

  async getSubscription(userId: string): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('user_data')
        .select('data')
        .eq('user_id', userId)
        .eq('data_type', 'subscription')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data?.data?.subscription || 'free';
    } catch (error) {
      console.error('Error getting subscription:', error);
      return 'free';
    }
  }

  async setSubscription(userId: string, subscription: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          data_type: 'subscription',
          data: { subscription },
        }, {
          onConflict: 'user_id,data_type',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error setting subscription:', error);
      throw error;
    }
  }
}

export const userDataService = new UserDataService();