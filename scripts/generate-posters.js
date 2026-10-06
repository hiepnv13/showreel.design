/**
 * Generate Poster Images — showreel.design
 *
 * Download thumbnail MP4 từ R2 → ffmpeg trích frame → upload JPG lên R2
 *
 * Usage:
 *   node scripts/generate-posters.js              ← chạy tất cả
 *   node scripts/generate-posters.js --dry-run    ← chỉ list, không download/upload
 *   node scripts/generate-posters.js --skip-existing  ← bỏ qua poster đã có trên R2
 *   node scripts/generate-posters.js --concurrency 3  ← số file xử lý song song (default 5)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Load .env ───────────────────────────────────────────────────────────────

function loadEnv() {
  const envFile = path.join(__dirname, '.env');
  if (!fs.existsSync(envFile)) throw new Error('scripts/.env not found');
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && !k.startsWith('#')) process.env[k.trim()] = v.join('=').trim();
  });
}

loadEnv();

const ENV = {
  R2_ACCOUNT_ID:        process.env.R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID:     process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  R2_BUCKET:            process.env.R2_BUCKET,
  R2_PUBLIC_URL:        process.env.R2_PUBLIC_URL,
};

for (const [k, v] of Object.entries(ENV)) {
  if (!v) throw new Error(`Missing env var: ${k}`);
}

// ─── Args ────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SKIP_EXISTING = args.includes('--skip-existing');
const concurrencyIdx = args.indexOf('--concurrency');
const CONCURRENCY = concurrencyIdx !== -1 ? parseInt(args[concurrencyIdx + 1], 10) : 5;

// ─── R2 client ───────────────────────────────────────────────────────────────

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${ENV.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ENV.R2_ACCESS_KEY_ID,
    secretAccessKey: ENV.R2_SECRET_ACCESS_KEY,
  },
});

async function existsOnR2(key) {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: ENV.R2_BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function uploadToR2(localPath, r2Key, contentType = 'image/jpeg') {
  const body = fs.readFileSync(localPath);
  await r2.send(new PutObjectCommand({
    Bucket: ENV.R2_BUCKET,
    Key: r2Key,
    Body: body,
    ContentType: contentType,
  }));
  return `${ENV.R2_PUBLIC_URL}/${r2Key}`;
}

// ─── Read video list from markdown ───────────────────────────────────────────

function getVideoFileNames() {
  const videosDir = path.join(__dirname, '..', 'src', 'content', 'videos');
  const files = fs.readdirSync(videosDir).filter(f => f.endsWith('.md'));
  const results = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(videosDir, file), 'utf8');
    const match = content.match(/^videoFileName:\s*["']?(.+?)["']?\s*$/m);
    if (match) {
      results.push({ slug: file.replace('.md', ''), videoFileName: match[1] });
    }
  }

  return results;
}

// ─── Process one video ───────────────────────────────────────────────────────

const TMP_DIR = path.join(__dirname, '.tmp-posters');

async function processVideo(video, index, total) {
  const baseName = video.videoFileName.replace(/\.[^/.]+$/, '');
  const thumbKey = `Thumbnails/thumbnail_videos_${baseName}.mp4`;
  const posterKey = `Posters/poster_videos_${baseName}.jpg`;
  const thumbUrl = `${ENV.R2_PUBLIC_URL}/${thumbKey}`;
  const localMp4 = path.join(TMP_DIR, `${video.slug}.mp4`);
  const localJpg = path.join(TMP_DIR, `${video.slug}.jpg`);

  const prefix = `[${index + 1}/${total}]`;

  if (SKIP_EXISTING) {
    const exists = await existsOnR2(posterKey);
    if (exists) {
      console.log(`${prefix} ⏭  ${video.slug} — poster already exists`);
      return { slug: video.slug, status: 'skipped' };
    }
  }

  if (DRY_RUN) {
    console.log(`${prefix} 🔍 ${video.slug}`);
    console.log(`       thumb: ${thumbUrl}`);
    console.log(`       poster: ${posterKey}`);
    return { slug: video.slug, status: 'dry-run' };
  }

  try {
    // Download thumbnail MP4
    const res = await fetch(thumbUrl);
    if (!res.ok) {
      console.log(`${prefix} ❌ ${video.slug} — thumbnail not found (${res.status})`);
      return { slug: video.slug, status: 'no-thumbnail' };
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(localMp4, buffer);

    // ffmpeg: extract frame near end (9s), fallback to 5s then 0s
    let extracted = false;
    for (const ss of [9, 5, 0]) {
      try {
        execSync(
          `ffmpeg -i "${localMp4}" -ss ${ss} -frames:v 1 -q:v 4 "${localJpg}" -y`,
          { stdio: 'pipe' }
        );
        if (fs.existsSync(localJpg) && fs.statSync(localJpg).size > 0) {
          extracted = true;
          break;
        }
      } catch { /* try next timestamp */ }
    }

    if (!extracted) {
      console.log(`${prefix} ❌ ${video.slug} — ffmpeg failed to extract frame`);
      return { slug: video.slug, status: 'ffmpeg-error' };
    }

    const jpgSize = (fs.statSync(localJpg).size / 1024).toFixed(1);

    // Upload to R2
    const url = await uploadToR2(localJpg, posterKey);
    console.log(`${prefix} ✅ ${video.slug} — ${jpgSize}KB → ${posterKey}`);

    // Cleanup temp files
    if (fs.existsSync(localMp4)) fs.unlinkSync(localMp4);
    if (fs.existsSync(localJpg)) fs.unlinkSync(localJpg);

    return { slug: video.slug, status: 'done', size: jpgSize, url };
  } catch (err) {
    console.log(`${prefix} ❌ ${video.slug} — ${err.message}`);
    if (fs.existsSync(localMp4)) fs.unlinkSync(localMp4);
    if (fs.existsSync(localJpg)) fs.unlinkSync(localJpg);
    return { slug: video.slug, status: 'error', error: err.message };
  }
}

// ─── Batch runner with concurrency ───────────────────────────────────────────

async function runBatch(videos) {
  const results = [];
  for (let i = 0; i < videos.length; i += CONCURRENCY) {
    const batch = videos.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map((v, j) => processVideo(v, i + j, videos.length))
    );
    results.push(...batchResults);
  }
  return results;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🖼  Generate Poster Images — showreel.design');
  console.log('─'.repeat(60));

  const videos = getVideoFileNames();
  console.log(`Found ${videos.length} videos`);

  if (DRY_RUN) console.log('⚠️  DRY RUN — no downloads or uploads');
  if (SKIP_EXISTING) console.log('⏭  Skipping existing posters on R2');
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log('─'.repeat(60));

  if (!DRY_RUN) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
  }

  const results = await runBatch(videos);

  // Summary
  console.log('\n' + '─'.repeat(60));
  const done = results.filter(r => r.status === 'done').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const noThumb = results.filter(r => r.status === 'no-thumbnail').length;
  const errors = results.filter(r => r.status === 'error').length;
  console.log(`✅ Done: ${done}  ⏭ Skipped: ${skipped}  ❌ No thumbnail: ${noThumb}  💥 Error: ${errors}`);

  if (noThumb > 0) {
    console.log('\nVideos without thumbnails:');
    results.filter(r => r.status === 'no-thumbnail').forEach(r => console.log(`  - ${r.slug}`));
  }

  if (errors > 0) {
    console.log('\nErrors:');
    results.filter(r => r.status === 'error').forEach(r => console.log(`  - ${r.slug}: ${r.error}`));
  }

  // Cleanup tmp dir
  if (!DRY_RUN && fs.existsSync(TMP_DIR)) {
    fs.rmSync(TMP_DIR, { recursive: true });
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
