// Import

import fs from "fs-extra";

//fetchWithRetries function

interface Options extends RequestInit {
  maxRetries?: number;
  interval?: number;
}

async function fetchWithRetries(
  url: RequestInfo,
  options: Options,
  retryCount = 0
): Promise<Response> {
  // split out the maxRetries option from the remaining
  // options (with a default of 3 retries)
  console.info(url, retryCount);
  const { maxRetries = 3, interval = 42, ...remainingOptions } = options;
  try {
    return await fetch(url, remainingOptions);
  } catch (error) {
    // if the retryCount has not been exceeded, call again
    if (retryCount < maxRetries) {
      return await new Promise((resolve, reject) =>
        setTimeout(
          () => resolve(fetchWithRetries(url, options, retryCount + 1)),
          interval * retryCount
        )
      );
    }
    // max retries exceeded
    throw error;
  }
}

{
  // Prepare for fetchWithRetries

  let headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
    "User-Agent": "mpm-repository/scripts/namesAndIds",
  });

  let promises: Promise<Response>[] = new Array();

  const responseArray = new Array();

  // Fetch

  for (let i = 0; i < 14; i++) {
    for (let j = 1; j <= 5; j++) {
      const options = {
        interval: 8000,
        maxRetries: 99,
        method: "GET",
        headers: headers,
      };
      const toBeFetched = fetchWithRetries(
        `https://api.spiget.org/v2/resources?size=1000&page=${i * 5 + j}`,
        options
      );
      promises.push(toBeFetched);
    }
    const fetched = await Promise.all(promises);
    for (let j = 0; j < 5; j++) {
      const fetchedJson = await fetched[j].json();
      responseArray.push(fetchedJson);
    }
    promises = [];
  }

  {
    // Read from file and parse

    // load data from ../../repository/name.json
    const nameData = await fs.readFile("../../repository/name.json", "utf8");
    // parse json file to dictionary
    let nameDict: {
      [key: string]: { spigot?: number; bukkit?: number; github?: string };
    } = JSON.parse(nameData);

    // Create names and assign ids to them

    for (const response of responseArray) {
      for (const i of response) {
        const [name, id] = [i.name, i.id];

        let newName = name.split(" ").join("-").toLowerCase();
        // if newName is in nameDict, add number at the end
        for (let i = 1; i < 100; i++) {
          if (i !== 1) {
            newName = name.split(" ").join("-").toLowerCase() + "-" + i;
          }
          if (!(newName in nameDict)) {
            break;
          }
        }
        Object.assign(nameDict, { [newName]: { spigot: id } });
      }
    }

    // Remove items with duplicated id

    {
      const setOfIds = new Set();
      const filteredEntries = Object.entries(nameDict).filter(
        ([key, value]) => {
          if (setOfIds.has(value.spigot)) {
            return false;
          } else {
            setOfIds.add(value.spigot);
            return true;
          }
        }
      );
      nameDict = Object.fromEntries(filteredEntries);
    }

    await fs.writeFile("../../repository/name.json", JSON.stringify(nameDict));
  }
}
