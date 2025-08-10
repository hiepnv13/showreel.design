# 📹 Hướng dẫn Upload Videos lên R2

## Cách 1: Upload qua Cloudflare Dashboard (Dễ nhất)

1. Vào Cloudflare Dashboard → R2 Object Storage
2. Chọn bucket của bạn
3. Click "Upload" 
4. Tạo folder `videos/` (nếu chưa có)
5. Upload các file video với tên chính xác:

### ✅ Tên file cần upload:
- `3d-animation-demo-reel.mp4`
- `brand-identity-animation.mp4` 
- `character-animation-reel.mp4`
- `motion-graphics-showreel-2024.mp4`
- `ui-ux-animation-showcase.mp4`

### 📂 Cấu trúc thư mục trong R2:
```
bucket-root/
└── videos/
    ├── 3d-animation-demo-reel.mp4
    ├── brand-identity-animation.mp4
    ├── character-animation-reel.mp4
    ├── motion-graphics-showreel-2024.mp4
    └── ui-ux-animation-showcase.mp4
```

## Cách 2: Upload qua Wrangler CLI

### Cài đặt Wrangler:
```bash
npm install -g wrangler
wrangler login
```

### Upload files:
```bash
# Upload từng file
wrangler r2 object put showreel-videos/videos/3d-animation-demo-reel.mp4 --file ./path/to/your/video.mp4

# Hoặc upload hàng loạt
wrangler r2 object put showreel-videos/videos/ --file ./videos/ --recursive
```

## Cách 3: Upload qua AWS CLI (với S3 compatible API)

### Cấu hình:
```bash
aws configure set aws_access_key_id YOUR_R2_ACCESS_KEY
aws configure set aws_secret_access_key YOUR_R2_SECRET_KEY
aws configure set region auto
```

### Upload:
```bash
aws s3 cp ./videos/ s3://showreel-videos/videos/ --recursive --endpoint-url https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
```

## 🔍 Kiểm tra sau khi upload

Chạy script verification:
```bash
npx tsx src/scripts/verifyR2.ts
```

Nếu thành công, bạn sẽ thấy ✅ cho tất cả URLs.