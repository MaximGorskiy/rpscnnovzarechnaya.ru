"""Build a standalone, offline HTML snapshot using only the standard library."""
import base64
from datetime import datetime, timedelta, timezone
from html.parser import HTMLParser
import mimetypes
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'output' / 'zarechnaya-obshchina.html'


def data_url(url):
    path = (ROOT / unquote(urlsplit(url).path)).resolve()
    if not path.is_relative_to(ROOT / 'assets') or not path.is_file():
        raise ValueError(f'Asset outside site or missing: {url}')
    mime = mimetypes.guess_type(path)[0] or 'application/octet-stream'
    return f'data:{mime};base64,' + base64.b64encode(path.read_bytes()).decode('ascii')


class OfflineCheck(HTMLParser):
    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag in ('iframe', 'object', 'embed'):
            raise ValueError(f'External embedded content: {tag}')
        if 'src' in values and not values['src'].startswith('data:'):
            raise ValueError(f'External resource: {values["src"]}')
        if tag == 'link' and values.get('href') and not values['href'].startswith('data:'):
            raise ValueError(f'External linked resource: {values["href"]}')
        if tag == 'img' and 'srcset' in values:
            raise ValueError('srcset needs explicit offline conversion')


def build():
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    css = (ROOT / 'styles.css').read_text(encoding='utf-8')
    css = re.sub(r'url\([\s\'"]*(assets/[^)\'"\s]+)[\s\'"]*\)',
                 lambda m: f'url("{data_url(m[1])}")', css)
    html, count = re.subn(r'<link\s+rel="stylesheet"\s+href="styles.css"\s*>',
                         lambda _: '<style>\n' + css + '\n</style>', html)
    if count != 1:
        raise ValueError('Expected exactly one stylesheet')
    scripts = []
    for filename in ('content.js', 'site.js'):
        html, count = re.subn(r'<script\s+src="' + re.escape(filename) + r'"\s+defer></script>', '', html)
        if count != 1:
            raise ValueError(f'Expected exactly one script: {filename}')
        scripts.append((ROOT / filename).read_text(encoding='utf-8'))
    # Dynamic construction photos retain their original validated paths; resolve
    # those paths to embedded bytes only at rendering time.
    import json
    content = re.sub(r'/\*.*?\*/', '', scripts[0], flags=re.DOTALL)
    dynamic_assets = {url: data_url(url) for url in set(re.findall(r'assets/[a-zA-Z0-9_./-]+\.(?:webp|jpe?g|png)', content))}
    scripts.insert(1, 'window.COMMUNITY_ASSETS = ' + json.dumps(dynamic_assets) + ';')
    html = re.sub(r'((?:src|href)=")((?:assets/)[^"]+)(")',
                  lambda m: m[1] + data_url(m[2]) + m[3], html)
    html, count = re.subn(r'<iframe\b[^>]*>.*?</iframe>',
                         '<div class="offline-map"><p><strong>Храм на Берёзовской</strong><br>'
                         'Нижний Новгород, Берёзовская улица, 2А.</p>'
                         '<p>Интерактивная карта доступна по ссылке ниже при подключении к интернету.</p></div>',
                         html, flags=re.DOTALL)
    if count != 1:
        raise ValueError('Expected the known map iframe; review offline replacement')
    date = datetime.now(timezone(timedelta(hours=3))).strftime('%d.%m.%Y')
    html = html.replace('</footer>', f'<p class="footer-note">Автономная копия сайта от {date}. '
                        'Обновления сайта не появляются в этом файле автоматически.</p></footer>')
    # Defer has no effect for inline scripts: put them after the complete body DOM.
    inline = '\n'.join('<script>\n' + script.replace('</script', '<\\/script') + '\n</script>' for script in scripts)
    html = html.replace('</body>', inline + '\n</body>')
    OfflineCheck().feed(html)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(html, encoding='utf-8')
    print(f'Created: {OUTPUT}\nSize: {OUTPUT.stat().st_size / 1024**2:.2f} MiB')


if __name__ == '__main__':
    build()
