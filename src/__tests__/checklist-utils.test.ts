import { describe, it, expect } from 'vitest';
import { toggleWeeklyCompleted } from '@/utils/checklist';

describe('toggleWeeklyCompleted', () => {
  it('adds a task when not present', () => {
    const res = toggleWeeklyCompleted([], 'Task A');
    expect(res).toEqual(['Task A']);
  });

  it('removes a task when present', () => {
    const res = toggleWeeklyCompleted(['Task A', 'Task B'], 'Task A');
    expect(res.sort()).toEqual(['Task B']);
  });

  it('works idempotently when toggling twice', () => {
    const a = toggleWeeklyCompleted([], 'Task A');
    const b = toggleWeeklyCompleted(a, 'Task A');
    expect(b).toEqual([]);
  });
});