#!/bin/bash

update_repo() {
  local repo=$1
  local desc=$2
  local topics=$3
  
  echo "=== $repo ==="
  gh api --method PATCH repos/4shil/$repo -f description="$desc" --silent && echo "  ✓ description" || echo "  ✗ desc failed"
  
  # topics as array
  TOPIC_ARRAY=$(echo $topics | tr ' ' '\n' | jq -R . | jq -sc .)
  gh api --method PUT repos/4shil/$repo/topics \
    --input - <<< "{\"names\": $TOPIC_ARRAY}" --silent && echo "  ✓ topics" || echo "  ✗ topics failed"
}

update_repo "Atlas" \
  "Bucket list app — set goals, track milestones, and map your adventures. React Native + Expo + Supabase." \
  "react-native expo supabase typescript mobile bucket-list"

update_repo "DeonAi" \
  "Terminal-inspired AI chat interface with multi-model support and persistent history. Next.js + FastAPI + Supabase." \
  "nextjs fastapi supabase typescript ai-chat multi-model"

update_repo "TeaAi" \
  "Multi-model AI chat app with glassmorphic UI. Supports Gemini and 45+ OpenRouter models with streaming responses." \
  "nextjs typescript ai gemini openrouter chatbot streaming"

update_repo "Password-Manager" \
  "Zero-knowledge local password vault. Stores credentials client-side — nothing leaves your device." \
  "password-manager nextjs typescript security privacy zero-knowledge"

update_repo "Qraw-QR" \
  "QR code generator for links, social profiles, and Wi-Fi credentials. No sign-up, no tracking." \
  "qr-code-generator nextjs typescript neo-brutalism wifi"

update_repo "Qotizs" \
  "Quote discovery app — browse, search, like, and save quotes with a Soft Neo-Brutalist design." \
  "nextjs typescript quotes neo-brutalism react tailwindcss"

update_repo "Axium-TempFiles" \
  "Temporary file transfer that deletes itself. Upload, get a link, set expiry — powered by S3 presigned URLs." \
  "file-sharing nextjs typescript aws-s3 temp-files self-destruct"

update_repo "Giffy" \
  "Browser-based video to GIF converter powered by FFmpeg.wasm. Your files never leave your device." \
  "gif-converter ffmpeg-wasm typescript browser-based video-to-gif"

update_repo "Musicya" \
  "Offline music player for Android with a Neo-Brutalist design. LRC lyrics, equalizer, and home screen widget." \
  "android kotlin music-player offline neo-brutalism equalizer"

update_repo "rateswitch-x" \
  "Privacy-first currency exchange dashboard. No accounts, no tracking. Real-time rates and history charts. Installable PWA." \
  "currency-exchange pwa vanilla-javascript privacy offline"

update_repo "MemoryLink-AR" \
  "Web-based AR platform for physical-to-digital memories. Scan a Polaroid, unlock the memory." \
  "ar augmented-reality nextjs three-js mindar webxr typescript"

update_repo "LearnPD" \
  "Interactive probability distribution explorer — visualize, compare, and calculate with 6 statistical models." \
  "probability statistics education javascript canvas gsap visualization"

update_repo "kinemouse" \
  "Zero-latency cross-platform virtual mouse controlled entirely by hand gestures via a standard webcam." \
  "computer-vision mediapipe python gesture-control virtual-mouse opencv"

update_repo "deonai-cli" \
  "Personal AI assistant for the terminal. 200+ models via OpenRouter, file read/write, git context, conversation history." \
  "cli python ai openrouter terminal llm"

update_repo "Nebula-Mini" \
  "Three.js learning project — interactive 3D scenes and WebGL experiments." \
  "threejs webgl 3d javascript learning"

update_repo "Qubyts" \
  "Three.js exploration of quantum computing concepts — visualized in WebGL." \
  "threejs webgl quantum-computing javascript visualization"

update_repo "Fenster" \
  "Tech fest website for Fenster 2025 — built with vanilla JS and GSAP animations." \
  "event-website javascript gsap techfest"

update_repo "AiraBot" \
  "OpenClaw-based AI assistant with emotional intelligence, Manglish support, and Kerala-specific features." \
  "ai-assistant typescript nodejs openclaw chatbot"

echo ""
echo "ALL DONE"
