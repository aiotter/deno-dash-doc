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
  virtualSheet,
} from "https://raw.githubusercontent.com/denoland/docland/194467fb0412b9f9304e39adc87bc6bbe4ca1c46/deps.ts";
import {
  sheet,
  store,
} from "https://raw.githubusercontent.com/denoland/docland/194467fb0412b9f9304e39adc87bc6bbe4ca1c46/shared.ts";
import { App } from "https://raw.githubusercontent.com/denoland/docland/194467fb0412b9f9304e39adc87bc6bbe4ca1c46/components/app.tsx";
import { DocPage } from "https://raw.githubusercontent.com/denoland/docland/194467fb0412b9f9304e39adc87bc6bbe4ca1c46/components/doc.tsx";
import { getBody } from "https://raw.githubusercontent.com/denoland/docland/194467fb0412b9f9304e39adc87bc6bbe4ca1c46/util.ts";

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
      <DocPage base={new URL(url)}>{item}</DocPage>
    </App>,
  );
  return getBody(Helmet.SSR(page), getStyleTag(sheet));
}

if (import.meta.main) {
  console.log(await getHtml("https://deno.land/x/jsx4xml@v0.1.3/mod.ts"));
}
