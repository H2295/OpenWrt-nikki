#!/bin/sh

# Detect system architecture
ARCH=$(uname -m)
case "$ARCH" in
  x86_64) ARCH_ID="linux-amd64" ;;
  aarch64 | arm64) ARCH_ID="linux-arm64" ;;
  i386 | i686) ARCH_ID="linux-386" ;;
  mips64el) ARCH_ID="linux-mips64le" ;;
  mipsel) ARCH_ID="linux-mipsle" ;;
  mips) ARCH_ID="linux-mips-softfloat" ;;
  loongarch64) ARCH_ID="linux-loong64" ;;
  *) echo "Unsupported architecture: $ARCH"; exit 1 ;;
esac

# Get current installed version
if command -v sing-box >/dev/null 2>&1; then
  CURRENT_VERSION=$(sing-box version | head -n1 | awk '{print $3}' | sed 's/^v//')
else
  CURRENT_VERSION=""
fi

# Fetch latest beta or rc version from GitHub
VERSION=$(curl -s https://api.github.com/repos/SagerNet/sing-box/releases |
  grep '"tag_name":' |
  cut -d '"' -f4 |
  grep -E '(-beta|-rc)' |
  head -n1)

if [ -z "$VERSION" ]; then
  echo "Failed to retrieve beta or rc version"; exit 1
fi

VERSION_CLEAN=$(echo "$VERSION" | sed 's/^v//')

# Compare versions
if [ "$CURRENT_VERSION" = "$VERSION_CLEAN" ]; then
  echo "sing-box is already up to date: $CURRENT_VERSION"
  exit 0
fi

# Construct download URL
URL="https://github.com/SagerNet/sing-box/releases/download/$VERSION/sing-box-${VERSION_CLEAN}-${ARCH_ID}.tar.gz"

echo "Using version: $VERSION"
echo "Architecture: $ARCH_ID"
echo "Downloading: $URL"

# Use /tmp as working directory
TMPDIR="/tmp/sing-box-install.$$"
mkdir -p "$TMPDIR"
cd "$TMPDIR" || exit 1

curl -L -o sing-box.tar.gz "$URL"
SIZE=$(wc -c < sing-box.tar.gz)
if [ "$SIZE" -lt 10240 ]; then
  echo "Download failed: file too small, possibly an error page"; exit 1
fi

# Extract and locate binary
tar -xzf sing-box.tar.gz || { echo "Extraction failed"; exit 1; }
BIN_PATH=$(find . -type f -name "sing-box")

if [ -z "$BIN_PATH" ]; then
  echo "sing-box binary not found"; exit 1
fi

# Backup old version to /tmp
if [ -f /usr/bin/sing-box ]; then
  cp /usr/bin/sing-box "/tmp/sing-box.bak.$(date +%s)"
  echo "Old version backed up to /tmp"
fi

# Replace and set permissions
cp "$BIN_PATH" /usr/bin/sing-box
chmod +x /usr/bin/sing-box
echo "Update completed: $VERSION"

# Show current version
echo "Current sing-box version:"
/usr/bin/sing-box version

# Cleanup
rm -rf "$TMPDIR"
