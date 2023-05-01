const path = require('path');
const fs = require('fs');

const puppeteer = require('puppeteer');

const downloadsPath = path.resolve('./downloads');
const assetsPath = path.resolve('./assets');
const oldFilePath = path.join(assetsPath, 'HoloCure.zip');
const newFilePath = path.join(downloadsPath, 'HoloCure.zip');
const updateTimeFilePath = path.join(assetsPath, 'update-time.txt');
const uploadId = 7396354; // HoloCure upload id

async function setupBrowser() {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  return { browser, page };
}

async function downloadGame(page) {
  await page.goto('https://kay-yu.itch.io/holocure', {
    waitUntil: 'networkidle2',
  });

  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadsPath,
  });
  await page.click(`a[data-upload_id="${uploadId}"]`);
  console.log('Downloading...');

  return page;
}

async function waitUntilDownload(page) {
  return new Promise((resolve, reject) => {
    page._client().on('Page.downloadProgress', (e) => {
      if (e.state === 'completed') {
        console.log('Download finished');
        resolve();
      } else if (e.state === 'canceled') {
        reject();
      }
    });
  });
}

function isNewVersionAvailable() {
  const buffer1 = fs.readFileSync(oldFilePath);
  const buffer2 = fs.readFileSync(newFilePath);

  return !buffer1.equals(buffer2);
}

function handleNewVersion() {
  fs.rmSync(oldFilePath);
  fs.copyFileSync(newFilePath, oldFilePath);
  fs.writeFileSync(updateTimeFilePath, Date.now().toString(), {
    encoding: 'utf-8',
  });
}

async function main() {
  const { browser, page } = await setupBrowser();

  await downloadGame(page);
  await waitUntilDownload(page);

  if (isNewVersionAvailable()) {
    console.log('New version available!');
    handleNewVersion();
  } else {
    console.log('No new version');
  }

  browser.close();
}

main();
