# gmatcha

speedrun writing your standup update 

write out your standup in the app — three customizable sections (yesterday, today, blockers), one click to turn them into markdown, copy, paste to your team. everything stays in your browser's local storage; there's no account and no database. or skip the typing entirely and [let your ai agent write it for you](#write-your-standup-from-the-terminal).

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
- **share links**: the api returns a url that opens the standup pre-filled in the web editor — the link carries the data, nothing is stored

## write your standup from the terminal

if you work with an ai coding agent (claude code, cursor, codex, …), your standup is one paste away — the agent already knows what you did today. copy this into your terminal:

```text
Write my standup update: from my recent work (git commits, our conversation), summarize my last working day and what I'm working on today as short bullets. Then POST them to https://gmatcha.com/api/standup (GET that URL first for usage docs) and reply with the returned markdown to paste to my team, plus the edit url.
```

your agent summarizes your actual work into bullets, gmatcha formats them, and you get back:

- **markdown** ready to paste to your team
- **an edit link** that opens the standup pre-filled in the gmatcha editor, in case you want to tweak it by hand

no api key, no setup, nothing stored — the api formats and forgets, and the edit link carries the standup in the url itself.

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

using an ai agent instead of curl? see [write your standup from the terminal](#write-your-standup-from-the-terminal).
