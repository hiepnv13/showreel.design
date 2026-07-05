# 🗺️ Kế hoạch Refactor — showreel.design

> Kết quả review toàn bộ code ngày 2026-07-04.
> Cách dùng: mở Claude Code và nói **"Làm Bước N trong plan.md"**. Mỗi bước độc lập — làm xong bước nào site vẫn chạy bình thường. Sau mỗi bước: chạy `npm run build` để kiểm tra, xem thử site bằng `npm run dev`, rồi mới commit.
> Đánh dấu `[x]` vào các mục đã xong để lần sau biết đang làm tới đâu.

---

## Tổng quan hiện trạng (tóm tắt review)

- ✅ **An toàn**: không có mật khẩu/API key nào trong code; API tạo video đã khóa đúng; `.gitignore` chuẩn.
- 🔴 **2 lỗi người dùng đang gặp**: phân trang taxonomy dẫn tới 404 (video 25+ không xem được), phân trang tìm kiếm hỏng.
- 🟡 **~1/3 code là đồ cũ**: thiết kế phiên bản trước (Header/Footer/Hero/MasonryGrid/VideoPlayer) còn sót lại; GSAP tải trên mọi trang nhưng không bao giờ chạy.
- 🟡 **Trùng lặp**: taxonomy định nghĩa ở 4 nơi (đã lệch nhau), ô tìm kiếm viết 4 lần, 5 trang phân loại gần giống hệt, hàm `generateSlug` viết 3 lần.
- 🟡 **Nền tảng**: site chạy chế độ SSR trên Netlify không cần thiết; không có bước kiểm tra code tự động.

---

## ✅ Bước 0 — Dọn việc dang dở trong git (làm trước tiên, ~10 phút)

Hiện có các file **chưa commit** (chưa được backup, mất máy là mất):

- [ ] Quyết định số phận trang Shorts: `src/pages/shorts/`, `src/content/shorts/` đang chưa commit.
  - Nếu **giữ**: phải khai báo collection `shorts` trong `src/content.config.ts` (hiện chỉ có `videos`, `tools`, `courses` — vì thế trang shorts đang hiển thị trống), rồi commit.
  - Nếu **chưa dùng**: xóa hoặc cất ra ngoài project.
- [ ] Commit `src/content/tools/motion-so.md` và `public/uploads/Link-square.svg` (hoặc xóa nếu không cần).

## ✅ Bước 1 — Thêm "lưới an toàn" (~15 phút)

Để mọi bước refactor sau đều được máy kiểm tra tự động, tránh sửa nhầm.

- [ ] Cài: `npm install --save-dev typescript @astrojs/check`
- [ ] Thêm vào `package.json` phần scripts: `"check": "astro check"`
- [ ] Chạy `npm run check` lần đầu, ghi lại số lỗi hiện có (baseline). Không cần sửa hết ngay — chỉ cần đảm bảo các bước sau **không làm tăng** số lỗi.
- [ ] Sửa `.gitignore`: đổi 2 dòng `.env` / `.env.production` thành 1 dòng `.env*` (phòng sau này có file env khác).

## 🔴 Bước 2 — Sửa lỗi phân trang taxonomy (lỗi 404) — QUAN TRỌNG NHẤT

**Vấn đề**: Các trang `/industry/...`, `/style/...`, `/sound/...`, `/year/...` hiển thị nút chuyển trang, nhưng link trang 2+ (ví dụ `/industry/tech-saas/2`) **không tồn tại** → 404. Mục "advertising-commercial" có 74 video thì 50 video không thể xem được từ trang phân loại. Ảnh hưởng cả SEO.

**Cách sửa** (gộp luôn việc khử trùng lặp 5 trang):

- [ ] Tạo 1 component/layout chung `TaxonomyPage` dùng cho cả 5 loại trang phân loại — hiện 5 file này giống nhau ~90%:
  - `src/pages/category/[slug].astro` + `src/pages/category/[slug]/[page].astro`
  - `src/pages/industry/[slug].astro`
  - `src/pages/style/[slug].astro`
  - `src/pages/sound/[slug].astro`
  - `src/pages/year/[year].astro`
- [ ] Thêm route phân trang (`[page]`) cho industry / style / sound / year — giống cấu trúc category đang có.
- [ ] Sửa luôn: category đang có **2 URL trùng nội dung** (`/category/x` và `/category/x/1`) — bỏ trang `/1`, và trang `[page]` đang thiếu `description`/`canonicalUrl` (SEO).
- [ ] Sửa `Pagination.astro`: prop `filterParams` được truyền vào (`VideoGrid.astro:11,53`) nhưng component không nhận và không gắn vào URL → chuyển trang làm mất bộ lọc.
- [ ] Kiểm tra: vào `/industry/tech-saas` (67 video) → bấm trang 2, 3 phải xem được video.

## 🔴 Bước 3 — Sửa lỗi phân trang tìm kiếm

**Vấn đề**: `src/pages/search.astro:24-25` cắt danh sách kết quả theo trang, rồi truyền danh sách **đã cắt** vào `VideoGrid` — component này cắt thêm lần nữa và tính lại số trang từ 24 kết quả. Hậu quả: tìm ra >24 kết quả thì không hiện nút chuyển trang; vào thẳng `?page=2` thì trang trống.

- [ ] Sửa để chỉ cắt danh sách 1 lần (truyền danh sách đầy đủ + số trang hiện tại vào `VideoGrid`, hoặc để search tự phân trang và tắt phân trang của VideoGrid).
- [ ] Sửa dạng URL phân trang cho search: `baseUrl="/search?q=x"` hiện sinh link sai kiểu `/search?q=x/2` — phải là `/search?q=x&page=2`.
- [ ] Kiểm tra: tìm từ khóa ra nhiều kết quả (ví dụ "showreel") → chuyển trang hoạt động.

## 🧹 Bước 4 — Đại dọn dẹp code chết (giảm ~25-30% code, site nhẹ hơn ngay)

### 4a. Xóa component không dùng (đã xác minh không nơi nào import)
- [ ] `src/components/Hero.astro`
- [ ] `src/components/MasonryGrid.astro`
- [ ] `src/components/VideoPlayer.astro` (349 dòng — lưu ý: đây là component RỜI không dùng; trang chi tiết video có player riêng viết thẳng trong `videos/[slug].astro`)
- [ ] `src/components/Preloader.astro` (chỉ còn là vỏ rỗng) + bỏ import/render trong `src/layouts/Layout.astro:3,87`

### 4b. Xóa script chết + GSAP (tăng tốc mọi trang)
- [ ] `src/scripts/searchHandler.js` (223 dòng, không nơi nào import)
- [ ] `src/scripts/pageTransitions.js` + bỏ import ở `Layout.astro:104-107` — script này chờ sự kiện ViewTransitions mà site không dùng, nên **không bao giờ chạy** nhưng kéo cả thư viện GSAP vào mọi trang.
- [ ] `src/scripts/gridActions.js` + bỏ import ở `VideoGrid.astro:57-60`, `search.astro:109`, `tag/[slug].astro:135` — nhắm vào các thuộc tính `[data-sort]`/`[data-shuffle]`/`[data-search]` không tồn tại.
- [ ] Sau khi xóa 2 file trên, nếu không còn chỗ nào import `gsap` → gỡ luôn: `npm uninstall gsap imagesloaded @types/imagesloaded`
- [ ] Gỡ dependency trùng: `npm uninstall @studio-freight/lenis` (bản cũ đã đổi tên; code đang dùng bản mới `lenis`)

### 4c. Xóa trang thừa/trang cũ
- [ ] `src/pages/debug-search.astro` — trang debug đang chạy công khai trên production
- [ ] `src/pages/videos/index.astro` — bản homepage thiết kế cũ còn sót ở `/videos`, đang hiển thị 2 thiết kế chồng nhau
- [ ] Quyết định về `src/pages/upload.astro` + `src/pages/api/create-video.json.ts`: chỉ hoạt động khi chạy local (dev). Nếu bạn đã quen dùng Decap CMS (`/admin`) để đăng video thì **xóa cả hai**. Nếu vẫn dùng form upload local thì giữ, nhưng thêm `export const prerender = true` … hoặc đơn giản là đợi Bước 6 (site tĩnh) xử lý.
- [ ] Sau khi xóa 2 trang dùng Header/Footer cũ → xóa luôn `src/components/Header.astro` và `src/components/Footer.astro` (kiểm tra lại bằng grep trước khi xóa). Lưu ý: form Klaviyo trong Footer đã có bản sao ở `index.astro:32` nên không mất chức năng.
- [ ] Cân nhắc xóa/di chuyển script tiện ích không thuộc app: `src/scripts/verifyR2.ts`, `src/scripts/testSingleVideo.ts` (chuyển ra thư mục `tools/` ngoài `src/` nếu muốn giữ).
- [ ] `src/types/video.ts` — không nơi nào import và nội dung đã sai lệch với thực tế → xóa.

### 4d. Dọn CSS chết
- [ ] Trong `src/styles/global.css`: xóa các khối không còn dùng — `.masonry-item`, `.video-thumbnail`, `.card-elevated`, `.text-gradient`, `.preloader-logo` + keyframes, `.fade-in`/`.slide-up`/`.scale-in`, toàn bộ `.gsap-*` và `.animation-delay-*`. (Xóa sau khi đã xóa các trang cũ ở 4c; grep từng class trước khi xóa.)
- [ ] `Sidebar.astro:521-581`: CSS cho `.partner-logo-wrap`/`.partner-tooltip` — markup không còn.
- [ ] `TopBar.astro`: CSS thừa `.banner-video-wrap`, `.banner-info-hidden`, `.topbar-search`; `.banner-info` khai báo 2 lần (dòng 468 và 569).
- [ ] Bỏ Font Awesome CDN trong `Layout.astro:52` nếu sau khi xóa Header cũ không còn chỗ nào dùng.

✔️ Sau bước này: `npm run build` + bấm thử qua các trang chính (home, chi tiết video, category, search, mobile menu).

## 🔧 Bước 5 — Gom taxonomy về 1 nguồn duy nhất

**Vấn đề**: danh mục phân loại đang định nghĩa ở **4 nơi** và đã lệch nhau (ví dụ "Fashion/Luxury" vs "Fashion & Luxury", "Finance/Banking" vs "Finance & Fintech"):
1. `src/content.config.ts:31-87` (zod enum — quy định giá trị hợp lệ)
2. `src/config/taxonomies.ts` (danh sách + nhãn hiển thị)
3. `public/admin/config.yml:114-170` (lựa chọn trong CMS)
4. `src/utils/videoUtils.ts:53-66` (bảng nhãn thứ 3)

- [ ] Chọn `src/config/taxonomies.ts` làm **nguồn duy nhất**.
- [ ] `content.config.ts` sinh zod enum từ taxonomies.ts (import, không chép tay).
- [ ] Xóa bảng nhãn trùng trong `videoUtils.ts` — mọi nơi dùng `getTaxonomyLabel` từ taxonomies.ts.
- [ ] Đối chiếu và sửa `public/admin/config.yml` cho khớp giá trị (file này của Decap CMS phải sửa tay, nhưng ghi chú rõ trong taxonomies.ts rằng "sửa ở đây thì phải sửa config.yml").
- [ ] Rà lại các file video markdown xem có giá trị nào lệch chuẩn (chạy build sẽ báo nếu zod từ chối).
- [ ] Gom luôn: hàm `generateSlug` đang viết 3 lần (`videoUtils.ts:200`, `api/create-video.json.ts:8`, `upload.astro:390`) → giữ 1 bản trong `videoUtils.ts`, các nơi khác import.
- [ ] Danh mục hiển thị icon ở `Sidebar.astro:82-88` đang hardcod
e 5 tên — chuyển vào taxonomies.ts.

## 🚀 Bước 6 — Chuyển site về tĩnh hoàn toàn (nhanh + ổn định hơn)

**Vấn đề**: `astro.config.mjs:12` bật `output: 'server'` khi deploy — cả site chạy như ứng dụng động trên Netlify dù 99% nội dung là tĩnh. Chỉ `search.astro` và `api/videos.json.ts` thật sự cần server.

- [ ] Chuyển tìm kiếm sang chạy phía trình duyệt: build sẵn 1 file JSON danh sách video (thay `api/videos.json.ts` bằng endpoint prerender tĩnh), trang search lọc bằng JavaScript trên trình duyệt.
- [ ] Đổi `astro.config.mjs` về `output: 'static'` (bỏ nhánh điều kiện NODE_ENV — dev và production giống nhau, tránh "dev chạy khác production").
- [ ] Xóa `@astrojs/netlify` adapter nếu không còn cần (`npm uninstall @astrojs/netlify`).
- [ ] Kiểm tra kỹ sau deploy lên nhánh staging/preview trước khi ra main: search, mọi trang taxonomy, trang chi tiết video, sitemap.

## 🧩 Bước 7 — Tách file khổng lồ + gom cấu hình site

### 7a. Tách `src/pages/videos/[slug].astro` (1.471 dòng: ~720 dòng CSS + ~390 dòng JS)
- [ ] Tách thành các component: `VideoDetailPlayer` (markup 100-242 + JS 1079-1436), `CreditsOverlay` (171-240), `ProjectDetailsTable` (261-320), `RelatedVideos` (338-354) — mỗi component mang theo CSS/JS của nó.
- [ ] Xóa code chết bên trong: JS dòng 1438-1469 (nhắm class `.related-video` không tồn tại), CSS `.film-perf`/`.perf-hole` (1023-1030), CSS markdown prose (937-974), hàm `formatTime` viết 2 lần (dòng 1111 và 1285).
- [ ] **Quyết định nội dung**: phần thân markdown của mỗi video (mô tả chi tiết, highlights) hiện **không bao giờ được hiển thị** trên trang (trang không gọi render). Chọn: (a) hiển thị nó lên — tốt cho SEO, hoặc (b) bỏ hẳn phần đó khỏi quy trình đăng video.

### 7b. Gom cấu hình rải rác vào 1 file `src/config/site.ts`
Để sau này bạn tự sửa thông tin site chỉ ở 1 chỗ:
- [ ] Tên site, tagline, link mạng xã hội (đang rải ở `Sidebar.astro:126`, `Footer`, `Layout.astro:47`)
- [ ] Danh sách partner + link (đang hardcode 2 nơi: `Sidebar.astro:133-148` và Footer; dots của slider Sidebar cũng đang hardcode 4 nút riêng — chuyển sang `.map()` như TopBar)
- [ ] Nội dung banner quảng cáo `bannerSlides` (đang nằm trong code `TopBar.astro:65-78`)
- [ ] Mã Google Analytics / AdSense / Clarity / Klaviyo (đang inline trong `Layout.astro:55-99`) + chỉ bật khi production để số liệu analytics không bị lẫn lượt xem lúc dev
- [ ] Hằng số layout: sidebar `209px` (2 nơi), header mobile `52px` (2 nơi), breakpoint `768px` (7+ nơi)

## ✨ Bước 8 — Đánh bóng (làm dần khi rảnh, không gấp)

- [ ] Gộp ô tìm kiếm thành 1 component `SearchBox` (hiện viết 4 lần: Sidebar, MobileHeader, FilterBar — Header cũ đã xóa ở bước 4)
- [ ] Gộp 2 slider (partner trong Sidebar + banner trong TopBar) — logic gần giống hệt, viết 2 kiểu khác nhau
- [ ] Trang tag: nút "Load More" không có chức năng (`tag/[slug].astro:118-127`) — xóa hoặc làm phân trang thật; hover preview đang tải video full thay vì bản nhẹ (`tag/[slug].astro:98` — dùng `thumbnailUrl` như `VideoGrid.astro:38`)
- [ ] `SmoothScroll` (Lenis) và CSS `scroll-behavior: smooth` (`global.css:117-119`) đang "giành nhau" — bỏ dòng CSS theo khuyến cáo của Lenis
- [ ] Sửa HTML lồng sai: `VideoGrid.astro:29` render thẻ `<main>` nằm trong `<main>` của trang → đổi thành `<section>`
- [ ] Slider partner chạy timer 5s mãi mãi kể cả trên mobile (sidebar đang ẩn) — dừng timer khi không hiển thị
- [ ] Thống nhất màu viền (`#f0f0f0` / `#eeeeee` / gray-100 đang lẫn lộn) và khai báo font Aileron 1 lần thay vì 6+ lần
- [ ] Kiểm tra cài đặt Netlify Identity của Decap CMS (`/admin`) là **invite-only** — cái này nằm trong Netlify dashboard, không nằm trong code

---

## 📌 Ghi chú vận hành

- Làm trên nhánh `dev`, xem ổn rồi mới merge `main` (quy trình hiện tại của bạn).
- Sau MỖI bước: `npm run check` (số lỗi không tăng) → `npm run build` (thành công) → `npm run dev` bấm thử → commit với message rõ ràng.
- Bước 2, 3 nên làm sớm nhất vì đang trực tiếp làm mất người xem. Bước 4 cho hiệu quả "dọn nhà" lớn nhất. Bước 6 nên làm sau khi 4 và 5 xong.
