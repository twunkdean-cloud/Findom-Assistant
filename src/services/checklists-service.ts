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
        weeklyTasks: data.weeklyTasks || DEFAULT_WEEKLY_TASKS,
        weeklyCompleted: data.weeklyCompleted || [],
      };
    }

    // Return default checklist
    return {
      date: today,
      tasks: [
        'AM medication',
        'PM medication',
        'Shower',
        'Spend 30 minutes cleaning',
        '30 minute workout',
        'Post on Twitter 3x',
        'Take pictures for content',
        'Post/comment on Reddit',
        'Post on LoyalFans',
        'Engage with subs on social media',
        'Check analytics and earnings',
        'Create 1 video for clips',
        'Respond to messages within 2 hours',
        'Plan tomorrow\'s content',
        'Update sub profiles/notes',
        'Review red flag database',
        'Drink 8 glasses of water',
        'Eat a healthy meal',
      ],
      completed: [],
      weeklyTasks: DEFAULT_WEEKLY_TASKS,
      weeklyCompleted: [],
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
        weeklyTasks: checklist.weeklyTasks,
        weeklyCompleted: checklist.weeklyCompleted,
      }, {
        onConflict: 'user_id,date'
      });

    if (error) throw error;
  }

  async createDefault(userId: string): Promise<Checklist> {
    const today = new Date().toISOString().split('T')[0];
    const defaultTasks = [
      'AM medication',
      'PM medication',
      'Shower',
      'Spend 30 minutes cleaning',
      '30 minute workout',
      'Post on Twitter 3x',
      'Take pictures for content',
      'Post/comment on Reddit',
      'Post on LoyalFans',
      'Engage with subs on social media',
      'Check analytics and earnings',
      'Create 1 video for clips',
      'Respond to messages within 2 hours',
      'Plan tomorrow\'s content',
      'Update sub profiles/notes',
      'Review red flag database',
      'Drink 8 glasses of water',
      'Eat a healthy meal',
    ];

    const checklist: Checklist = {
      date: today,
      tasks: defaultTasks,
      completed: [],
      weeklyTasks: DEFAULT_WEEKLY_TASKS,
      weeklyCompleted: [],
    };

    await this.update(userId, checklist);
    return checklist;
  }
}

export const checklistsService = new ChecklistsService();