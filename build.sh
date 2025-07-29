#!/bin/bash

# This script runs on Netlify's servers to securely inject your API keys.

# Exit immediately if any command fails, to prevent a broken deployment.
set -e

echo "--- Starting build process ---"

# 1. Define the publish directory and create it, ensuring it's clean.
PUBLISH_DIR="dist"
rm -rf $PUBLISH_DIR
mkdir -p $PUBLISH_DIR
echo "Clean publish directory '$PUBLISH_DIR' created."

# 2. Copy all your application files into the publish directory.
echo "Copying application files..."
# Using rsync to copy all files and folders except for the deployment-specific ones.
rsync -av --exclude 'dist' --exclude '.git*' --exclude 'build.sh' --exclude 'netlify.toml' --exclude 'node_modules' . $PUBLISH_DIR/
echo "Files copied successfully."

# 3. Define the path to the file that needs key replacement.
TARGET_FILE="$PUBLISH_DIR/services/ttsService.ts"

# 4. Check if the target file exists before trying to modify it.
if [ ! -f "$TARGET_FILE" ]; then
  echo "ERROR: Target file for key injection not found at $TARGET_FILE"
  exit 1
fi
echo "Target file found at $TARGET_FILE."

# 5. Check if the API keys are set in the Netlify environment.
if [ -z "$API_KEY" ] || [ -z "$ELEVENLABS_API_KEY" ]; then
  echo "ERROR: One or both API keys (API_KEY, ELEVENLABS_API_KEY) are not set in the Netlify UI."
  exit 1
fi
echo "API keys found in environment."

# 6. Replace the placeholder strings with the actual API keys.
# Using | as a separator for sed to avoid issues if keys contain slashes.
echo "Injecting API keys..."
sed -i.bak "s|__GEMINI_API_KEY_PLACEHOLDER__|$API_KEY|g" "$TARGET_FILE"
sed -i.bak "s|__ELEVENLABS_API_KEY_PLACEHOLDER__|$ELEVENLABS_API_KEY|g" "$TARGET_FILE"

# 7. Clean up the backup files created by sed.
rm "$TARGET_FILE.bak"

echo "API keys injected successfully."
echo "--- Build process complete ---"
