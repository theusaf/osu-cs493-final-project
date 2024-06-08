// This file contains shared functions for testing

export async function displayFetch(input, init) {
  console.log(`==== ${input} ====`);
  const res = await fetch(input, init);
  const oldJson = res.json;
  const oldText = res.text;
  console.log(`==> Status: ${res.status}\n`);
  res.json = function () {
    return oldJson.apply(this, arguments).then((json) => {
      console.log("==> Body:");
      console.log(JSON.stringify(json, null, 2));
      console.log(`=====${"=".repeat(input.toString().length)}=====`);
      return json;
    });
  };
  res.text = function () {
    return oldText.apply(this, arguments).then((text) => {
      console.log("==> Body:");
      console.log(text);
      console.log(`=====${"=".repeat(input.toString().length)}=====`);
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
