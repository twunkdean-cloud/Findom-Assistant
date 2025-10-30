import { BaseService } from './base-service';
import { Checklist } from '@/types';
import { logger } from '@/utils/logger';

export const DEFAULT_WEEKLY_TASKS = [
  'Check for new tributes',
  'Send reminder messages',
  'Update sub profiles',
  'Review weekly goals',
  'Schedule content posts'
];

// Type for database row with optional weekly fields
interface ChecklistRow {
  id: string;
  date: string;
  tasks: string[];
  completed: string[];
  weeklyTasks?: string[];
  weeklyCompleted?: string[];
  created_at?: string;
  updated_at?: string;
}

export class ChecklistsService extends BaseService<Checklist> {
  public getTableName(): string {
    return 'checklists';
  }

  protected transformFromDB(items: ChecklistRow[]): Checklist[] {
    return items.map(item => ({
      ...item,
      weeklyTasks: item.weeklyTasks || DEFAULT_WEEKLY_TASKS,
      weeklyCompleted: item.weeklyCompleted || [],
    }));
  }

  protected transformToDB(item: Checklist): Partial<ChecklistRow> {
    return {
      id: item.id,
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
        const row = data as ChecklistRow;
        return {
          ...row,
          weeklyTasks: row.weeklyTasks || DEFAULT_WEEKLY_TASKS,
          weeklyCompleted: row.weeklyCompleted || [],
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
      logger.error('Error getting today\'s checklist:', error);
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
      logger.error('Error updating checklist:', error);
      throw error;
    }
  }
}

export const checklistsService = new ChecklistsService();