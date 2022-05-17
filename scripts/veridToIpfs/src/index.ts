// Imports

import { NFTStorage, File, Blob } from "nft.storage";
import dotenv from "dotenv";
// Load environment variables from .env file
dotenv.config();

// Prepare

// Initialize NFT.storage client
const NFT_STORAGE_TOKEN = process.env.NFT_STORAGE_TOKEN || "";
const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });

const id = 32761;
const url = "resources/powernbt.9098/download?version=32761";
const response = await fetch(`https://spigotmc.org/${url}`);

const blob = await response.blob();

console.log(response);

const imageFile = new File([blob], `${id}.jar`, {
  type: "application/jar",
});

const metadata = await client.store({
  name: url,
  description: "Uploaded using mpm_repository/scripts/veridToIpfs",
  image: imageFile,
});

console.log(metadata);
