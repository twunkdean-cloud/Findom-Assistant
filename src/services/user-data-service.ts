import { supabase } from '@/integrations/supabase/client';
import { Persona, Goal } from '@/context/FindomContext';

export class UserDataService {
  async get<T>(userId: string, key: string): Promise<T | null> {
    const { data, error } = await supabase
      .from('user_data')
      .select('data')
      .eq('user_id', userId)
      .eq('data_type', key)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data?.data || null;
  }

  async set<T>(userId: string, key: string, value: T): Promise<void> {
    const { error } = await supabase
      .from('user_data')
      .upsert({
        user_id: userId,
        data_type: key,
        data: value,
      }, {
        onConflict: 'user_id,data_type'
      });

    if (error) throw error;
  }

  async getApiKey(userId: string): Promise<string> {
    return await this.get<string>(userId, 'apiKey') || '';
  }

  async setApiKey(userId: string, apiKey: string): Promise<void> {
    await this.set(userId, 'apiKey', apiKey);
  }

  async getPersona(userId: string): Promise<Persona> {
    return await this.get<Persona>(userId, 'persona') || { 
      name: 'Switch Dean', 
      specialties: 'male findom, foot worship, wallet drain', 
      style: 'strict' 
    };
  }

  async setPersona(userId: string, persona: Persona): Promise<void> {
    await this.set(userId, 'persona', persona);
  }

  async getGoal(userId: string): Promise<Goal> {
    return await this.get<Goal>(userId, 'goal') || { target: 0, current: 0 };
  }

  async setGoal(userId: string, goal: Goal): Promise<void> {
    await this.set(userId, 'goal', goal);
  }

  async getResponses(userId: string): Promise<Record<string, string>> {
    return await this.get<Record<string, string>>(userId, 'responses') || {
      initial: 'Loading...',
      tribute: 'Loading...',
      excuse: 'Loading...',
      task: 'Loading...',
      punishment: 'Loading...',
    };
  }

  async setResponses(userId: string, responses: Record<string, string>): Promise<void> {
    await this.set(userId, 'responses', responses);
  }

  async getScreenTime(userId: string): Promise<number> {
    return await this.get<number>(userId, 'screenTime') || 0;
  }

  async setScreenTime(userId: string, screenTime: number): Promise<void> {
    await this.set(userId, 'screenTime', screenTime);
  }

  async getTimerStart(userId: string): Promise<number | null> {
    return await this.get<number | null>(userId, 'timerStart') || null;
  }

  async setTimerStart(userId: string, timerStart: number | null): Promise<void> {
    await this.set(userId, 'timerStart', timerStart);
  }

  async getUploadedImageData(userId: string): Promise<{ mimeType: string; data: string } | null> {
    return await this.get<{ mimeType: string; data: string } | null>(userId, 'uploadedImageData') || null;
  }

  async setUploadedImageData(userId: string, data: { mimeType: string; data: string } | null): Promise<void> {
    await this.set(userId, 'uploadedImageData', data);
  }
}

export const userDataService = new UserDataService();