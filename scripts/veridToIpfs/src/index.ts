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

// Checks when file is downloaded, returns file data and path

async function checkIfFileIsDownloaded(
  downloadPath: string,
  iterations?: number
): Promise<{
  data: Buffer | null;
  path: string;
}> {
  iterations = iterations || 0;

  // Wait 500 ms
  await new Promise((resolve, reject) => setTimeout(resolve, 500));

  if (iterations > 35) {
    return { data: null, path: "" };
  }

  const files = await fs.readdir(downloadPath);
  const file = path.resolve(downloadPath, "" + files[0]);

  // Check if jar file is downloaded
  if (path.extname(file) === ".jar") {
    // Return buffer with file content
    const fileData = await fs.readFile(path.resolve(downloadPath, files[0]));
    return { data: fileData, path: file };
  } else {
    return await checkIfFileIsDownloaded(downloadPath, iterations + 1);
  }
}

// Initialize NFT.storage client
const NFT_STORAGE_TOKEN = process.env.NFT_STORAGE_TOKEN || "";
const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });

// Uploads file to IPFS, removes file, returns CID

async function fileToCid(file: {
  data: Buffer | null;
  path: string;
}): Promise<string | null> {
  if (file.data) {
    const blob = new Blob([file.data]);
    const cid = await client.storeBlob(blob);

    fs.unlink(file.path);

    return cid;
  }
  return null;
}

// Launch webbrowser
const CHROME_PATH = process.env.CHROME_PATH || "";
const browser = await puppeteer.launch({
  headless: false,
  executablePath: CHROME_PATH,
});
// Use first tab
const page = (await browser.pages())[0];

const pageClient = await page.target().createCDPSession();
const downloadPath = path.resolve("./downloads");
await pageClient.send("Page.setDownloadBehavior", {
  behavior: "allow",
  downloadPath,
});

const nameRepository = await fs.readFile(
  path.resolve("../../repository/name.json")
);
const nameRepositoryDict = JSON.parse("" + nameRepository);
const veridToCid: { [key: number]: string } = {};
for (const i in nameRepositoryDict) {
  const id = nameRepositoryDict[i].spigot;
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

      page.goto(`https://spigotmc.org/${url}`);

      Object.assign(veridToCid, {
        [verid]: await fileToCid(await checkIfFileIsDownloaded(downloadPath)),
      });
      await fs.writeFile("../../repository/verid.json", veridToCid);
    }
  }
}
await browser.close();
