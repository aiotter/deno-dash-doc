/** @jsx h */
/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="dom.iterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import {
  doc,
  DocNode,
  getStyleTag,
  h,
  Helmet,
  renderSSR,
} from "docland/deps.ts";
import {
  sheet,
  store,
} from "docland/shared.ts";
import { App } from "docland/components/app.tsx";
import { DocPage } from "docland/components/doc.tsx";
import { getBody } from "docland/util.ts";

export async function getHtml(
  url: string,
  item?: string,
  docNodes?: DocNode[],
) {
  docNodes ||= await doc(url);
  store.setState({ entries: docNodes, url });
  sheet.reset();
  const page = renderSSR(
    <App>
      <DocPage base={new URL(`https://doc.deno.land/{url}`)}>{item}</DocPage>
    </App>,
  );
  return getBody(Helmet.SSR(page), getStyleTag(sheet));
}

if (import.meta.main) {
  console.log(await getHtml("https://deno.land/x/jsx4xml@v0.1.3/mod.ts"));
}
