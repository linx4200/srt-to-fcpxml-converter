"""独立通用基准的导出快照；只使用仓库文件，不读取外部原始样本。"""
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / 'tests/fixtures/fcpxml-preview-regression'


def canonical(element):
    attributes = dict(element.attrib)
    # 精简条目保留原时间；容器总时长保留在基准中，生成器按最后一条计算。
    if element.tag in ('sequence', 'gap', 'ref-clip'):
        attributes.pop('duration', None)
    return (element.tag, attributes, (element.text or '').strip(),
            [canonical(child) for child in element])


class ExportSnapshots(unittest.TestCase):
    def test_general_snapshots_and_layout_rules(self):
        manifest = json.loads((FIXTURES / 'manifest.json').read_text())
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / 'generated.json'
            subprocess.run(['node', '--import', 'tsx', 'tests/fcpxml-regression.ts', str(output)],
                           cwd=ROOT, check=True)
            generated = {row['file']: row['xml'] for row in json.loads(output.read_text())}
        for fixture in manifest:
            with self.subTest(file=fixture['file']):
                baseline = (FIXTURES / fixture['file']).read_bytes()
                self.assertEqual(hashlib.sha256(baseline).hexdigest(), fixture['sha256'])
                expected = ET.fromstring(baseline)
                actual = ET.fromstring(generated[fixture['file']])
                self.assertEqual(len(list(expected.iter('title'))), 3)
                # 保留基准的原始 style ID，生成器为精简输入重新编号；比较前验证并映射引用。
                for current, saved in zip(actual.iter('title'), expected.iter('title')):
                    definition = current.find('text-style-def')
                    reference = current.find('./text/text-style')
                    self.assertEqual(definition.get('id'), reference.get('ref'))
                    definition.set('id', saved.find('text-style-def').get('id'))
                    reference.set('ref', saved.find('./text/text-style').get('ref'))
                self.assertEqual(canonical(actual), canonical(expected))
                # 容器长度虽不与历史快照比较，仍须与固定输入末尾时间一致。
                spec = fixture['spec']
                duration = f"{round(fixture['entries'][-1]['endSeconds'] * spec['frameRate']) * 100}/{spec['frameRate'] * 100}s"
                for element in actual.iter():
                    if element.tag in ('sequence', 'gap', 'ref-clip'):
                        self.assertEqual(element.get('duration'), duration)


if __name__ == '__main__':
    unittest.main()
