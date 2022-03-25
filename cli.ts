import { makeDoc } from "./mod.ts";
if (import.meta.main) {
  const [name, url] = Deno.args;
  if (!name || !url) {
    console.log(
      `Usage: deno run --allow-read=. --allow-write=. --allow-net --no-check ${import.meta.url}`,
    );
    Deno.exit(1);
  }
  await makeDoc(name, url);
  console.log(`Generated "${name}.docset"`);
}
