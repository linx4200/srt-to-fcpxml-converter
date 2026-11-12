export function normalizeClipText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line, index, lines) => line.length > 0 || (index > 0 && index < lines.length - 1))
    .join('\n')
    .trim();
}

/* 自然断点只在目标附近优先，避免远处标点明显扭曲时间比例。 */
const NATURAL_BREAK_RADIUS_RATIO = 0.1;

/* 按时间比例估算文字切点；使用 grapheme 保持 emoji 和组合字符完整。 */
export function splitTextByRatio(text: string, ratio: number): [string, string] | null {
  if (!Number.isFinite(ratio)) return null;
  const characters = Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), ({ segment }) => segment);
  const target = characters.length * Math.max(0, Math.min(1, ratio));
  const radius = Math.max(1, characters.length * NATURAL_BREAK_RADIUS_RATIO);
  const candidates: { index: number; natural: boolean }[] = [];
  for (let index = 1; index < characters.length; index += 1) {
    const before = characters[index - 1];
    const after = characters[index];
    // 连续拉丁字母或数字作为一个单词，不能从中间切开。
    if (/[\p{Script=Latin}\p{Number}]/u.test(before) && /[\p{Script=Latin}\p{Number}]/u.test(after)) continue;
    if (!characters.slice(0, index).join('').trim() || !characters.slice(index).join('').trim()) continue;
    candidates.push({ index, natural: /[\s\p{Punctuation}]/u.test(before) });
  }
  const nearby = candidates.filter(({ index, natural }) => natural && Math.abs(index - target) <= radius);
  const choices = nearby.length ? nearby : candidates;
  choices.sort((first, second) => Math.abs(first.index - target) - Math.abs(second.index - target));
  const cutIndex = choices[0]?.index;
  return cutIndex === undefined ? null : [characters.slice(0, cutIndex).join(''), characters.slice(cutIndex).join('')];
}

/* 在宽度测量前移除标点，保留 Manual Line Break、词内连接符和数字格式。 */
export function removeSubtitlePunctuation(text: string): string {
  const characters = Array.from(text);
  return characters.map((character, index) => {
    if (!/\p{Punctuation}/u.test(character)) return character;
    const before = characters[index - 1] ?? '';
    const after = characters[index + 1] ?? '';
    const isWordConnector = /['’\-‐‑]/u.test(character)
      && /\p{Script=Latin}/u.test(before) && /\p{Script=Latin}/u.test(after);
    const isNumberSeparator = /[.,:：．／/\-]/u.test(character)
      && /\p{Number}/u.test(before) && /\p{Number}/u.test(after);
    if (isWordConnector || isNumberSeparator) return character;
    // 拉丁文本之间用空格分隔，避免删除标点后把两个单词粘连。
    const precedingText = characters.slice(0, index).join('').replace(/\p{Punctuation}+$/u, '');
    const followingText = characters.slice(index + 1).join('').replace(/^\p{Punctuation}+/u, '');
    return /[\p{Script=Latin}\p{Number}]$/u.test(precedingText)
      && /^[\p{Script=Latin}\p{Number}]/u.test(followingText) ? ' ' : '';
  }).join('');
}
