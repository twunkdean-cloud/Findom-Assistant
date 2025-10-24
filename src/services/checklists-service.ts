import { BaseService } from './base-service';
import { Checklist } from '@/types';

export const DEFAULT_WEEKLY_TASKS = [
  'Check for new tributes',
  'Send reminder messages',
  'Update sub profiles',
  'Review weekly goals',
  'Schedule content posts'
];

export class ChecklistsService extends BaseService<Checklist> {
  protected getTableName(): string {
    return 'checklists';
  }

  protected transformFromDB(items: any[]): Checklist[] {
    return items.map(item => ({
      ...item,
      weeklyTasks: (item as any).weeklyTasks || DEFAULT_WEEKLY_TASKS,
      weeklyCompleted: (item as any).weeklyCompleted || [],
    }));
  }

  protected transformToDB(item: Checklist): any {
    return {
      id: item.id,
      user_id: (item as any).user_id,
      date: item.date,
      tasks: item.tasks,
      completed: item.completed,
    };
  }

  async getToday(userId: string): Promise<Checklist> {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { data, error } = await this.supabase
        .from(this.getTableName())
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        return {
          ...data,
          weeklyTasks: (data as any).weeklyTasks || DEFAULT_WEEKLY_TASKS,
          weeklyCompleted: (data as any).weeklyCompleted || [],
        };
      }

      // Create today's checklist if it doesn't exist
      const newChecklist: Checklist = {
        id: '',
        date: today,
        tasks: [],
        completed: [],
        weeklyTasks: DEFAULT_WEEKLY_TASKS,
        weeklyCompleted: [],
      };

      const { data: createdData, error: createError } = await this.supabase
        .from(this.getTableName())
        .insert({
          user_id: userId,
          date: today,
          tasks: [],
          completed: [],
        })
        .select()
        .single();

      if (createError) throw createError;

      return {
        ...createdData,
        weeklyTasks: DEFAULT_WEEKLY_TASKS,
        weeklyCompleted: [],
      };
    } catch (error) {
      console.error('Error getting today\'s checklist:', error);
      return {
        id: '',
        date: today,
        tasks: [],
        completed: [],
        weeklyTasks: DEFAULT_WEEKLY_TASKS,
        weeklyCompleted: [],
      };
    }
  }

  async updateChecklist(userId: string, data: Checklist): Promise<void> {
    try {
      const updateData = {
        user_id: userId,
        date: data.date,
        tasks: data.tasks,
        completed: data.completed,
      };

      const { error } = await this.supabase
        .from(this.getTableName())
        .upsert(updateData, {
          onConflict: 'user_id,date',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating checklist:', error);
      throw error;
    }
  }
}

export const checklistsService = new ChecklistsService();