/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch, 2019 */

const API_PREFIX = "https://addons.mozilla.org/api/v4/addons/addon/";
const ADDON_LINKS_RE = /https:\/\/(?:reviewers\.)?(addons\.mozilla\.org|addons\.allizom\.org|addons-dev\.allizom\.org|addons\.thunderbird\.net)\/([^/]*)\/(reviewers\/review(|-listed|-unlisted|-content)|admin\/addon\/manage|[^/]*\/addon|developers\/feed)\/([^/#?]*)(\/edit)?/;

var t = window.TrelloPowerUp.iframe();

t.render(async () => {
  let attachments = await t.card("attachments").get("attachments");
  let slugs = attachments.reduce((acc, attachment) => {
    let match = attachment.url.match(ADDON_LINKS_RE);
    if (match) {
      acc.push(match[5]);
    }
    return acc;
  }, []);

  document.querySelector("#content").innerHTML = "";
  document.querySelector("#loading").classList.add("loading");

  let info = slugs.map((slug) => fetch(API_PREFIX + slug).then(resp => resp.json()));

  let results = await Promise.all(info);
  document.querySelector("#loading").classList.remove("loading");

  for (let addon of results) {
    let template = document.querySelector("#addon");
    let clone = document.importNode(template.content, true);

    clone.querySelector(".name").textContent = addon.name["en-US"] || addon.name[addon.default_locale] || "";
    clone.querySelector(".img").src = addon.icon_url;
    clone.querySelector(".url.listing").setAttribute("href", addon.url);
    clone.querySelector(".url.review").setAttribute("href", addon.review_url);

    document.querySelector("#content").appendChild(clone);
  }

  return t.sizeTo("#content");
});
