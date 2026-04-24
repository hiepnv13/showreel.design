#!/bin/bash
# ============================================================
#  add-video.sh — Showreel.design upload pipeline
#  Usage: ./add-video.sh "/path/to/Your Video Name.mp4"
# ============================================================

set -e

# ── Config ──────────────────────────────────────────────────
RCLONE_REMOTE="r2"                        # tên remote trong rclone config
R2_BUCKET="showreeldesign"               # tên bucket trên Cloudflare R2
R2_VIDEO_PATH="videos"                    # folder chứa video gốc
R2_THUMB_PATH="Thumbnails"               # folder chứa thumbnail
THUMB_DURATION=10                         # độ dài thumbnail (giây)
THUMB_WIDTH=853
THUMB_HEIGHT=480
DEV_SERVER="http://localhost:4321"
# ────────────────────────────────────────────────────────────

# ── Màu sắc terminal ────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

log()     { echo -e "${BLUE}▶${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warn()    { echo -e "${YELLOW}⚠${NC} $1"; }
error()   { echo -e "${RED}✗${NC} $1"; exit 1; }
header()  { echo -e "\n${BOLD}${CYAN}$1${NC}"; }
# ────────────────────────────────────────────────────────────

# ── Kiểm tra dependencies ────────────────────────────────────
check_deps() {
  header "Kiểm tra dependencies..."
  command -v ffmpeg  >/dev/null 2>&1 || error "ffmpeg chưa cài. Chạy: brew install ffmpeg"
  command -v rclone  >/dev/null 2>&1 || error "rclone chưa cài. Xem hướng dẫn setup ở cuối script."
  success "ffmpeg và rclone đã sẵn sàng"
}

# ── Validate input ───────────────────────────────────────────
validate_input() {
  [[ -z "$1" ]] && error "Thiếu đường dẫn video.\nCách dùng: ./add-video.sh \"/path/to/Video Name.mp4\""
  [[ ! -f "$1" ]] && error "Không tìm thấy file: $1"

  local ext="${1##*.}"
  [[ ! "$ext" =~ ^(mp4|webm|mov|avi)$ ]] && error "Định dạng không hỗ trợ: .$ext (hỗ trợ: mp4, webm, mov, avi)"
}

# ── Main ─────────────────────────────────────────────────────
INPUT_FILE="$1"
validate_input "$INPUT_FILE"
check_deps

# Lấy tên file (không có extension và không có đường dẫn)
BASENAME=$(basename "$INPUT_FILE")
VIDEO_NAME="${BASENAME%.*}"
THUMB_NAME="thumbnail_videos_${VIDEO_NAME}.mp4"

# Thư mục output tạm
TMP_DIR=$(mktemp -d)
COMPRESSED_FILE="$TMP_DIR/${VIDEO_NAME}.mp4"
THUMB_FILE="$TMP_DIR/${THUMB_NAME}"

echo ""
echo -e "${BOLD}Video:${NC} $VIDEO_NAME"
echo -e "${BOLD}Thumb:${NC} $THUMB_NAME"
echo ""

# ── Bước 1: Nén video ────────────────────────────────────────
header "Bước 1/4 — Nén video..."
log "Đang nén: $VIDEO_NAME.mp4"

ffmpeg -i "$INPUT_FILE" \
  -c:v libx264 \
  -crf 23 \
  -preset slow \
  -c:a aac \
  -b:a 128k \
  -movflags +faststart \
  -y \
  "$COMPRESSED_FILE" 2>/dev/null

success "Nén xong → $(du -sh "$COMPRESSED_FILE" | cut -f1)"

# ── Bước 2: Tạo thumbnail video ──────────────────────────────
header "Bước 2/4 — Tạo thumbnail video (${THUMB_DURATION}s, ${THUMB_WIDTH}×${THUMB_HEIGHT})..."

ffmpeg -i "$INPUT_FILE" \
  -t "$THUMB_DURATION" \
  -vf "scale=${THUMB_WIDTH}:${THUMB_HEIGHT}:force_original_aspect_ratio=decrease,pad=${THUMB_WIDTH}:${THUMB_HEIGHT}:(ow-iw)/2:(oh-ih)/2" \
  -c:v libx264 \
  -crf 26 \
  -preset fast \
  -an \
  -movflags +faststart \
  -y \
  "$THUMB_FILE" 2>/dev/null

success "Thumbnail xong → $(du -sh "$THUMB_FILE" | cut -f1)"

# ── Bước 3: Upload lên R2 ─────────────────────────────────────
header "Bước 3/4 — Upload lên Cloudflare R2..."

log "Upload video gốc → R2:${R2_BUCKET}/${R2_VIDEO_PATH}/"
rclone copy "$COMPRESSED_FILE" "${RCLONE_REMOTE}:${R2_BUCKET}/${R2_VIDEO_PATH}/" --progress

log "Upload thumbnail → R2:${R2_BUCKET}/${R2_THUMB_PATH}/"
rclone copy "$THUMB_FILE" "${RCLONE_REMOTE}:${R2_BUCKET}/${R2_THUMB_PATH}/" --progress

success "Upload hoàn tất"

# ── Dọn dẹp temp ─────────────────────────────────────────────
rm -rf "$TMP_DIR"

# ── Bước 4: Mở form upload ──────────────────────────────────
header "Bước 4/4 — Mở /upload để điền metadata..."

# Kiểm tra dev server đang chạy chưa
if curl -s --max-time 2 "$DEV_SERVER" >/dev/null 2>&1; then
  UPLOAD_URL="${DEV_SERVER}/upload?videoName=$(python3 -c "import urllib.parse; print(urllib.parse.quote('${VIDEO_NAME}'))")"
  log "Mở trình duyệt: $UPLOAD_URL"
  open "$UPLOAD_URL"
  echo ""
  echo -e "  ${YELLOW}Điền form xong → Submit → file .md sẽ tự tạo${NC}"
  echo -e "  ${YELLOW}Sau đó chạy: git add -A && git commit -m \"feat: Add ${VIDEO_NAME}\" && git push${NC}"
else
  warn "Dev server chưa chạy. Hãy chạy 'npm run dev' rồi vào:"
  echo -e "  ${CYAN}${DEV_SERVER}/upload${NC}"
  echo ""
  echo -e "  Điền Video Name: ${BOLD}${VIDEO_NAME}${NC}"
fi

echo ""
success "Pipeline hoàn thành!"
echo ""
echo -e "  Video trên R2 : ${CYAN}https://video.showreel.design/videos/${VIDEO_NAME}.mp4${NC}"
echo -e "  Thumb trên R2 : ${CYAN}https://video.showreel.design/Thumbnails/${THUMB_NAME}${NC}"
echo ""
