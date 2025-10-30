#!/bin/bash
# Script to remove .env from git history
# WARNING: This rewrites git history - coordinate with team before running!

echo "⚠️  WARNING: This will rewrite git history!"
echo "This is irreversible and will affect all branches."
echo "Coordinate with your team before proceeding."
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

echo "Creating backup..."
git tag backup-before-env-removal

echo "Removing .env from git history..."
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

echo "Cleaning up..."
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "✅ Done! .env has been removed from git history."
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Force push to all remotes: git push origin --force --all"
echo "2. Force push tags: git push origin --force --tags"
echo "3. Tell all team members to re-clone the repository"
echo ""
echo "Backup tag created: 'backup-before-env-removal'"
echo "To restore: git reset --hard backup-before-env-removal"
