/** @jsx jsx4xml.createElement */

import * as jsx4xml from "https://deno.land/x/jsx4xml@v0.1.3/mod.ts";

export function getPlist(name: string, url: string) {
  const header =
    '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">';

  return header + jsx4xml.renderToString(
    <plist version="1.0">
      <dict>
        <key>CFBundleIdentifier</key>
        <string>{name}</string>
        <key>CFBundleName</key>
        <string>{name}</string>
        <key>DocSetPlatformFamily</key>
        <string>{name}</string>
        <key>isDashDocset</key>
        <true />
        <key>dashIndexFilePath</key>
        <string>./{url}/index.html</string>
      </dict>
    </plist>,
  );
}
