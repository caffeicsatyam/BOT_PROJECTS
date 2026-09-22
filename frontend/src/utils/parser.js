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
      sections.title = part.content.replace(/^["'\s]+|["'\s]+$/g, '');
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
      // Parse individual scenes (Scene 1:, Chapter 1:, etc.)
      const sceneBlocks = part.content.split(/(?=Scene\s+\d+:|Chapter\s+\d+:|Panel\s+\d+:)/i);
      let sceneIndex = 1;

      for (const block of sceneBlocks) {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) continue;

        const headingMatch = trimmedBlock.match(/^(Scene\s+\d+|Chapter\s+\d+|Panel\s+\d+)(?::\s*(.*))?/i);
        if (headingMatch) {
          const headingLabel = headingMatch[1].trim();
          const subtitle = headingMatch[2] ? headingMatch[2].split('\n')[0].trim() : '';
          const bodyLines = trimmedBlock.split('\n');
          bodyLines.shift(); // Remove heading line
          const content = bodyLines.join('\n').trim();

          sections.scenes.push({
            num: sceneIndex++,
            heading: subtitle ? `${headingLabel}: ${subtitle}` : headingLabel,
            content: content || trimmedBlock
          });
        } else {
          sections.scenes.push({
            num: sceneIndex++,
            heading: `Scene ${sceneIndex}`,
            content: trimmedBlock
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
      sections.moral = part.content.replace(/^["'\s]+|["'\s]+$/g, '');
    }
  }

  return sections;
}
