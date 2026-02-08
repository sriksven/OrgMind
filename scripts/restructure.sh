#!/bin/bash

# OrgMind Project Restructuring Script
# This script reorganizes the project into a professional structure

set -e  # Exit on error

PROJECT_ROOT="/Users/sriks/Documents/Projects/OrgMind"
BACKEND="$PROJECT_ROOT/backend"
FRONTEND="$PROJECT_ROOT/frontend"

echo "🚀 Starting OrgMind Project Restructuring..."
echo "================================================"

# ============================================
# BACKEND RESTRUCTURING
# ============================================

echo ""
echo "📦 Phase 1: Backend Restructuring"
echo "-----------------------------------"

cd "$BACKEND"

# Move agent files
echo "Moving agent files..."
mv agents/base_agent.py src/agents/base.py 2>/dev/null || true
mv agents/coordinator.py src/agents/coordinator.py 2>/dev/null || true
mv agents/memory_agent.py src/agents/memory.py 2>/dev/null || true
mv agents/router_agent.py src/agents/router.py 2>/dev/null || true
mv agents/critic_agent.py src/agents/critic.py 2>/dev/null || true
cp agents/__init__.py src/agents/__init__.py 2>/dev/null || true

# Move data pipeline files
echo "Moving data pipeline files..."
mv data_pipeline/entity_extractor.py src/pipelines/extraction/entity_extractor.py 2>/dev/null || true
mv data_pipeline/load_enron.py src/pipelines/ingestion/csv_loader.py 2>/dev/null || true
mv data_pipeline/mock_data_generator.py src/pipelines/ingestion/mock_generator.py 2>/dev/null || true

# Move knowledge graph files
echo "Moving knowledge graph files..."
mv knowledge_graph/graph_builder.py src/knowledge_graph/builder.py 2>/dev/null || true
mv knowledge_graph/graph_export.py src/knowledge_graph/export.py 2>/dev/null || true

# Move utils
echo "Moving utility files..."
mv utils/logging_config.py src/utils/logging.py 2>/dev/null || true

# Move main.py
echo "Moving main application..."
cp main.py src/main.py 2>/dev/null || true

echo "✅ Backend files moved"

# ============================================
# FRONTEND RESTRUCTURING
# ============================================

echo ""
echo "🎨 Phase 2: Frontend Restructuring"
echo "-----------------------------------"

cd "$FRONTEND/src"

# Move components to features
echo "Moving feature components..."
mkdir -p components/features/CommandBar
mkdir -p components/features/KnowledgeGraph
mkdir -p components/features/QueryResponse
mkdir -p components/features/NodeDetailPanel
mkdir -p components/features/Dashboard
mkdir -p components/features/AgentPanel
mkdir -p components/layout/Navbar

# Move component files
[ -f "components/CommandBar.jsx" ] && mv components/CommandBar.jsx components/features/CommandBar/ 2>/dev/null || true
[ -f "components/CommandBar.css" ] && mv components/CommandBar.css components/features/CommandBar/ 2>/dev/null || true
[ -f "components/KnowledgeGraph.jsx" ] && mv components/KnowledgeGraph.jsx components/features/KnowledgeGraph/ 2>/dev/null || true
[ -f "components/QueryResponse.jsx" ] && mv components/QueryResponse.jsx components/features/QueryResponse/ 2>/dev/null || true
[ -f "components/QueryResponse.css" ] && mv components/QueryResponse.css components/features/QueryResponse/ 2>/dev/null || true
[ -f "components/NodeDetailPanel.jsx" ] && mv components/NodeDetailPanel.jsx components/features/NodeDetailPanel/ 2>/dev/null || true
[ -f "components/NodeDetailPanel.css" ] && mv components/NodeDetailPanel.css components/features/NodeDetailPanel/ 2>/dev/null || true
[ -f "components/Dashboard.jsx" ] && mv components/Dashboard.jsx components/features/Dashboard/ 2>/dev/null || true
[ -f "components/AgentPanel.jsx" ] && mv components/AgentPanel.jsx components/features/AgentPanel/ 2>/dev/null || true
[ -f "components/Navbar.jsx" ] && mv components/Navbar.jsx components/layout/Navbar/ 2>/dev/null || true
[ -f "components/Navbar.css" ] && mv components/Navbar.css components/layout/Navbar/ 2>/dev/null || true
[ -f "components/Navbar_Light.css" ] && rm components/Navbar_Light.css 2>/dev/null || true
[ -f "components/Navbar_Dark.css" ] && rm components/Navbar_Dark.css 2>/dev/null || true

# Move hooks
echo "Moving hooks..."
[ -f "hooks/useAgents.js" ] && mv hooks/useAgents.js hooks/ 2>/dev/null || echo "useAgents.js already in place"

echo "✅ Frontend files moved"

# ============================================
# CLEANUP
# ============================================

echo ""
echo "🧹 Phase 3: Cleanup"
echo "-----------------------------------"

cd "$PROJECT_ROOT"

# Remove empty old directories
echo "Removing empty directories..."
[ -d "$BACKEND/agents" ] && rmdir "$BACKEND/agents" 2>/dev/null || true
[ -d "$BACKEND/data_pipeline" ] && rmdir "$BACKEND/data_pipeline" 2>/dev/null || true
[ -d "$BACKEND/knowledge_graph" ] && rmdir "$BACKEND/knowledge_graph" 2>/dev/null || true
[ -d "$BACKEND/utils" ] && rmdir "$BACKEND/utils" 2>/dev/null || true

# Remove old backup files
echo "Removing backup files..."
cd "$FRONTEND/src"
rm -f App_Original_Backup.jsx 2>/dev/null || true

echo "✅ Cleanup complete"

# ============================================
# CREATE INIT FILES
# ============================================

echo ""
echo "📝 Phase 4: Creating __init__.py files"
echo "-----------------------------------"

# Backend __init__ files
touch "$BACKEND/src/__init__.py"
touch "$BACKEND/src/api/__init__.py"
touch "$BACKEND/src/api/routes/__init__.py"
touch "$BACKEND/src/agents/__init__.py"
touch "$BACKEND/src/pipelines/__init__.py"
touch "$BACKEND/src/pipelines/ingestion/__init__.py"
touch "$BACKEND/src/pipelines/extraction/__init__.py"
touch "$BACKEND/src/pipelines/enrichment/__init__.py"
touch "$BACKEND/src/knowledge_graph/__init__.py"
touch "$BACKEND/src/models/__init__.py"
touch "$BACKEND/src/utils/__init__.py"
touch "$BACKEND/tests/__init__.py"
touch "$BACKEND/tests/unit/__init__.py"
touch "$BACKEND/tests/integration/__init__.py"

echo "✅ Init files created"

# ============================================
# SUMMARY
# ============================================

echo ""
echo "================================================"
echo "✅ Restructuring Complete!"
echo "================================================"
echo ""
echo "New Structure:"
echo "  📦 backend/src/         - Source code"
echo "  🧪 backend/tests/       - Test suite"
echo "  🎨 frontend/src/        - React components"
echo "  📚 docs/                - Documentation"
echo "  🔧 scripts/             - Utility scripts"
echo ""
echo "Next Steps:"
echo "  1. Update import statements"
echo "  2. Run tests"
echo "  3. Update documentation"
echo ""

