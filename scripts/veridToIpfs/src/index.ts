// Imports

import { NFTStorage, File, Blob } from "nft.storage";
import dotenv from "dotenv";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import path from "path";
import fs from "fs-extra";
import { Puppeteer } from "puppeteer";
// Load environment variables from .env file
dotenv.config();

puppeteer.use(StealthPlugin());

// Prepare

// Checks when file is downloaded, returns file data and path

async function checkIfFileIsDownloaded(downloadPath: string): Promise<{
  data: Buffer | null;
  path: string;
}> {
  const files = await fs.readdir(downloadPath);
  const file = path.resolve(downloadPath, "" + files[0]);

  // Check if jar file is downloaded
  if (path.extname(file) === ".jar") {
    // Return buffer with file content
    const fileData = await fs.readFile(path.resolve(downloadPath, files[0]));
    return { data: fileData, path: file };
  } else {
    return { data: null, path: "" };
  }
}

// Initialize NFT.storage client
const NFT_STORAGE_TOKEN = process.env.NFT_STORAGE_TOKEN || "";
const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });

// Uploads file to IPFS, empties dir, returns CID

async function fileToCid(
  file: {
    data: Buffer | null;
    path: string;
  },
  downloadPath: string
): Promise<string | null> {
  if (file.data) {
    const blob = new Blob([file.data]);
    const cid = await client.storeBlob(blob);

    fs.emptyDir(downloadPath);

    return cid;
  }
  return null;
}
// Launch webbrowser
const CHROME_PATH = process.env.CHROME_PATH || "";
const browserArr = new Array();

const downloadPathArr: string[] = new Array();

const pageArr = new Array();

for (let i = 0; i < 20; i++) {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: CHROME_PATH,
  });
  browserArr.push(browser);

  const page = (await browser.pages())[0];
  pageArr.push(page);
  const pageClient = await page.target().createCDPSession();
  const downloadPath = path.resolve(`./downloads${i}`);
  await pageClient.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath,
  });
  fs.ensureDir(downloadPath);
  downloadPathArr.push(downloadPath);
}

const namesRaw = await fs.readFile(path.resolve("../../repository/name.json"));
const names = JSON.parse("" + namesRaw);
const veridCid: { [key: number]: string } = {};
let pagePromises: Promise<void>[] = new Array();
let i = 0;
for (const name in names) {
  if (i % 20 === 19) {
    await Promise.all(pagePromises);
    pagePromises = new Array();
  }
  const id = names[name].spigot;
  const downloadPath = downloadPathArr[i % 20];
  const page = pageArr[i % 20];
  async function loadPage() {
    try {
      const res = await fetch(
        `https://api.spiget.org/v2/resources/${id}/versions?size=9999`
      );

      const versions: { id: number; url?: string }[] = await res.json();
      for (let i = 0; i < versions.length; i++) {
        const version = versions[i];
        const verid = version.id;
        const url = version.url;
        if (url !== undefined) {
          console.log(url);

          try {
            await page.goto(`https://spigotmc.org/${url}`, {
              waitUntil: "networkidle0",
            });
          } catch (e) {
            console.log(e);
          }

          Object.assign(veridCid, {
            [verid]: await fileToCid(
              await checkIfFileIsDownloaded(downloadPath),
              downloadPath
            ),
          });
          await fs.writeFile(
            "../../repository/verid.json",
            JSON.stringify(veridCid)
          );
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
  pagePromises.push(loadPage());
  i++;
}
