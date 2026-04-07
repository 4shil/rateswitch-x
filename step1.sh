#!/bin/bash
# Step 1: Dark Theme Scroll Indicator

# For index.tsx
sed -i 's|</ScreenWrapper>|    <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, backgroundColor: "transparent", borderBottomWidth: 40, borderBottomColor: "rgba(18,18,18,0.8)", opacity: 0.5, pointerEvents: "none" }} />\n</ScreenWrapper>|' src/app/\(tabs\)/index.tsx

# For archive.tsx
sed -i 's|</ScreenWrapper>|    <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, backgroundColor: "transparent", borderBottomWidth: 40, borderBottomColor: "rgba(18,18,18,0.8)", opacity: 0.5, pointerEvents: "none" }} />\n</ScreenWrapper>|' src/app/\(tabs\)/archive.tsx

# For profile.tsx
sed -i 's|</ScreenWrapper>|    <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, backgroundColor: "transparent", borderBottomWidth: 40, borderBottomColor: "rgba(18,18,18,0.8)", opacity: 0.5, pointerEvents: "none" }} />\n</ScreenWrapper>|' src/app/\(tabs\)/profile.tsx

git add src/app/\(tabs\)/index.tsx src/app/\(tabs\)/archive.tsx src/app/\(tabs\)/profile.tsx
git commit -m "feat: Dark Theme Scroll Indicator"
git push origin main
