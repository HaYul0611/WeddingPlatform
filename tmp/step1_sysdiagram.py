import asyncio
import openpyxl
from openpyxl.drawing.image import Image
from openpyxl.styles import Font
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        # ── 1. 시스템구성도 PNG 생성 ──────────────────────────────
        page = await browser.new_page(viewport={'width': 980, 'height': 900})
        await page.goto(r'file:///c:/Users/admin/Desktop/WeddingPlatform/temp/architecture.html')
        await asyncio.sleep(1)
        arch_png = r'c:\Users\admin\Desktop\WeddingPlatform\temp\architecture_saas.png'
        await page.locator('.diagram').screenshot(path=arch_png)
        await page.close()

        await browser.close()
    print("PNG 생성 완료")

    # ── 2. 시스템구성도.xlsx 업데이트 (기존 구조 유지, 이미지만 교체) ──
    xlsx_sys = r'c:\Users\admin\Desktop\WeddingPlatform\temp\20260521_시스템구성도.xlsx'
    wb = openpyxl.load_workbook(xlsx_sys)
    ws = wb.active
    ws._images.clear()
    img = Image(arch_png)
    img.anchor = 'B4'
    ws.add_image(img)
    wb.save(xlsx_sys)
    print("시스템구성도.xlsx 저장 완료")

asyncio.run(main())
