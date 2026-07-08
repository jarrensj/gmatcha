import { NextResponse } from 'next/server';
import {
  HEADER_FORMATS,
  buildStandupMarkdown,
  formatBullets,
  wrapMarkdownWithCodeBlock,
  type RenderableSection,
} from '@/lib/standup';

const MAX_BODY_BYTES = 100_000;
const MAX_SECTIONS = 20;
const MAX_BULLETS_PER_SECTION = 200;
const MAX_HEADER_LENGTH = 500;
const MAX_TEXT_LENGTH = 20_000;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const USAGE = {
  name: 'gmatcha standup formatter',
  description:
    'Deterministic formatter that turns structured standup sections into paste-ready markdown for Slack. No auth, no storage — your content is formatted, returned, and forgotten.',
  endpoint: 'POST https://gmatcha.com/api/standup',
  contentType: 'application/json',
  request: {
    sections: [
      {
        header: 'string — section title, e.g. "Yesterday", "Today", "Blockers"',
        format: `optional string — markdown style for the header: ${HEADER_FORMATS.map(format => `"${format}"`).join(' | ')} (default "none")`,
        bullets: 'optional string[] — rendered as "- item" lines',
        text: 'optional string — preformatted body, used when bullets are not provided',
      },
    ],
    wrapInCodeBlock:
      'optional boolean — wrap the result in a ``` code block so the markdown pastes literally into Slack (default false)',
  },
  response: {
    markdown: 'string — the formatted standup, ready to paste',
  },
  example: {
    curl: 'curl -s https://gmatcha.com/api/standup -H \'Content-Type: application/json\' -d \'{"sections":[{"header":"Yesterday","bullets":["shipped the release"]},{"header":"Today","bullets":["code review","pairing session"]}]}\'',
  },
  limits: {
    maxBodyBytes: MAX_BODY_BYTES,
    maxSections: MAX_SECTIONS,
    maxBulletsPerSection: MAX_BULLETS_PER_SECTION,
    maxHeaderLength: MAX_HEADER_LENGTH,
    maxTextLength: MAX_TEXT_LENGTH,
  },
};

function badRequest(error: string, status = 400) {
  return NextResponse.json(
    { error, hint: 'GET https://gmatcha.com/api/standup returns usage docs' },
    { status, headers: CORS_HEADERS }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  return NextResponse.json(USAGE, { headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return badRequest(`Request body exceeds ${MAX_BODY_BYTES} bytes`, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return badRequest('Request body must be valid JSON');
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return badRequest('Request body must be a JSON object');
  }

  const { sections, wrapInCodeBlock } = body as Record<string, unknown>;

  if (!Array.isArray(sections) || sections.length === 0) {
    return badRequest('"sections" must be a non-empty array');
  }
  if (sections.length > MAX_SECTIONS) {
    return badRequest(`"sections" must have at most ${MAX_SECTIONS} items`);
  }
  if (wrapInCodeBlock !== undefined && typeof wrapInCodeBlock !== 'boolean') {
    return badRequest('"wrapInCodeBlock" must be a boolean');
  }

  const rendered: RenderableSection[] = [];
  for (let i = 0; i < sections.length; i++) {
    const section: unknown = sections[i];
    if (typeof section !== 'object' || section === null || Array.isArray(section)) {
      return badRequest(`sections[${i}] must be an object`);
    }

    const { header, format, bullets, text } = section as Record<string, unknown>;

    if (header !== undefined && typeof header !== 'string') {
      return badRequest(`sections[${i}].header must be a string`);
    }
    if (typeof header === 'string' && header.length > MAX_HEADER_LENGTH) {
      return badRequest(`sections[${i}].header must be at most ${MAX_HEADER_LENGTH} characters`);
    }
    if (
      format !== undefined &&
      (typeof format !== 'string' || !(HEADER_FORMATS as readonly string[]).includes(format))
    ) {
      return badRequest(`sections[${i}].format must be one of: ${HEADER_FORMATS.join(', ')}`);
    }
    if (bullets !== undefined) {
      if (!Array.isArray(bullets) || bullets.some(bullet => typeof bullet !== 'string')) {
        return badRequest(`sections[${i}].bullets must be an array of strings`);
      }
      if (bullets.length > MAX_BULLETS_PER_SECTION) {
        return badRequest(`sections[${i}].bullets must have at most ${MAX_BULLETS_PER_SECTION} items`);
      }
    }
    if (text !== undefined && typeof text !== 'string') {
      return badRequest(`sections[${i}].text must be a string`);
    }
    if (typeof text === 'string' && text.length > MAX_TEXT_LENGTH) {
      return badRequest(`sections[${i}].text must be at most ${MAX_TEXT_LENGTH} characters`);
    }

    const bulletList = (bullets as string[] | undefined) ?? [];
    const content =
      bulletList.length > 0 ? formatBullets(bulletList) : ((text as string | undefined) ?? '').trim();

    rendered.push({
      header: (header as string | undefined) ?? '',
      format: (format as string | undefined) ?? 'none',
      content,
    });
  }

  const markdown = buildStandupMarkdown(rendered);
  if (!markdown.trim()) {
    return badRequest('No content to format — provide at least one section with bullets or text');
  }

  return NextResponse.json(
    { markdown: wrapInCodeBlock === true ? wrapMarkdownWithCodeBlock(markdown) : markdown },
    { headers: CORS_HEADERS }
  );
}
