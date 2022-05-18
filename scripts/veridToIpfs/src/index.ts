// Imports

import { NFTStorage, File, Blob } from "nft.storage";
import dotenv from "dotenv";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import path from "path";
import { HTTPResponse } from "puppeteer";
// Load environment variables from .env file
dotenv.config();

puppeteer.use(StealthPlugin());

// Prepare

// Initialize NFT.storage client
const NFT_STORAGE_TOKEN = process.env.NFT_STORAGE_TOKEN || "";
const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });

const browser = await puppeteer.launch({ headless: false });
const page = (await browser.pages())[0];

const id = 32761;
const url = "resources/powernbt.9098/download?version=32761";
const response = await page.goto(`https://spigotmc.org/${url}`);
await page.waitForTimeout(5200);

// const downloadPath = path.resolve("/home/mble/Downloads");
// await page._client.send("Page.setDownloadBehavior", {
//   behavior: "allow",
//   downloadPath: downloadPath,
// });

const responses: HTTPResponse[] = [];
page.on("response", (resp) => {
  responses.push(resp);
});

page.on("load", () => {
  responses.map(async (resp) => {});
});

// const blob = await response.blob();

// const imageFile = new File([blob], `${id}.jar`, {
//   type: "application/jar",
// });

// const metadata = await client.store({
//   name: url,
//   description: "Uploaded using mpm_repository/scripts/veridToIpfs",
//   image: imageFile,
// });

// console.log(metadata);
