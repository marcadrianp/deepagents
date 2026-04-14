#!/bin/bash

# Setup script for Deep Agents Python backend

set -e

echo "Installing Python dependencies for Deep Agents backend..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate || . venv/Scripts/activate

# Upgrade pip
pip install --upgrade pip setuptools wheel

# Install dependencies
pip install -r requirements.txt

# Install the local deepagents library in development mode
echo "Installing Deep Agents SDK from libs..."
cd ../libs/deepagents
pip install -e .
cd ../../backend

echo ""
echo "✓ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set your ANTHROPIC_API_KEY:"
echo "   export ANTHROPIC_API_KEY='your-key-here'"
echo ""
echo "2. Run the backend:"
echo "   source venv/bin/activate  # or . venv/Scripts/activate on Windows"
echo "   python app.py"
echo ""
echo "3. In another terminal, run the Next.js frontend:"
echo "   npm run dev"
