#!/bin/bash

# This script runs on Netlify's servers to securely inject your API keys.
# It will exit immediately if any command fails.
set -e

echo "--- Starting build process ---"

# Define the publish directory.
PUBLISH_DIR="dist"

# Create a clean publish directory for the new build.
echo "1. Creating clean publish directory: $PUBLISH_DIR"
rm -rf $PUBLISH_DIR
mkdir -p $PUBLISH_DIR

# Copy all application files into the publish directory.
echo "2. Copying application files to $PUBLISH_DIR..."
rsync -av --exclude 'dist' --exclude '.git*' --exclude 'build.sh' --exclude 'netlify.toml' --exclude 'node_modules' . $PUBLISH_DIR/
echo "   ...files copied successfully."

# Define the path to the file that needs key replacement.
TARGET_FILE="$PUBLISH_DIR/services/ttsService.ts"

# Check if the target file was copied correctly.
echo "3. Verifying target file exists at: $TARGET_FILE"
if [ ! -f "$TARGET_FILE" ]; then
  echo "   ERROR: Target file for key injection not found! Build cannot continue."
  exit 1
fi
echo "   ...target file found."

# Check if the API keys are set in the Netlify environment variables.
echo "4. Verifying API keys are set in the environment..."
if [ -z "$API_KEY" ] || [ -z "$ELEVENLABS_API_KEY" ]; then
  echo "   ERROR: One or both API keys (API_KEY, ELEVENLABS_API_KEY) are not set in the Netlify UI. Build cannot continue."
  exit 1
fi
echo "   ...API keys found."

# Replace the placeholder strings with the actual API keys from the environment.
echo "5. Injecting API keys into $TARGET_FILE..."
sed -i.bak "s|__GEMINI_API_KEY_PLACEHOLDER__|$API_KEY|g" "$TARGET_FILE"
sed -i.bak "s|__ELEVENLABS_API_KEY_PLACEHOLDER__|$ELEVENLABS_API_KEY|g" "$TARGET_FILE"
echo "   ...API keys injected."

# Clean up the backup files created by the 'sed' command.
rm "$TARGET_FILE.bak"

echo "--- Build process complete ---"
