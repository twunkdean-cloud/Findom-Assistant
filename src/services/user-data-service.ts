import { supabase } from '@/integrations/supabase/client';

export class UserDataService {
  async setApiKey(userId: string, apiKey: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          data_type: 'apiKey',
          data: { apiKey },
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error setting API key:', error);
      throw error;
    }
  }

  async getApiKey(userId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('data')
        .eq('user_id', userId)
        .eq('data_type', 'apiKey')
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

  async setPersona(userId: string, persona: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          data_type: 'persona',
          data: { persona },
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error setting persona:', error);
      throw error;
    }
  }

  async getPersona(userId: string): Promise<string> {
    try {
      const { data, error } = await supabase
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

  async setGoal(userId: string, goal: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          data_type: 'goal',
          data: { goal },
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error setting goal:', error);
      throw error;
    }
  }

  async getGoal(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('data')
        .eq('user_id', userId)
        .eq('data_type', 'goal')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data?.data?.goal || { weekly: 0, monthly: 0 };
    } catch (error) {
      console.error('Error getting goal:', error);
      return { weekly: 0, monthly: 0 };
    }
  }

  async setResponses(userId: string, responses: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          data_type: 'responses',
          data: { responses },
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error setting responses:', error);
      throw error;
    }
  }

  async getResponses(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('data')
        .eq('user_id', userId)
        .eq('data_type', 'responses')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data?.data?.responses || {};
    } catch (error) {
      console.error('Error getting responses:', error);
      return {};
    }
  }

  async setScreenTime(userId: string, screenTime: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          data_type: 'screenTime',
          data: { screenTime },
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error setting screen time:', error);
      throw error;
    }
  }

  async getScreenTime(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('data')
        .eq('user_id', userId)
        .eq('data_type', 'screenTime')
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

  async setTimerStart(userId: string, timerStart: string | null): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          data_type: 'timerStart',
          data: { timerStart },
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error setting timer start:', error);
      throw error;
    }
  }

  async getTimerStart(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('data')
        .eq('user_id', userId)
        .eq('data_type', 'timerStart')
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

  async setUploadedImageData(userId: string, uploadedImageData: string | null): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          data_type: 'uploadedImageData',
          data: { uploadedImageData },
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error setting uploaded image data:', error);
      throw error;
    }
  }

  async getUploadedImageData(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('data')
        .eq('user_id', userId)
        .eq('data_type', 'uploadedImageData')
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

  async setProfile(userId: string, profile: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          data_type: 'profile',
          data: { profile },
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error setting profile:', error);
      throw error;
    }
  }

  async getProfile(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('data')
        .eq('user_id', userId)
        .eq('data_type', 'profile')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data?.data?.profile || {};
    } catch (error) {
      console.error('Error getting profile:', error);
      return {};
    }
  }

  async setSettings(userId: string, settings: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          data_type: 'settings',
          data: { settings },
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error setting settings:', error);
      throw error;
    }
  }

  async getSettings(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('data')
        .eq('user_id', userId)
        .eq('data_type', 'settings')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data?.data?.settings || {};
    } catch (error) {
      console.error('Error getting settings:', error);
      return {};
    }
  }

  async setSubscription(userId: string, subscription: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          data_type: 'subscription',
          data: { subscription },
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error setting subscription:', error);
      throw error;
    }
  }

  async getSubscription(userId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('data')
        .eq('user_id', userId)
        .eq('data_type', 'subscription')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data?.data?.subscription || '';
    } catch (error) {
      console.error('Error getting subscription:', error);
      return '';
    }
  }
}

export const userDataService = new UserDataService();