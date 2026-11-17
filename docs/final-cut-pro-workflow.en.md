# Final Cut Pro Workflow

[Back to User Guide](./user-guide.en.md) · [中文](./final-cut-pro-workflow.zh-CN.md)

1. Finish any text edit and choose “Done Editing” to return to the main workspace.
2. Check orientation, frame rate, and style, then choose “Export FCPXML” in the header.
3. Use Final Cut Pro's XML import feature to open the downloaded `.fcpxml`. The export uses FCPXML 1.9; Apple documents Final Cut Pro 10.4.9 or later as the requirement. Keep orientation and frame rate consistent with the target project, and update FCP first if the import fails.
4. Exported subtitles are organized in a compound clip named `subtitles`. Use it with your actual video project, align the time origin, and check the first subtitle, last subtitle, and gaps.
5. Check text, backgrounds, placement, and fonts before completing your edit and output.

FCPXML contains subtitle text from the current Working Timeline. If you turn on “Subtitle Background”, the corresponding background boxes are also exported. It does not include reference audio, real video, or platform overlays. Manage actual media in FCP.
