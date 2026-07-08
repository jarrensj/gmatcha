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
