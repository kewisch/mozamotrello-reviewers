import 'bootstrap/dist/css/bootstrap.css';
import 'regenerator-runtime/runtime';
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch, 2019 */

const ADDON_LINKS_RE = /https:\/\/(?:reviewers\.)?(addons\.mozilla\.org|addons\.allizom\.org|addons-dev\.allizom\.org|addons\.thunderbird\.net)\/([^/]*)\/(reviewers\/review(|-listed|-unlisted|-content)|admin\/addon\/manage|[^/]*\/addon|developers\/feed)\/([^/#?]*)(\/edit)?/;

var manageTimeButton = function(t, opts) {
  t.card('members').then(function (members) {
      return t.modal({
          title: 'Time spent',
          url: './timeManage.html',
          height: 400,
          args: {
              members: members
          }
      });
  });
}

/**
 * Begin trello powerup initialization.
 */
TrelloPowerUp.initialize({
  "attachment-sections": function(t, opts) {
    let claimed = opts.entries.filter(attachment => attachment.url.match(ADDON_LINKS_RE));
    if (!claimed.length) {
      return [];
    }

    return [{
      title: "Reviews",
      claimed: claimed,
      icon: TrelloPowerUp.util.relativeUrl("../src/images/addon.png"),
      content: {
        type: "iframe",
        url: t.signUrl("./amo.html"),
        height: 64
      }
    }];
  },

  "card-from-url": async function(t, opts) {
    let match = opts.url.match(ADDON_LINKS_RE);

    try {
      let resp = await fetch("https://addons.mozilla.org/api/v4/addons/addon/" + match[5]);
      let data = await resp.json();

      return {
        name: "Review: " + data.name["en-US"],
      };
    } catch (e) {
      console.error(e);
      throw t.NotHandled();
    }
  },

  "list-actions": function(t, opts) {
    return [{
      text: "Open all reviews in tabs",
      callback: async function (t) {
        let cards = await t.cards("attachments");
        for (let card of cards) {
          let attachment = card.attachments.find(attach => attach.url.match(ADDON_LINKS_RE));
          if (attachment) {
            window.open(attachment.url, "_blank");
          }
        }
      }
    }];
  },
  "format-url": function(t, opts) {
    throw t.NotHandled();
  },
  'card-buttons': function(t, opts) {
    return [{
      text: 'Time Track',
      callback: manageTimeButton
    }];
  }
}, {
  appName: "AMO Reviewers Trello Companion"
});