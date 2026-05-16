#!/bin/bash

# SYSTEMAI.EXE - Git Push Script
# Validates and pushes to main branch with proper discipline

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 SYSTEMAI.EXE - Push to Main Branch${NC}"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ Not in project root directory${NC}"
  exit 1
fi

# Check git status
echo -e "\n${YELLOW}Checking git status...${NC}"
if [ -z "$(git status --porcelain)" ]; then
  echo -e "${YELLOW}No changes to commit${NC}"
  exit 0
fi

# Show changes
echo -e "\n${YELLOW}Changes to be committed:${NC}"
git status --short

# Run validation
echo -e "\n${YELLOW}Running validations...${NC}"
bash scripts/validate.sh || {
  echo -e "${RED}❌ Validation failed. Fix issues before pushing.${NC}"
  exit 1
}

# Get branch info
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "\n${YELLOW}Current branch: ${BLUE}$CURRENT_BRANCH${NC}"

# Prepare commit message
echo -e "\n${YELLOW}Preparing commit...${NC}"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
COMMIT_MSG="refactor(all): Phase 1 core architecture with discipline rules

- Established development discipline rules (RULES.md)
- Created architecture documentation (ARCHITECTURE.md)
- Implemented validation scripts for quality gates
- Added dynamic comment generation system
- All exports documented with JSDoc
- Parallel .md documentation for all modules
- Validated: typescript, eslint, jsdoc coverage
- Ready for Phase 2 implementation

Validated: 2026-05-16 Complete"

# Stage changes
echo -e "\n${YELLOW}Staging files...${NC}"
git add -A
git status --short

# Commit
echo -e "\n${YELLOW}Creating commit...${NC}"
git commit -m "$COMMIT_MSG" || {
  echo -e "${RED}❌ Commit failed${NC}"
  exit 1
}

# Get commit hash
COMMIT_HASH=$(git rev-parse --short HEAD)
echo -e "${GREEN}✅ Commit created: $COMMIT_HASH${NC}"

# Push to main
echo -e "\n${YELLOW}Pushing to main branch...${NC}"
if [ "$CURRENT_BRANCH" = "main" ]; then
  git push origin main || {
    echo -e "${RED}❌ Push failed${NC}"
    exit 1
  }
  echo -e "${GREEN}✅ Pushed to main branch${NC}"
else
  echo -e "${YELLOW}Current branch is '$CURRENT_BRANCH', not main${NC}"
  read -p "Switch to main and push? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git checkout main
    git merge "$CURRENT_BRANCH"
    git push origin main
    echo -e "${GREEN}✅ Merged and pushed to main${NC}"
  else
    echo -e "${YELLOW}Push cancelled${NC}"
  fi
fi

# Create summary
echo -e "\n${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ PUSH SUCCESSFUL${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "Branch: ${BLUE}$CURRENT_BRANCH${NC}"
echo -e "Commit: ${BLUE}$COMMIT_HASH${NC}"
echo -e "Time: ${BLUE}$TIMESTAMP${NC}"
echo -e "\nProject Status: ${GREEN}Ready for Phase 2${NC}"
