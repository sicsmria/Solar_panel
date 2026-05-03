#!/bin/bash
# solar-results 갤러리 로컬 미리보기 (macOS/Linux)
cd "$(dirname "$0")"
echo "갤러리 미리보기: http://localhost:8888"
python3 -m http.server 8888
