import { getHtml } from "./doc.tsx";
import { getPlist } from "./plist.tsx";
import { doc } from "https://deno.land/x/deno_doc@0.80.0/mod.ts";
import type {
  DocNode,
  DocNodeKind,
} from "https://deno.land/x/deno_doc@0.80.0/types.d.ts";
import { DB } from "https://deno.land/x/sqlite@v3.3.0/mod.ts";
import { relative } from "https://deno.land/std@0.131.0/path/mod.ts";
import { asCollection } from "docland/components/common.tsx";
import {
  DOMParser,
  NodeType,
} from "https://deno.land/x/deno_dom@v0.1.21-alpha/deno-dom-wasm.ts";

export async function makeDoc(name: string, url: string, entries?: DocNode[]) {
  // NOTE: url can be "deno/stable" or "deno/unstable"
  if (!url.startsWith("deno/")) {
    // Resolve redirection
    url = await fetch(url, { method: "HEAD" }).then((r) => r.url);
  }

  // Fetch document
  const docNodes = entries ?? await doc(url);

  // Create the Docset Folder
  await Deno.mkdir(
    `${name}.docset/Contents/Resources/Documents`,
    { recursive: true },
  );

  // Create the Info.plist File
  await Deno.writeTextFile(
    `${name}.docset/Contents/Info.plist`,
    getPlist(name, url),
  );

  // Create database
  const db = new DB(`${name}.docset/Contents/Resources/docSet.dsidx`);
  db.query(
    "CREATE TABLE IF NOT EXISTS searchIndex(id INTEGER PRIMARY KEY, name TEXT, type TEXT, path TEXT);",
  );
  db.query(
    "CREATE UNIQUE INDEX IF NOT EXISTS anchor ON searchIndex (name, type, path);",
  );

  // Create top page
  const dir = `${name}.docset/Contents/Resources/Documents/${url}`;
  const html = await getHtml(url, undefined, docNodes)
    .then((html) => fixHyperLink(html, url))
    .then(optimise);

  db.query(
    "INSERT OR IGNORE INTO searchIndex(name, type, path) VALUES (?, ?, ?);",
    [name, "Module", `./${url}/index.html`],
  );

  await Deno.mkdir(dir, { recursive: true });
  await Deno.writeTextFile(`${dir}/index.html`, html);

  // Create other pages
  await Promise.all(
    Object.values(asCollection(docNodes)).flat().map(
      async ([title, node]: [string, DocNode]) => {
        const dir =
          `${name}.docset/Contents/Resources/Documents/${url}/~/${title}`;

        const html = await getHtml(url, title, docNodes)
          .then((html) => fixHyperLink(html, `${url}/~/${title}`))
          .then(optimise);

        db.query(
          "INSERT OR IGNORE INTO searchIndex(name, type, path) VALUES (?, ?, ?);",
          [
            node.name,
            translateType(node.kind),
            `./${url}/~/${title}/index.html`,
          ],
        );
        await Deno.mkdir(dir, { recursive: true });
        await Deno.writeTextFile(`${dir}/index.html`, html);
      },
    ),
  );
  db.close();

  // Download icon
  const icon16px = await download(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Deno_2021.svg/16px-Deno_2021.svg.png",
  );
  const icon32px = await download(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Deno_2021.svg/32px-Deno_2021.svg.png",
  );
  if (icon16px) await Deno.writeFile(`${name}.docset/icon.png`, icon16px);
  if (icon32px) await Deno.writeFile(`${name}.docset/icon@2x.png`, icon32px);
}

function translateType(nodeType: DocNodeKind) {
  switch (nodeType) {
    case "function":
      return "Function";
    case "moduleDoc":
      return "Module";
    case "variable":
      return "Variable";
    case "enum":
      return "Enum";
    case "class":
      return "Class";
    case "typeAlias":
      return "Type";
    case "namespace":
      return "Namespace";
    case "interface":
      return "Interface";
    case "import":
      return "Module";
  }
}

async function download(url: string) {
  return await fetch(url)
    .then((r) => r.body?.getReader().read())
    .then((result) => result?.value);
}

function fixHyperLink(html: string, base: string) {
  return html.replace(
    /href="\/(.*?)"/g,
    (_, path) => `href="./${relative(base, path)}/index.html"`,
  );
}

function optimise(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html")!;
  doc.getElementsByTagName("nav").forEach((tag) => tag.remove());
  doc.getElementsByTagName("header").forEach((tag) => tag.remove());
  for (const element of doc.querySelectorAll("h2[id]")) {
    const name = Array.from(element.childNodes)
      .find((e) => e.nodeType === NodeType.TEXT_NODE)?.nodeValue;

    const a = doc.querySelector(`h2#${(element as unknown as Element).id} > a`);
    a?.setAttribute("name", `//apple_ref/cpp/Section/${name}`);
    a?.classList.add("dashAnchor");
  }
  return doc.documentElement!.outerHTML;
}
