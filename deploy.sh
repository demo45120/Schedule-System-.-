#!/bin/bash
# Quick deploy script for Render or Railway
# ใช้ script นี้ เพื่อเตรียม project สำหรับ deploy ไปยัง Render หรือ Railway

set -e

echo "🚀 Schedule System - Quick Deploy Setup"
echo "======================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
  echo "📦 Initializing git repository..."
  git init
  git config user.name "Schedule System"
  git config user.email "schedule@system.local"
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
  echo "⚙️  Creating .env from .env.example..."
  cp .env.example .env
  echo "   ⚠️  Edit .env with your Google Sheets ID and JWT secret"
fi

# Add files to git
echo "📝 Staging files for commit..."
git add .

# Show what will be committed
echo ""
echo "Files to commit:"
git diff --cached --name-only

# Create commit
echo ""
read -p "Ready to commit? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  git commit -m "Deploy preparation for Render/Railway" --allow-empty
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Push to GitHub:"
echo "   git push -u origin main"
echo ""
echo "2. Choose your platform:"
echo ""
echo "   📊 RENDER:"
echo "   - Go to https://render.com"
echo "   - New Web Service → Connect GitHub"
echo "   - Build: npm install"
echo "   - Start: node server.js"
echo ""
echo "   🚄 RAILWAY:"
echo "   - Go to https://railway.app"
echo "   - New Project → Deploy from GitHub"
echo "   - Set environment variables"
echo "   - Auto-deploy on push"
echo ""
echo "3. Add your Google credentials:"
echo "   - Upload credentials.json to both platforms"
echo "   - Set SPREADSHEET_ID in environment variables"
echo ""
echo "See RENDER_RAILWAY_DEPLOYMENT.md for detailed guide 📖"
