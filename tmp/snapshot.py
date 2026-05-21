import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 900, 'height': 1100})
        await page.goto(r'file:///c:/Users/admin/Desktop/WeddingPlatform/temp/architecture.html')
        await page.screenshot(path=r'c:\Users\admin\Desktop\WeddingPlatform\temp\architecture.png')
        await browser.close()

asyncio.run(main())
