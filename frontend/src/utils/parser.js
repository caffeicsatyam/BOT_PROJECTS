// Markdown parser for Comic & Story Generator output

export function parseStoryMarkdown(markdownText) {
  if (!markdownText || typeof markdownText !== 'string') {
    return {
      title: '',
      characters: [],
      scenes: [],
      moral: '',
      raw: ''
    };
  }

  const sections = {
    title: '',
    characters: [],
    scenes: [],
    moral: '',
    raw: markdownText
  };

  // Split by top-level Markdown headers (# Header)
  const headerRegex = /^#\s+(.+)$/gm;
  const parts = [];
  let match;
  let lastIndex = 0;
  let currentHeader = '';

  while ((match = headerRegex.exec(markdownText)) !== null) {
    if (currentHeader) {
      parts.push({
        header: currentHeader.trim().toLowerCase(),
        content: markdownText.substring(lastIndex, match.index).trim()
      });
    }
    currentHeader = match[1];
    lastIndex = match.index + match[0].length;
  }

  if (currentHeader) {
    parts.push({
      header: currentHeader.trim().toLowerCase(),
      content: markdownText.substring(lastIndex).trim()
    });
  }

  // If no standard # headers found, fallback gracefully
  if (parts.length === 0) {
    sections.title = 'AI Generated Script';
    sections.scenes = [{ num: 1, heading: 'Full Script', content: markdownText }];
    return sections;
  }

  for (const part of parts) {
    const h = part.header;
    if (h.includes('title')) {
      // Clean quotes or formatting from title
      sections.title = part.content.replace(/^["'\s*#]+|["'\s*#]+$/g, '');
    } else if (h.includes('character')) {
      // Parse character bullet points
      const lines = part.content.split('\n');
      for (const line of lines) {
        const clean = line.replace(/^[-*•]\s*/, '').trim();
        if (!clean) continue;

        // Match "- **Name:** description" or "- Name: description"
        const charMatch = clean.match(/^\*\*?([^*:]+)\*\*?:?\s*(.*)$/);
        if (charMatch) {
          sections.characters.push({
            name: charMatch[1].trim(),
            description: charMatch[2].trim()
          });
        } else {
          sections.characters.push({
            name: 'Character',
            description: clean
          });
        }
      }
    } else if (h.includes('scene') || h.includes('comic') || h.includes('chapter')) {
      // Robust split matching any inline or newline Scene/Chapter/Panel markers (with or without bold asterisks/hashes)
      const sceneRegex = /(?:^|\s+)(?=(?:\*{1,2}|#{1,4}\s*)?(?:Scene|Chapter|Panel)\s*\d+[:.\s*-])/gi;
      const blocks = part.content.split(sceneRegex).map(b => b.trim()).filter(Boolean);
      let sceneIndex = 1;

      for (const block of blocks) {
        const headingMatch = block.match(/^(?:\*{1,2}|#{1,4}\s*)?(Scene\s*\d+|Chapter\s*\d+|Panel\s*\d+)(?:\*{1,2})?[:.\s*-]*(.*)$/is);
        if (headingMatch) {
          const label = headingMatch[1].replace(/\*/g, '').trim();
          let rest = headingMatch[2] ? headingMatch[2].trim() : '';

          const lines = rest.split('\n');
          let firstLine = lines[0].trim();
          let subtitle = '';
          let body = '';

          // If first line is a concise subtitle (not a camera direction or full sentence)
          if (firstLine.length <= 45 && !/[.?!]/.test(firstLine) && !/^(?:Camera|\*Camera|\[Visual|Visual)/i.test(firstLine)) {
            subtitle = firstLine.replace(/\*/g, '').trim();
            body = lines.slice(1).join('\n').trim();
          } else {
            body = rest;
          }

          // Clean empty sound effect tags like "- **Sound Effect:**"
          body = body
            .replace(/[-*•]?\s*\*\*Sound\s*Effects?:?\*\*\s*:?/gi, '')
            .replace(/[-*•]?\s*Sound\s*Effects?:?\s*:?/gi, '')
            .trim();

          sections.scenes.push({
            num: sceneIndex++,
            heading: subtitle ? `${label}: ${subtitle}` : label,
            content: body || block
          });
        } else {
          sections.scenes.push({
            num: sceneIndex++,
            heading: `Scene ${sceneIndex}`,
            content: block
          });
        }
      }

      if (sections.scenes.length === 0 && part.content) {
        sections.scenes.push({
          num: 1,
          heading: 'Scene 1',
          content: part.content
        });
      }
    } else if (h.includes('moral')) {
      sections.moral = part.content.replace(/^["'\s*]+|["'\s*]+$/g, '');
    }
  }

  return sections;
}
