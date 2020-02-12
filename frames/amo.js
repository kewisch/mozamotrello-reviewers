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

  let info = slugs.map((slug) => fetch(API_PREFIX + slug).then(async (resp) => {
    let data = await resp.json();
    if (!data.url) {
      let parts = resp.url.split("/");
      data.slug = parts[parts.length - 1] || parts[parts.length - 2];
      data.url = "https://addons.mozilla.org/en-US/firefox/addon/" + data.slug;
      data.review_url = "https://reviewers.addons.mozilla.org/en-US/reviewers/review/" + data.slug;
    }
    return data;
  }));

  let results = await Promise.all(info);
  document.querySelector("#loading").classList.remove("loading");

  for (let addon of results) {
    try {
      console.log(addon);
      let template = document.querySelector("#addon");
      let clone = document.importNode(template.content, true);

      let name = addon.name ? addon.name["en-US"] || addon.name[addon.default_locale] || "unknown" : addon.slug;

      clone.querySelector(".name").textContent = name;
      clone.querySelector(".img").src = addon.icon_url || "../images/addon.png";
      clone.querySelector(".url.listing").setAttribute("href", addon.url);
      clone.querySelector(".url.review").setAttribute("href", addon.review_url || "");

      document.querySelector("#content").appendChild(clone);
    } catch (e) {
      console.error(e, addon);
    }
  }

  return t.sizeTo("#content");
});
