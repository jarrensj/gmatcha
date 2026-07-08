export const HEADER_FORMATS = ['none', 'bold', '##', '###'] as const;
export type HeaderFormat = (typeof HEADER_FORMATS)[number];

export interface RenderableSection {
  header: string;
  format: string;
  content: string;
}

export function formatHeader(format: string, header: string): string {
  switch (format) {
    case 'bold':
      return `**${header}**`;
    case '##':
      return `## ${header}`;
    case '###':
      return `### ${header}`;
    case 'none':
    default:
      return header;
  }
}

export function formatBullets(bullets: string[]): string {
  return bullets.map(bullet => `- ${bullet}`).join('\n');
}

export function buildStandupMarkdown(sections: RenderableSection[]): string {
  let markdown = '';
  for (const section of sections) {
    if (section.content) {
      markdown += `${formatHeader(section.format, section.header)}\n${section.content}\n\n`;
    }
  }
  return markdown;
}

export function wrapMarkdownWithCodeBlock(markdown: string): string {
  return `\`\`\`\n${markdown}\`\`\``;
}

export const STANDUP_QUERY_PARAM = 'standup';

export interface StandupPayloadSection {
  header?: string;
  format?: string;
  bullets?: string[];
  text?: string;
}

export interface StandupPayload {
  sections: StandupPayloadSection[];
}

export function buildStandupShareUrl(payload: StandupPayload, origin: string): string {
  return `${origin}/?${STANDUP_QUERY_PARAM}=${encodeURIComponent(JSON.stringify(payload))}`;
}

export interface ParsedUrlSection {
  header?: string;
  bullets: string[];
}

// Parses the decoded value of the ?standup= query param back into sections.
// Lenient by design: malformed entries degrade to empty sections, text-only
// sections are split into bullets, and unknown fields are ignored.
export function parseStandupParam(raw: string): ParsedUrlSection[] | null {
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!payload || typeof payload !== 'object' || !Array.isArray((payload as { sections?: unknown }).sections)) {
    return null;
  }

  return (payload as { sections: unknown[] }).sections.map(section => {
    if (!section || typeof section !== 'object' || Array.isArray(section)) {
      return { bullets: [] };
    }
    const record = section as Record<string, unknown>;
    const header =
      typeof record.header === 'string' && record.header.trim() ? record.header.trim() : undefined;

    let bullets: string[] = [];
    if (Array.isArray(record.bullets)) {
      bullets = record.bullets
        .filter((bullet): bullet is string => typeof bullet === 'string')
        .map(bullet => bullet.trim())
        .filter(Boolean);
    } else if (typeof record.text === 'string') {
      bullets = record.text
        .split('\n')
        .map(line => line.replace(/^\s*[-*•]\s*/, '').trim())
        .filter(Boolean);
    }

    return { header, bullets };
  });
}
