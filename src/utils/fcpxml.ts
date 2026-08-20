import type { FcpxmlExportSpec } from '../domain/fcpxmlExport';
import type { SrtEntry } from '../types';

const FCPXML_FILE_EXTENSION = '.fcpxml';
const FCPXML_MIME_TYPE = 'application/xml';
const UNTITLED_EXPORT_FILE_BASENAME = 'subtitles';
const CUSTOM_TITLE_EFFECT_ID = 'r2';
const BACKGROUND_RECTANGLE_EFFECT_ID = 'r3';
/* FCPXML frameDuration 和 title offset/duration 使用 100/fpsScale 的时间单位。 */
const FCP_TIME_UNIT_PER_FRAME = 100;
const FCP_GENERATOR_START_TIME = '3600s';
/* Custom title 外层 transform 保持参考样本的位置基线，横屏实际文字下移由内部位置参数控制。 */
const CUSTOM_TITLE_LAYER_POSITION_Y = -25;
/* 背景框矩形坐标使用 0-1 归一化坐标，输出到 FCPXML 时保留 6 位精度。 */
const NORMALIZED_COORDINATE_MIN = 0;
const NORMALIZED_COORDINATE_MAX = 1;
const NORMALIZED_COORDINATE_PRECISION = 6;
/* 用宽高的一半从中心点反推 leftBottom/rightTop 坐标。 */
const RECTANGLE_HALF_SIZE_DIVISOR = 2;
/* FCPXML 中 Roundness 的 XML value 按当前实测为 Final Cut Pro 检查器 Roundness 数值的五百分之一。 */
const FCP_ROUNDNESS_XML_SCALE = 500;

/* FCPXML 里 Custom title 的内部文字位置参数，用于匹配横屏手动调整后的字幕高度。 */
const LANDSCAPE_CUSTOM_TITLE_TEXT_POSITION = '0 -200';

/*
 * 不同 Target Video Orientation 的背景框参数来自 Final Cut Pro 反导出的矩形生成器样本。
 * centerX/centerY 是矩形生成器的归一化中心点，不是 FCPXML 外层 transform 坐标。
 */
const BACKGROUND_RECTANGLE_BY_ORIENTATION = {
  landscape: {
    /* 横屏中心点来自 732px x 80px 手动样本，位于 1920x1080 画面底部字幕区域。 */
    centerX: 0.499087,
    centerY: 0.075752,
    /* 横屏手动样本通过 Custom title 内部位置参数下移文字。 */
    shouldWriteTextPositionParam: true,
    /* 横屏样本的矩形层没有写入 disableDRT，保持样本最小结构。 */
    shouldWriteRectangleDisableDrt: false,
  },
  portrait: {
    /* 竖屏中心点来自 856px x 144px 手动样本，位于 1080x1920 画面底部字幕区域。 */
    centerX: 0.496832,
    centerY: 0.263235,
    /* 竖屏手动样本没有 Custom title 内部位置参数，保留外层 transform 即可。 */
    shouldWriteTextPositionParam: false,
    /* 竖屏样本的矩形层包含 disableDRT，保留以匹配 FCP 反导出结构。 */
    shouldWriteRectangleDisableDrt: true,
  },
} as const;

const BACKGROUND_RECTANGLE_EFFECT = {
  name: '矩形',
  uid: 'Cloud:D3FDCEBA-B513-4136-B9C9-9D22EE453213',
};

const CUSTOM_TITLE_TEXT_POSITION_PARAM = {
  name: '位置',
  key: '9999/10199/10201/1/100/101',
};

const CUSTOM_TITLE_ALIGNMENT_PARAM = {
  name: '对齐',
  key: '9999/10199/10201/2/354/1002961760/401',
  value: '1 (居中)',
};

const CUSTOM_TITLE_OUT_SEQUENCING_PARAM = {
  name: 'Out Sequencing',
  key: '9999/10199/10201/4/10233/201/202',
  value: '0 (到)',
};

const CUSTOM_TITLE_DISABLE_DRT_PARAM = {
  name: 'disableDRT',
  key: '3733',
  value: '1',
};

const RECTANGLE_BUILD_IN_PARAM = {
  name: 'Build In',
  key: '9999/3191505825/2/101',
  value: '0',
};

const RECTANGLE_BUILD_OUT_PARAM = {
  name: 'Build Out',
  key: '9999/3191505825/2/102',
  value: '0',
};

const RECTANGLE_RIGHT_TOP_PARAM = {
  name: 'Right Top',
  key: '9999/3191888958/3191889159/3/3296647477/2',
};

const RECTANGLE_LEFT_BOTTOM_PARAM = {
  name: 'Left Bottom',
  key: '9999/3191888958/3191889159/3/3296647477/3',
};

const RECTANGLE_ROUNDNESS_PARAM = {
  name: 'Roundness',
  key: '9999/3192238800/100/3296679287/2/100',
};

const RECTANGLE_FILL_OPACITY_PARAM = {
  name: 'Fill Opacity',
  key: '9999/3298577735/3298577563/1/200/202',
};

const RECTANGLE_FILL_COLOR_PARAM = {
  name: 'Fill Color',
  key: '9999/3298577735/3298577563/3296684920/3296685085/3323204807/3296692804/2/353/113/111',
};

export interface FcpxmlExportArtifact {
  /* FCPXML 文件内容，由当前 Working Timeline 和导出协议参数生成。 */
  content: string;
  /* 浏览器下载时使用的完整文件名，必须包含 .fcpxml 后缀。 */
  fileName: string;
  /* 浏览器 Blob 使用的 MIME type，由 FCPXML 导出模块统一定义。 */
  mimeType: string;
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

function getFcpxmlExportFileName(subtitleFileName: string): string {
  const sourceFileBaseName = subtitleFileName.trim().replace(/\.[^/.]+$/, '');
  const exportFileBaseName = sourceFileBaseName || UNTITLED_EXPORT_FILE_BASENAME;

  return `${exportFileBaseName}${FCPXML_FILE_EXTENSION}`;
}

function hexToRgbValues(hex: string, precision = 2): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return `${r.toFixed(precision)} ${g.toFixed(precision)} ${b.toFixed(precision)}`;
}

function formatNormalizedCoordinate(value: number): string {
  const normalizedValue = Math.min(
    NORMALIZED_COORDINATE_MAX,
    Math.max(NORMALIZED_COORDINATE_MIN, value)
  );

  return normalizedValue.toFixed(NORMALIZED_COORDINATE_PRECISION);
}

function getBackgroundRectangleCoordinates(fcpxmlExportSpec: FcpxmlExportSpec) {
  const backgroundRectangle = BACKGROUND_RECTANGLE_BY_ORIENTATION[fcpxmlExportSpec.format.orientation];
  const halfBackgroundWidth =
    fcpxmlExportSpec.backgroundStyle.backgroundWidth /
    fcpxmlExportSpec.format.width /
    RECTANGLE_HALF_SIZE_DIVISOR;
  const halfBackgroundHeight =
    fcpxmlExportSpec.backgroundStyle.backgroundHeight /
    fcpxmlExportSpec.format.height /
    RECTANGLE_HALF_SIZE_DIVISOR;

  return {
    leftBottom: `${formatNormalizedCoordinate(backgroundRectangle.centerX - halfBackgroundWidth)} ${formatNormalizedCoordinate(backgroundRectangle.centerY - halfBackgroundHeight)}`,
    rightTop: `${formatNormalizedCoordinate(backgroundRectangle.centerX + halfBackgroundWidth)} ${formatNormalizedCoordinate(backgroundRectangle.centerY + halfBackgroundHeight)}`,
  };
}

function buildCustomTitleParams(fcpxmlExportSpec: FcpxmlExportSpec): string {
  const backgroundRectangle = BACKGROUND_RECTANGLE_BY_ORIENTATION[fcpxmlExportSpec.format.orientation];
  // 只有横屏需要写入 Custom title 内部文字位置；竖屏位置由 adjust-transform 保持。
  const textPositionParam = backgroundRectangle.shouldWriteTextPositionParam
    ? `
                            <param name="${CUSTOM_TITLE_TEXT_POSITION_PARAM.name}" key="${CUSTOM_TITLE_TEXT_POSITION_PARAM.key}" value="${LANDSCAPE_CUSTOM_TITLE_TEXT_POSITION}"/>`
    : '';

  return `${textPositionParam}
                            <param name="${CUSTOM_TITLE_ALIGNMENT_PARAM.name}" key="${CUSTOM_TITLE_ALIGNMENT_PARAM.key}" value="${CUSTOM_TITLE_ALIGNMENT_PARAM.value}"/>
                            <param name="${CUSTOM_TITLE_OUT_SEQUENCING_PARAM.name}" key="${CUSTOM_TITLE_OUT_SEQUENCING_PARAM.key}" value="${CUSTOM_TITLE_OUT_SEQUENCING_PARAM.value}"/>
                            <param name="${CUSTOM_TITLE_DISABLE_DRT_PARAM.name}" key="${CUSTOM_TITLE_DISABLE_DRT_PARAM.key}" value="${CUSTOM_TITLE_DISABLE_DRT_PARAM.value}"/>`;
}

function buildSubtitleBackgroundVideo(
  fcpxmlExportSpec: FcpxmlExportSpec,
  startOffset: number,
  durOffset: number,
  fpsScale: number
): string {
  if (!fcpxmlExportSpec.backgroundStyle.isEnabled || durOffset <= 0) return '';

  const backgroundRectangle = BACKGROUND_RECTANGLE_BY_ORIENTATION[fcpxmlExportSpec.format.orientation];
  const backgroundRectangleCoordinates = getBackgroundRectangleCoordinates(fcpxmlExportSpec);
  const backgroundFillColor = hexToRgbValues(fcpxmlExportSpec.backgroundStyle.backgroundColor, 6);
  const backgroundRoundness = fcpxmlExportSpec.backgroundStyle.borderRadius / FCP_ROUNDNESS_XML_SCALE;
  // 竖屏反导出样本包含矩形层 disableDRT；横屏样本没有该字段，因此按方向保留差异。
  const rectangleDisableDrtParam = backgroundRectangle.shouldWriteRectangleDisableDrt
    ? `
                                <param name="${CUSTOM_TITLE_DISABLE_DRT_PARAM.name}" key="${CUSTOM_TITLE_DISABLE_DRT_PARAM.key}" value="${CUSTOM_TITLE_DISABLE_DRT_PARAM.value}"/>`
    : '';

  return `
                            <video ref="${BACKGROUND_RECTANGLE_EFFECT_ID}" lane="-1" offset="${startOffset}/${fpsScale}s" name="${BACKGROUND_RECTANGLE_EFFECT.name}" start="${FCP_GENERATOR_START_TIME}" duration="${durOffset}/${fpsScale}s">
                                <param name="${RECTANGLE_BUILD_IN_PARAM.name}" key="${RECTANGLE_BUILD_IN_PARAM.key}" value="${RECTANGLE_BUILD_IN_PARAM.value}"/>
                                <param name="${RECTANGLE_BUILD_OUT_PARAM.name}" key="${RECTANGLE_BUILD_OUT_PARAM.key}" value="${RECTANGLE_BUILD_OUT_PARAM.value}"/>
                                <param name="${RECTANGLE_RIGHT_TOP_PARAM.name}" key="${RECTANGLE_RIGHT_TOP_PARAM.key}" value="${backgroundRectangleCoordinates.rightTop}"/>
                                <param name="${RECTANGLE_LEFT_BOTTOM_PARAM.name}" key="${RECTANGLE_LEFT_BOTTOM_PARAM.key}" value="${backgroundRectangleCoordinates.leftBottom}"/>
                                <param name="${RECTANGLE_ROUNDNESS_PARAM.name}" key="${RECTANGLE_ROUNDNESS_PARAM.key}" value="${backgroundRoundness}"/>
                                <param name="${RECTANGLE_FILL_OPACITY_PARAM.name}" key="${RECTANGLE_FILL_OPACITY_PARAM.key}" value="${fcpxmlExportSpec.backgroundStyle.backgroundOpacity}"/>
                                <param name="${RECTANGLE_FILL_COLOR_PARAM.name}" key="${RECTANGLE_FILL_COLOR_PARAM.key}" value="${backgroundFillColor}"/>${rectangleDisableDrtParam}
                            </video>`;
}

export function buildFcpxmlExportArtifact(
  entries: SrtEntry[],
  fcpxmlExportSpec: FcpxmlExportSpec,
  subtitleFileName: string
): FcpxmlExportArtifact {
  return {
    content: generateFcpxml(entries, fcpxmlExportSpec),
    fileName: getFcpxmlExportFileName(subtitleFileName),
    mimeType: FCPXML_MIME_TYPE,
  };
}

export function generateFcpxml(entries: SrtEntry[], fcpxmlExportSpec: FcpxmlExportSpec): string {
  const frameRate = fcpxmlExportSpec.frameRate;
  const duration = entries.length > 0 ? entries[entries.length - 1].endSeconds : 0;
  const totalFrames = Math.round(duration * frameRate);

  const fpsScale = frameRate * FCP_TIME_UNIT_PER_FRAME; // 3000 for 30fps, 6000 for 60fps

  const { width, height } = fcpxmlExportSpec.format;
  const sequenceDuration = totalFrames * FCP_TIME_UNIT_PER_FRAME;
  const textColor = hexToRgbValues(fcpxmlExportSpec.titleStyle.textColor);
  const backgroundRectangleEffectResource = fcpxmlExportSpec.backgroundStyle.isEnabled
    ? `
        <effect id="${BACKGROUND_RECTANGLE_EFFECT_ID}" name="${BACKGROUND_RECTANGLE_EFFECT.name}" uid="${BACKGROUND_RECTANGLE_EFFECT.uid}"/>`
    : '';
  const customTitleParams = buildCustomTitleParams(fcpxmlExportSpec);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.9">
    <resources>
        <format id="r1" frameDuration="100/${fpsScale}s" width="${width}" height="${height}" colorSpace="1-1-1 (Rec. 709)"/>
        <!-- 使用 Custom.moti 是因为它是跨语言、跨版本兼容性最好的基础模板，路径极度稳定且没有预设的冲突动画 -->
        <effect id="${CUSTOM_TITLE_EFFECT_ID}" name="Custom" uid=".../Titles.localized/Build In:Out.localized/Custom.localized/Custom.moti"/>${backgroundRectangleEffectResource}
    </resources>
    <library>
        <event name="SRT2FCPXML">
            <project name="Subtitles">
                <sequence duration="${sequenceDuration}/${fpsScale}s" format="r1" tcStart="0s" tcFormat="NDF">
                    <spine>
                        <gap name="Gap" offset="0s" duration="${sequenceDuration}/${fpsScale}s" start="0s">`;

  entries.forEach((entry, index) => {
    // 强制将时间从浮点秒数换算为实际的帧数，再转换回 FCPX 的标准分数表现（如 30fps 下的 100/3000s 制）
    // 严格确保所有偏移 (offset) 与持续时间 (duration) 落在整数帧边缘，避免 "此项目不在编辑帧边界上" DTD 报错

    // --- 为什么 Generator 的 start 时间不能是动态的？ ---
    // <title> 标签里的 start 属性，代表的是【这个字幕预设（Generator）体内的渲染初始时间】，而不是它在主轴上出现的时间（那是 offset 的事）！
    // 如果把由外部视频时间决定的 offset 同时喂给 start（比如第两分钟出现时传了 start="120s"），
    // FCP 就会傻傻地从这个字幕预设的“第两分钟寿命点”处开始播放。
    // 但普通内置文字没写连续循环，活不到两分钟，结果就是渲染出一片空白（导致在检查器有字幕块，画面里没字）。
    // 所以，一定要把它在模版体内的开局时间锁死成确定的起始点，常见的就是苹果模板引擎标准的 "3600s"（01:00:00:00）或者是 "0s"。

    const startFrames = Math.round(entry.startSeconds * frameRate);
    const endFrames = Math.round(entry.endSeconds * frameRate);

    const startOffset = startFrames * FCP_TIME_UNIT_PER_FRAME;
    const durOffset = (endFrames - startFrames) * FCP_TIME_UNIT_PER_FRAME;
    const escapedText = escapeXml(entry.text);
    const subtitleBackgroundVideo = buildSubtitleBackgroundVideo(
      fcpxmlExportSpec,
      startOffset,
      durOffset,
      fpsScale
    );

    // --- FCPXML 的坐标系到底是什么？ ---
    // 在苹果的 FCPXML 1.9+ 协议里，<adjust-transform> 的 position 并不是绝对像素，也不是 0.0 到 1.0 的浮点比例！
    // 它的底层机制是：【数值 1 代表 1% 的画幅尺寸】，即传 100 代表 100%。
    // FCPX 检查器中的原点 (0,0) 在屏幕正中央，Y 轴向下为负值。
    // 开启字幕背景时，每个 Subtitle Clip 输出一段同 offset/duration 的矩形背景，避免字幕空档继续显示底板。
    xml += `${subtitleBackgroundVideo}
                            <title lane="1" ref="${CUSTOM_TITLE_EFFECT_ID}" offset="${startOffset}/${fpsScale}s" name="${escapedText.substring(0, 20)}" duration="${durOffset}/${fpsScale}s" start="${FCP_GENERATOR_START_TIME}">${customTitleParams}
                            <text>
                                <text-style ref="ts${index}">${escapedText}</text-style>
                            </text>
                            <text-style-def id="ts${index}">
                                <text-style font="PingFang SC" fontSize="${fcpxmlExportSpec.titleStyle.fontSize}" fontFace="Regular" fontColor="${textColor} 1" alignment="center"/>
                            </text-style-def>
                            <adjust-transform position="0 ${CUSTOM_TITLE_LAYER_POSITION_Y}"/>
                        </title>`;
  });

  xml += `
                        </gap>
                    </spine>
                </sequence>
            </project>
        </event>
    </library>
</fcpxml>`;

  return xml;
}
