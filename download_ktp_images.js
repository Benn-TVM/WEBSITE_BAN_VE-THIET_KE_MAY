/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const https = require('https');

const products = [
  { code: 'CAD-MCT025', page: 'https://machinektp.com/may-nganh-gach/may-cat-gach-da-day-chuyen-tu-dong-mct-025.html' },
  { code: 'CAD-VENUS024P', page: 'https://machinektp.com/may-nganh-gach/may-lip-canh-gach-da-venus-024p.html' },
  { code: 'CAD-MCG023-1', page: 'https://machinektp.com/may-nganh-gach/may-cat-gach-mcg-023-1.html' },
  { code: 'CAD-MCG800', page: 'https://machinektp.com/may-nganh-gach/may-cat-gach-day-ban-mcg800.html' },
  { code: 'CAD-MBG020', page: 'https://machinektp.com/may-nganh-gach/may-bo-gach-len-tuong-tu-dong-mbg-020.html' },
  { code: 'CAD-MHL023', page: 'https://machinektp.com/may-nganh-da/may-mai-vac-canh-da-hoa-cuong-mhl-0231.html' },
  { code: 'CAD-WATEJET-SHUTTLE', page: 'https://machinektp.com/may-nganh-da/may-cat-tia-nuoc-5-truc-watejet.html' },
  { code: 'CAD-MCD800', page: 'https://machinektp.com/may-nganh-da/may-xe-da-khoi-mcd800.html' }
];

const targetDir = path.join(__dirname, 'public', 'images', 'products');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

async function fetchPageImages(url) {
  try {
    const res = await fetch(url);
    const text = await res.text();
    // Look for uploads/ images
    const imgMatches = text.match(/\/uploads\/[a-zA-Z0-9_\-.]+\.(jpg|png|jpeg|webp)/gi);
    if (imgMatches && imgMatches.length > 0) {
      return [...new Set(imgMatches)];
    }
  } catch (e) {
    console.error('Error fetching page', url, e.message);
  }
  return [];
}

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const fullUrl = url.startsWith('http') ? url : `https://machinektp.com${url}`;
    console.log(`Downloading ${fullUrl} to ${dest}...`);
    https.get(fullUrl, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download ${fullUrl}, status: ${response.statusCode}`));
      }
      const fileStream = fs.createWriteStream(dest);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(true);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  for (const item of products) {
    console.log(`Processing ${item.code}...`);
    const images = await fetchPageImages(item.page);
    console.log(`Found images for ${item.code}:`, images);
    if (images && images.length > 0) {
      // Pick first non-logo image
      const productImg = images.find(img => !img.includes('logo') && !img.includes('banner')) || images[0];
      const ext = path.extname(productImg) || '.jpg';
      const destPath = path.join(targetDir, `${item.code}${ext}`);
      try {
        await downloadFile(productImg, destPath);
        console.log(`Saved ${item.code} image successfully!`);
      } catch (err) {
        console.error(`Failed to download image for ${item.code}:`, err.message);
      }
    }
  }
}

main();
