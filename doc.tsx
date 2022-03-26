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
} from "https://raw.githubusercontent.com/denoland/docland/ac0404d5af4a7c2bd2159cec3cddb13569c9f4e6/deps.ts";
import {
  sheet,
  store,
} from "https://raw.githubusercontent.com/denoland/docland/ac0404d5af4a7c2bd2159cec3cddb13569c9f4e6/shared.ts";
import { App } from "https://raw.githubusercontent.com/denoland/docland/ac0404d5af4a7c2bd2159cec3cddb13569c9f4e6/components/app.tsx";
import { DocPage } from "https://raw.githubusercontent.com/denoland/docland/ac0404d5af4a7c2bd2159cec3cddb13569c9f4e6/components/doc.tsx";
import { getBody } from "https://raw.githubusercontent.com/denoland/docland/ac0404d5af4a7c2bd2159cec3cddb13569c9f4e6/util.ts";

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
