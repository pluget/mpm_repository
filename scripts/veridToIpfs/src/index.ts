// Imports

import { NFTStorage, File, Blob } from "nft.storage";
import dotenv from "dotenv";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import path from "path";
import fs from "fs-extra";
// Load environment variables from .env file
dotenv.config();

puppeteer.use(StealthPlugin());

// Prepare

// Initialize NFT.storage client
const NFT_STORAGE_TOKEN = process.env.NFT_STORAGE_TOKEN || "";
const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });

const browser = await puppeteer.launch({
  headless: false,
  executablePath: "/run/current-system/sw/bin/google-chrome-stable",
});
const page = (await browser.pages())[0];

const downloadPath = path.resolve("./downloads");
const pageClient = await page.target().createCDPSession();
await pageClient.send("Page.setDownloadBehavior", {
  behavior: "allow",
  downloadPath: downloadPath,
});

const id = 32761;
const url = "resources/powernbt.9098/download?version=32761";

const response = await page.goto(`https://spigotmc.org/${url}`);

await page.waitForTimeout(5200);

async function checkIfFileIsDownloaded() {
  try {
    await new Promise((resolve, reject) => setTimeout(resolve, 500));
    const files = await fs.readdir(downloadPath);
    console.log(files);
    if (path.extname(files[0]) === ".jar") {
      const file = await fs.readFile(files[0]);
      return file;
    } else {
      await checkIfFileIsDownloaded();
    }
  } catch {
    await checkIfFileIsDownloaded();
  }
}

const file = await checkIfFileIsDownloaded();

console.log(file, typeof file);
// const imageFile = new File([blob], `${id}.jar`, {
//   type: "application/jar",
// });

// const metadata = await client.store({
//   name: url,
//   description: "Uploaded using mpm_repository/scripts/veridToIpfs",
//   image: imageFile,
// });

// console.log(metadata);
