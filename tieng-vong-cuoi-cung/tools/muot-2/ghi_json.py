"""Ghi JSON giữ đúng kiểu trình bày gốc (indent=1; mảng nào gốc viết 1 dòng thì vẫn 1 dòng)."""
import json

def _get(d, path):
    for p in path:
        try: d = d[p]
        except Exception: return None
    return d

def dump(goc_text, data):
    goc = json.loads(goc_text)
    def inline_goc(path, k):
        v = _get(goc, path)
        if not isinstance(v, list): return False
        return ('"%s": %s' % (k, json.dumps(v, ensure_ascii=False))) in goc_text
    def ve(v, path, lv):
        sp = ' ' * lv
        if isinstance(v, dict):
            if not v: return '{}'
            items = []
            for k, x in v.items():
                items.append(' ' * (lv + 1) + json.dumps(k, ensure_ascii=False) + ': ' + ve(x, path + [k], lv + 1))
            return '{\n' + ',\n'.join(items) + '\n' + sp + '}'
        if isinstance(v, list):
            if not v: return '[]'
            k = path[-1] if path else None
            if isinstance(k, str) and inline_goc(path, k) and all(not isinstance(x, (dict, list)) for x in v):
                return json.dumps(v, ensure_ascii=False)
            return '[\n' + ',\n'.join(' ' * (lv + 1) + ve(x, path + [i], lv + 1) for i, x in enumerate(v)) + '\n' + sp + ']'
        return json.dumps(v, ensure_ascii=False)
    out = ve(data, [], 0)
    return out + ('\n' if goc_text.endswith('\n') else '')

if __name__ == '__main__':
    import sys
    for f in sys.argv[1:]:
        s = open(f).read(); print(f, dump(s, json.loads(s)) == s)
