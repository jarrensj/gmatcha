# gmatcha

speedrun writing your standup update 

## features

- **customizable sections**: three default sections (today's work, yesterday's work, blockers) that can be fully customized
- **section visibility control**: show/hide any sections you don't need (at least one must remain visible)
- **instant markdown generation**: one-click conversion to properly formatted markdown
- **copy to clipboard**: quick copy functionality for your formatted standup
- **persistent settings**: your preferences and form data are automatically saved locally
- **mobile responsive**: works on desktop and mobile devices
- **reset functionality**: easily clear form data or reset all settings to app defaults
- **local-only storage**: nothing is pushed to a database
- **rollover**: roll today's section into yesterday's section for the following day's standup update
- **formatter api**: hit `/api/standup` from the command line or an ai agent to format an update without opening the app

## getting started

install dependencies:
```bash
npm install
```

run the development server:

```bash
npm run dev
```

open: 

[http://localhost:3000](http://localhost:3000)

## api

format a standup without opening the app — send structured sections, get back paste-ready markdown for Slack. deterministic, no auth, nothing is stored.

```bash
curl -s https://gmatcha.com/api/standup \
  -H 'Content-Type: application/json' \
  -d '{"sections":[{"header":"Yesterday","bullets":["shipped the release"]},{"header":"Today","bullets":["code review"]}]}'
```

returns:

```json
{
  "markdown": "Yesterday\n- shipped the release\n\nToday\n- code review\n\n",
  "url": "https://gmatcha.com/?standup=%7B%22sections%22%3A..."
}
```

- `header`: section title; `format`: header style (`none` | `bold` | `##` | `###`, default `none`)
- `bullets`: array of strings rendered as `- item` lines, or pass `text` for a preformatted body
- `wrapInCodeBlock: true` wraps the output in a code block so the markdown pastes literally into Slack
- the returned `url` opens gmatcha with the standup pre-filled in the web editor, ready to edit
- `GET /api/standup` returns machine-readable usage docs (also described in [/llms.txt](https://gmatcha.com/llms.txt))

works with ai agents too — tell claude code: "summarize today's work as standup bullets, post them to https://gmatcha.com/api/standup, and give it to me in markdown to paste to my team"
