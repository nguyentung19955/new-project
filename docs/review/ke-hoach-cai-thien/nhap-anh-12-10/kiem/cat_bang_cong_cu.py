import sys, json, base64, asyncio
from playwright.async_api import async_playwright
# usage: cat_tool.py <tool dir> <ma> <image> <out json> [extra js before]
tool, ma, img, out = sys.argv[1:5]
SEL = 'chonQuai' if tool == 'tach-quai' else 'chonNV'
extra = sys.argv[5] if len(sys.argv) > 5 else ''
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(f'http://localhost:8765/tools/{tool}/index.html')
        await pg.wait_for_timeout(800)
        idx = await pg.evaluate("([ma,SEL]) => { const o=[...document.querySelectorAll('#'+SEL+' option')].find(o=>o.textContent.includes('('+ma+')')); return o? o.value : null }", [ma, SEL])
        print('option', idx)
        await pg.select_option('#'+SEL, idx)
        if extra: await pg.evaluate(extra)
        await pg.set_input_files('#chonAnh', img)
        await pg.wait_for_function('typeof KQ!=="undefined" && KQ && canvasTam', timeout=60000)
        await pg.wait_for_timeout(1500)
        bo = sys.argv[6] if len(sys.argv) > 6 else ''
        if bo:
            await pg.evaluate('pts => { BO = pts; chay(); }', json.loads(bo))
            await pg.wait_for_timeout(1500)
        
        print(await pg.inner_text('#dsKiem'))
        t = await pg.evaluate('JSON.stringify(taoTep())')
        open(out, 'w').write(t)
        d = json.loads(t)
        open(out.replace('.sprite.json', '.png'), 'wb').write(base64.b64decode(d['tam'].split(',')[1]))
        print('errors', errs)
        await b.close()
asyncio.run(main())
