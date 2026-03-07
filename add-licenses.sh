#!/bin/bash

YEAR=2026
LICENSE_BODY="MIT License

Copyright (c) $YEAR Ashil

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the \"Software\"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE."

ENCODED=$(echo "$LICENSE_BODY" | base64 -w 0)

# Repos that need MIT license (already have: Password-Manager, Qraw-QR, Fenster, deonai-cli)
REPOS=(Atlas DeonAi TeaAi Qotizs Giffy Musicya rateswitch-x MemoryLink-AR LearnPD Axium-TempFiles kinemouse Nebula-Mini Qubyts AiraBot)

for repo in "${REPOS[@]}"; do
  echo -n "$repo ... "
  
  # Check if LICENSE already exists
  SHA=$(gh api repos/4shil/$repo/contents/LICENSE --jq '.sha' 2>/dev/null)
  
  if [ -n "$SHA" ] && [ "$SHA" != "null" ]; then
    # Update existing
    RESULT=$(gh api --method PUT repos/4shil/$repo/contents/LICENSE \
      -f message="Add MIT license" \
      -f content="$ENCODED" \
      -f sha="$SHA" \
      --jq '.commit.sha' 2>/dev/null)
  else
    # Create new
    RESULT=$(gh api --method PUT repos/4shil/$repo/contents/LICENSE \
      -f message="Add MIT license" \
      -f content="$ENCODED" \
      --jq '.commit.sha' 2>/dev/null)
  fi
  
  if [ -n "$RESULT" ] && [ "$RESULT" != "null" ]; then
    echo "✓ ${RESULT:0:7}"
  else
    echo "✗ FAILED"
  fi
done

echo ""
echo "All done"
