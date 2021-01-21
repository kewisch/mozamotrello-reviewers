# AMO Reviewers Trello Companion
This is a Trello PowerUp that:
* Shows an attachment section for attached addon links (`attachment-sections`)
* Provides a list action to open all reviews in tabs (`list-actions`)
* Formats links pasted via Ctrl+V with add-on information (`card-from-url`)
* Provides an URL formatter that formats bugzilla links with the bug number (`format-url`)

## Usage
This PowerUp is tailored for the needs of the AMO review team.

BUILD
yarn global add parcel-bundler
yarn && yarn build

To install:
* Head to the [Trello PowerUp Admin](https://trello.com/power-ups/admin)
* Click on the team you'd like to add this to
* Give the PowerUp a name and give it the following capabilities:
  * `attachment-sections`
  * `card-buttons`
  * `card-from-url`
  * `format-url`
  * `list-actions`
* Point the iframe connector URL to where this is hosted