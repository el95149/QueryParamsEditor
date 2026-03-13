#!/bin/bash

# Firefox Extension Packaging Script
# This script creates an XPI file for local installation

set -e

# Configuration
EXTENSION_NAME="QueryParamsEditor"
VERSION="1.0.0"
OUTPUT_FILE="${EXTENSION_NAME}-${VERSION}.xpi"

echo "=== Firefox Extension Packaging Script ==="
echo "Extension: ${EXTENSION_NAME}"
echo "Version: ${VERSION}"
echo "Output: ${OUTPUT_FILE}"
echo ""

# Check if required files exist
echo "Checking required files..."
REQUIRED_FILES=("manifest.json" "background.js" "popup.html" "popup.js" "styles.css")

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "ERROR: Required file '$file' not found!"
        exit 1
    fi
    echo "  ✓ $file"
done

echo ""
echo "Creating XPI package..."

# Create a temporary directory for packaging
TEMP_DIR=$(mktemp -d)

# Copy all extension files to temp directory
cp manifest.json background.js popup.html popup.js styles.css "$TEMP_DIR/"

# Create the XPI file (ZIP archive with .xpi extension)
# Change to temp dir, create zip, then change back
cd "$TEMP_DIR"
zip -r "${OUTPUT_FILE}" manifest.json background.js popup.html popup.js styles.css
cd - > /dev/null

# Move the XPI from temp dir to current directory
mv "${TEMP_DIR}/${OUTPUT_FILE}" ./

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "=== Packaging Complete ==="
echo "XPI file created: ${OUTPUT_FILE}"
echo ""
echo "To install the extension:"
echo "1. Open Firefox"
echo "2. Go to about:addons"
echo "3. Click the ⚙️ (settings) icon"
echo "4. Select 'Install Add-on From File...'"
echo "5. Choose the ${OUTPUT_FILE} file"
echo ""
echo "Note: For development/testing, you can also use about:debugging"
echo "      to load the extension temporarily without packaging."
