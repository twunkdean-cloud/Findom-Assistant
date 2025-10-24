# Code Cleanup Migration Plan

## Phase 1: Toast Consolidation (Low Risk)
1. Create `src/utils/toast-unified.ts`
2. Update imports in 1-2 components to test
3. Gradually replace all toast imports
4. Remove old toast files

## Phase 2: Service Consolidation (Medium Risk)
1. Create `src/services/unified-service.ts`
2. Update one service at a time (start with subsService)
3. Test thoroughly before moving to next
4. Remove old service files

## Phase 3: AI Hooks Consolidation (High Risk)
1. Create `src/hooks/use-ai-unified.ts`
2. Create wrapper hooks for backward compatibility:
   ```ts
   export const useGemini = () => {
     const ai = useAIUnified();
     return {
       callGemini: ai.callGemini,
       callGeminiVision: ai.callGeminiVision,
       isLoading: ai.isLoading,
       error: ai.error,
       getSystemPrompt: () => getSystemPrompt('general'),
     };
   };
   ```
3. Gradually migrate components
4. Remove old hooks

## Phase 4: Constants Consolidation (Low Risk)
1. Create `src/constants/index.ts`
2. Update imports gradually
3. Remove old constant files

## Testing Strategy
- Test each phase thoroughly before proceeding
- Keep old files until migration is complete
- Use feature flags if needed
- Test all AI functionality after Phase 3

## Rollback Plan
- Keep git branches for each phase
- Document all changes
- Test rollback procedures