// This file contains shared functions for testing
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
import dotenv from "dotenv";
dotenv.config({ path: join(__dirname, "../.env") });
dotenv.config({ path: join(__dirname, "../.env.local") });

export const API_BASE = `http://localhost:${process.env.PORT ?? 8000}`;

export async function displayFetch(input, init) {
  const inputString = `${init?.method ?? "GET"} ${input}`;
  const res = await fetch(input, init);
  const oldJson = res.json;
  const oldText = res.text;

  function logResponse(body) {
    console.log(`==== ${inputString} ====`);
    if (init?.headers) {
      console.log("==> Request Headers:");
      console.log(JSON.stringify(init.headers, null, 2));
    }
    if (typeof init?.body === "string") {
      console.log("==> Request Body:");
      console.log(init.body);
    }
    console.log(`==> Response Status: ${res.status}`);
    console.log("==> Response Body:");
    console.log(body);
    console.log(`=====${"=".repeat(inputString.toString().length)}=====`);
  }

  res.json = function () {
    return oldJson.apply(this, arguments).then((json) => {
      logResponse(JSON.stringify(json, null, 2));
      return json;
    });
  };
  res.text = function () {
    return oldText.apply(this, arguments).then((text) => {
      logResponse(text);
      return text;
    });
  };
  return res;
}

export async function fetchIgnoreRatelimit(fetchMethod, ...args) {
  while (true) {
    const response = await fetchMethod(...args);
    if (response.status !== 429) {
      return response;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
}
