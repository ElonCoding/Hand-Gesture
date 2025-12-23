# Voice Activation System - Setup Script
# This script helps set up the environment configuration

echo "🎤 Voice Activation System Setup"
echo "================================="

# Check if we're in the voiceActivation directory
if (Test-Path ".env.example") {
    echo "✅ Found .env.example file"
} else {
    echo "❌ .env.example file not found in current directory"
    echo "Please run this script from the voiceActivation directory"
    exit 1
}

# Copy the example file to create .env
if (Test-Path ".env") {
    echo "⚠️  .env file already exists"
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -eq "y" -or $overwrite -eq "Y") {
        Copy-Item ".env.example" ".env" -Force
        echo "✅ .env file updated"
    } else {
        echo "ℹ️  Keeping existing .env file"
    }
} else {
    Copy-Item ".env.example" ".env"
    echo "✅ Created .env file from template"
}

echo ""
echo "📋 Next Steps:"
echo "1. Edit the .env file with your configuration"
echo "2. Set your GEMINI_API_KEY (required)"
echo "3. Configure other settings as needed"
echo "4. Install dotenv: npm install dotenv"
echo ""
echo "💡 Quick Start:"
echo "- Use quickStart() function for easy setup"
echo "- Or use createVoiceSystemFromEnv() for full environment config"
echo ""
echo "🚀 You're ready to go!"