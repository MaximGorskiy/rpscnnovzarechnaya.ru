from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
class Checker(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.links = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f"Duplicate id: {attrs['id']}"
            self.ids.add(attrs['id'])
        for key in ('href', 'src'):
            if key in attrs:
                self.links.append(attrs[key])

checker = Checker()
checker.feed((root / 'index.html').read_text(encoding='utf-8'))
for link in checker.links:
    parsed = urlsplit(link)
    if parsed.scheme or parsed.netloc:
        continue
    if parsed.path:
        assert (root / unquote(parsed.path)).is_file(), f'Missing file: {link}'
    elif parsed.fragment:
        assert parsed.fragment in checker.ids, f'Missing anchor: {link}'
public = [root / f for f in ('index.html', 'styles.css', 'content.js', 'site.js', 'robots.txt', '.nojekyll')]
public += [p for p in (root / 'assets').rglob('*') if p.is_file()]
with ZipFile(root / 'site-upload.zip', 'w', ZIP_DEFLATED) as archive:
    for path in public:
        archive.write(path, path.relative_to(root))
size = sum(p.stat().st_size for p in public)
print(f'OK: {len(checker.links)} links, {len(checker.ids)} unique IDs; {len(public)} public files; {size / 1024**2:.2f} MiB')
print('Created site-upload.zip')
