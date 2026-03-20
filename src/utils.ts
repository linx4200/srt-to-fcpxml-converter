/**
 * SRT Parser and FCPXML Generator Utilities
 */

export interface SrtEntry {
  id: number;
  startTime: string; // HH:MM:SS,mmm
  endTime: string;
  text: string;
  startSeconds: number;
  endSeconds: number;
}

export function parseSrt(content: string): SrtEntry[] {
  const entries: SrtEntry[] = [];
  // Handle different line endings and multiple empty lines
  const blocks = content.replace(/\r\n/g, '\n').split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l !== '');
    if (lines.length < 3) continue;

    const id = parseInt(lines[0]);
    if (isNaN(id)) continue;

    const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
    
    if (timeMatch) {
      const startTime = timeMatch[1];
      const endTime = timeMatch[2];
      const text = lines.slice(2).join('\n');

      entries.push({
        id,
        startTime,
        endTime,
        text,
        startSeconds: timeToSeconds(startTime),
        endSeconds: timeToSeconds(endTime)
      });
    }
  }

  return entries;
}

function timeToSeconds(time: string): number {
  const [hms, ms] = time.split(',');
  const [h, m, s] = hms.split(':').map(Number);
  return h * 3600 + m * 60 + s + parseInt(ms) / 1000;
}

export interface SubtitleStyle {
  textColor: string;
  backgroundColor: string;
  backgroundOpacity: number;
  borderRadius: number;
  paddingX: number;
  paddingY: number;
  fontSize: number;
  orientation: 'landscape' | 'portrait';
  platform: 'none' | 'xhs' | 'douyin';
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&apos;';
      default: return c;
    }
  });
}

export function generateFcpxml(entries: SrtEntry[], style: SubtitleStyle): string {
  // ... existing code ...
  // (I will replace the whole function to ensure it's clean)
  const frameRate = 30;
  const duration = entries.length > 0 ? entries[entries.length - 1].endSeconds : 0;
  
  const width = style.orientation === 'landscape' ? 1920 : 1080;
  const height = style.orientation === 'landscape' ? 1080 : 1920;

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return `${r.toFixed(2)} ${g.toFixed(2)} ${b.toFixed(2)}`;
  };

  const textColor = hexToRgb(style.textColor);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.9">
    <resources>
        <format id="r1" name="FFVideoFormat${style.orientation === 'landscape' ? '1080p30' : 'Custom'}" frameDuration="100/3000s" width="${width}" height="${height}"/>
        <effect id="r2" name="Basic Title" uid=".../Titles.localized/Bumper:Credits.localized/Basic Title.localized/Basic Title.itce"/>
    </resources>
    <library>
        <event name="SRT Import">
            <project name="Subtitles">
                <sequence duration="${Math.round(duration * 3000)}/3000s" format="r1" tcStart="0s" tcFormat="NDF">
                    <spine>`;

  entries.forEach((entry, index) => {
    const start = Math.round(entry.startSeconds * 3000);
    const dur = Math.round((entry.endSeconds - entry.startSeconds) * 3000);
    const escapedText = escapeXml(entry.text);
    
    xml += `
                        <title ref="r2" offset="${start}/3000s" name="${escapedText.substring(0, 20)}" duration="${dur}/3000s" start="0s">
                            <text>
                                <text-style ref="ts${index}">${escapedText}</text-style>
                            </text>
                            <text-style-def id="ts${index}">
                                <style font="PingFang SC" fontSize="${style.fontSize}" fontFace="Regular" fontColor="${textColor} 1" alignment="center"/>
                            </text-style-def>
                        </title>`;
  });

  xml += `
                    </spine>
                </sequence>
            </project>
        </event>
    </library>
</fcpxml>`;

  return xml;
}
