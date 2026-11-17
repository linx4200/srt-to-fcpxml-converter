import { readFileSync, writeFileSync } from 'node:fs';
import { generateFcpxml } from '../src/utils/fcpxml';
import { getSubtitleBackgroundSize, getPreviewSubtitleBackgroundLayout } from '../src/utils/subtitleLayout';
import assert from 'node:assert/strict';

const fixtures = JSON.parse(readFileSync(new URL('./fixtures/fcpxml-preview-regression/manifest.json', import.meta.url), 'utf8'));
let measuredWidths: Record<string, number> = {};
/* 固定字体测量输入，验证导出计算而不是测试机上安装的字体。未知文本必须报错。 */
const context = {
  font: '',
  measureText(text: string) {
    const full = Object.hasOwn(measuredWidths, text) ? text
      : Object.keys(measuredWidths).find((candidate) => candidate.startsWith(text));
    assert.ok(full !== undefined, `缺少测量配置: ${text}`);
    return { width: measuredWidths[full] * text.length / full.length,
      fontBoundingBoxAscent: 40, fontBoundingBoxDescent: 10,
      actualBoundingBoxAscent: 32, actualBoundingBoxDescent: 4 };
  },
};
Object.assign(globalThis, { document: { createElement: () => ({ getContext: () => context }) } });
const output = [];
for (const fixture of fixtures) {
  measuredWidths = fixture.measuredWidths;
  output.push({ file: fixture.file, xml: generateFcpxml(fixture.entries, fixture.spec) });
}
/* 独立验证尺寸算法，测量值不从生成结果回填。 */
measuredWidths = { '甲乙丙': 120 };
for (const orientation of ['portrait', 'landscape'] as const) {
  for (const fontSize of [35, 50]) for (const padding of [5, 40]) {
    const spec = { orientation, fontSize, backgroundHorizontalPadding: padding, backgroundVerticalPadding: padding };
    const layout = getSubtitleBackgroundSize('甲乙丙', spec);
    const expectedWidth = fontSize === 50
      ? (120 + padding) * (orientation === 'portrait' ? 1.025 : 1.03)
      : orientation === 'portrait' ? 120 + padding + 21.20688 : (120 + padding) * 1.03;
    assert.ok(Math.abs(layout.width - expectedWidth) < 1e-9);
    const height = orientation === 'portrait' ? 1920 : 1080;
    assert.equal(layout.height, fontSize * height * 0.0009 + padding);
    assert.equal(layout.offsetY, fontSize === 50 ? -6.5 : orientation === 'portrait' ? 0.0017045 * height : 0);
    const preview = getPreviewSubtitleBackgroundLayout('甲乙丙', spec);
    assert.equal(preview.width, 120 + padding);
    assert.equal(preview.offsetY, 1);
    const multiline = getSubtitleBackgroundSize('甲乙丙\n甲乙丙', spec);
    assert.equal(multiline.width, 120 + padding);
    assert.equal(multiline.offsetY, 0);
    assert.equal(multiline.lineCount, 2);
  }
}
writeFileSync(process.argv[2], JSON.stringify(output));
