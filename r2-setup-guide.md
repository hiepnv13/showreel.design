# 🚀 Hướng dẫn Setup R2 Bucket và Custom Domain

## Bước 1: Tạo R2 Bucket

1. Vào Cloudflare Dashboard
2. Chọn **R2 Object Storage** từ sidebar
3. Click **Create bucket**
4. Đặt tên bucket (ví dụ: `showreel-videos`)
5. Chọn region gần nhất với users của bạn

## Bước 2: Cấu hình Public Access

1. Vào bucket vừa tạo
2. Chọn tab **Settings**
3. Trong **Public access**, click **Allow Access**
4. Confirm việc enable public access

## Bước 3: Setup Custom Domain

### Option A: Sử dụng Cloudflare Domain
1. Vào **Custom domains** trong bucket settings
2. Click **Connect domain**
3. Nhập domain: `video.showreel.design`
4. Cloudflare sẽ tự động tạo DNS record

### Option B: External Domain
1. Tạo CNAME record trong DNS provider:
   ```
   video.showreel.design → your-bucket.r2.cloudflarestorage.com
   ```
2. Sau đó connect domain trong Cloudflare

## Bước 4: Cấu hình CORS (nếu cần)

Trong bucket settings → **CORS policy**:
```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

## Bước 5: Test Domain

Sau khi setup xong, test bằng cách:
1. Upload 1 file test vào `videos/test.mp4`
2. Truy cập: `https://video.showreel.design/videos/test.mp4`
3. Nếu file download được = thành công!

## 🔧 Troubleshooting

### Domain không hoạt động?
- Đợi 5-10 phút để DNS propagate
- Kiểm tra DNS với: `nslookup video.showreel.design`

### 403 Forbidden?
- Kiểm tra public access đã enable chưa
- Kiểm tra file path đúng chưa

### 404 Not Found?
- Kiểm tra file đã upload đúng thư mục `videos/` chưa
- Kiểm tra tên file có chính xác không