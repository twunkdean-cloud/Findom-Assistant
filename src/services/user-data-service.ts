import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Persona, Goal } from '@/context/FindomContext';

export class UserDataService {
  private getUserId() {
    const { user } = useAuth();
    if (!user) throw new Error('User not authenticated');
    return user.id;
  }

  async get<T>(key: string): Promise<T | null> {
    const userId = this.getUserId();
    
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

  async set<T>(key: string, value: T): Promise<void> {
    const userId = this.getUserId();
    
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

  async getApiKey(): Promise<string> {
    return await this.get<string>('apiKey') || '';
  }

  async setApiKey(apiKey: string): Promise<void> {
    await this.set('apiKey', apiKey);
  }

  async getPersona(): Promise<Persona> {
    return await this.get<Persona>('persona') || { 
      name: 'Switch Dean', 
      specialties: 'male findom, foot worship, wallet drain', 
      style: 'strict' 
    };
  }

  async setPersona(persona: Persona): Promise<void> {
    await this.set('persona', persona);
  }

  async getGoal(): Promise<Goal> {
    return await this.get<Goal>('goal') || { target: 0, current: 0 };
  }

  async setGoal(goal: Goal): Promise<void> {
    await this.set('goal', goal);
  }

  async getResponses(): Promise<Record<string, string>> {
    return await this.get<Record<string, string>>('responses') || {
      initial: 'Loading...',
      tribute: 'Loading...',
      excuse: 'Loading...',
      task: 'Loading...',
      punishment: 'Loading...',
    };
  }

  async setResponses(responses: Record<string, string>): Promise<void> {
    await this.set('responses', responses);
  }

  async getScreenTime(): Promise<number> {
    return await this.get<number>('screenTime') || 0;
  }

  async setScreenTime(screenTime: number): Promise<void> {
    await this.set('screenTime', screenTime);
  }

  async getTimerStart(): Promise<number | null> {
    return await this.get<number | null>('timerStart') || null;
  }

  async setTimerStart(timerStart: number | null): Promise<void> {
    await this.set('timerStart', timerStart);
  }

  async getUploadedImageData(): Promise<{ mimeType: string; data: string } | null> {
    return await this.get<{ mimeType: string; data: string } | null>('uploadedImageData') || null;
  }

  async setUploadedImageData(data: { mimeType: string; data: string } | null): Promise<void> {
    await this.set('uploadedImageData', data);
  }
}

export const userDataService = new UserDataService();