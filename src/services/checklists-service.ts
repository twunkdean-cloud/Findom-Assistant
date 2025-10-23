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
        weeklyTasks: data.weeklyTasks || [
          'Deep clean living space',
          'Meal prep for the week',
          'Review weekly earnings and goals',
          'Plan content schedule for next week',
          'Update subscription prices if needed',
          'Review and update red flag list',
          'Check all social media analytics',
          'Create 5 new content pieces',
          'Respond to all fan messages',
          'Update profile/bio on platforms',
          'Research new content trends',
          'Backup all content and data',
          'Review sub performance and engagement',
          'Plan special offers/promotions',
          'Self-care and relaxation time',
        ],
        weeklyCompleted: data.weeklyCompleted || [],
      };
    }

    // Return default checklist
    return {
      date: today,
      tasks: [
        'Take AM medication',
        '30 minute workout',
        'Shower',
        'Spend 30 minutes cleaning',
        'Eat a healthy meal',
        'Drink 8 glasses of water',
        'Post on Twitter 3x',
        'Take pictures for content',
        'Post/comment on Reddit',
        'Post on LoyalFans',
        'Engage with subs on social media',
        'Check analytics',
        'Plan next content',
        'Take PM medication',
        'Review daily earnings',
        'Update task tracker',
      ],
      completed: [],
      weeklyTasks: [
        'Deep clean living space',
        'Meal prep for the week',
        'Review weekly earnings and goals',
        'Plan content schedule for next week',
        'Update subscription prices if needed',
        'Review and update red flag list',
        'Check all social media analytics',
        'Create 5 new content pieces',
        'Respond to all fan messages',
        'Update profile/bio on platforms',
        'Research new content trends',
        'Backup all content and data',
        'Review sub performance and engagement',
        'Plan special offers/promotions',
        'Self-care and relaxation time',
      ],
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
        weekly_tasks: checklist.weeklyTasks,
        weekly_completed: checklist.weeklyCompleted,
      }, {
        onConflict: 'user_id,date'
      });

    if (error) throw error;
  }

  async createDefault(userId: string): Promise<Checklist> {
    const today = new Date().toISOString().split('T')[0];
    const defaultTasks = [
      'Take AM medication',
      '30 minute workout',
      'Shower',
      'Spend 30 minutes cleaning',
      'Eat a healthy meal',
      'Drink 8 glasses of water',
      'Post on Twitter 3x',
      'Take pictures for content',
      'Post/comment on Reddit',
      'Post on LoyalFans',
      'Engage with subs on social media',
      'Check analytics',
      'Plan next content',
      'Take PM medication',
      'Review daily earnings',
      'Update task tracker',
    ];

    const defaultWeeklyTasks = [
      'Deep clean living space',
      'Meal prep for the week',
      'Review weekly earnings and goals',
      'Plan content schedule for next week',
      'Update subscription prices if needed',
      'Review and update red flag list',
      'Check all social media analytics',
      'Create 5 new content pieces',
      'Respond to all fan messages',
      'Update profile/bio on platforms',
      'Research new content trends',
      'Backup all content and data',
      'Review sub performance and engagement',
      'Plan special offers/promotions',
      'Self-care and relaxation time',
    ];

    const checklist: Checklist = {
      date: today,
      tasks: defaultTasks,
      completed: [],
      weeklyTasks: defaultWeeklyTasks,
      weeklyCompleted: [],
    };

    await this.update(userId, checklist);
    return checklist;
  }
}

export const checklistsService = new ChecklistsService();