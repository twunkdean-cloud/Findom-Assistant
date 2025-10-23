import { supabase } from '@/integrations/supabase/client';
import { Checklist } from '@/types/index';

interface DBChecklist {
  id: string;
  user_id: string;
  date: string;
  tasks: any;
  completed: any;
}

export class ChecklistsService {
  async getToday(userId: string): Promise<Checklist> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('checklists')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (data) {
      return {
        date: data.date,
        tasks: data.tasks,
        completed: data.completed,
      };
    }

    // Return default checklist
    return {
      date: today,
      tasks: [
        '30 minute workout',
        'Shower',
        'AM medication',
        'PM medication',
        'Eat a healthy meal',
        'Drink 8 glasses of water',
        'Post on Twitter',
        'Post on Reddit',
        'Respond to messages',
        'Create 5 pictures',
        'Create 1 video for clips for sale',
        'Engage with subs on social media',
        'Check analytics',
        'Plan next content',
      ],
      completed: [],
    };
  }

  async update(userId: string, checklist: Checklist): Promise<void> {
    const { error } = await supabase
      .from('checklists')
      .upsert({
        user_id: userId,
        date: checklist.date,
        tasks: checklist.tasks,
        completed: checklist.completed,
      }, {
        onConflict: 'user_id,date'
      });

    if (error) throw error;
  }

  async createDefault(userId: string): Promise<Checklist> {
    const today = new Date().toISOString().split('T')[0];
    const defaultTasks = [
      '30 minute workout',
      'Shower',
      'AM medication',
      'PM medication',
      'Eat a healthy meal',
      'Drink 8 glasses of water',
      'Post on Twitter',
      'Post on Reddit',
      'Respond to messages',
      'Create 5 pictures',
      'Create 1 video for clips for sale',
      'Engage with subs on social media',
      'Check analytics',
      'Plan next content',
    ];

    const checklist: Checklist = {
      date: today,
      tasks: defaultTasks,
      completed: [],
    };

    await this.update(userId, checklist);
    return checklist;
  }
}

export const checklistsService = new ChecklistsService();