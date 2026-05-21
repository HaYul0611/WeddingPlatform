import openpyxl
from openpyxl.drawing.image import Image
from openpyxl.styles import Font

# ① 기존 시스템구성도 파일 로드 (구조 그대로 유지)
output_path = r'c:\Users\admin\Desktop\WeddingPlatform\temp\20260521_시스템구성도.xlsx'
wb = openpyxl.load_workbook(output_path)
ws = wb.active

# ② SaaS 추천 엔진이 포함된 업데이트된 architecture PNG를 생성하기 위해
#    architecture.html을 먼저 새로 생성하고 스크린샷을 찍어 삽입

# 기존 이미지 삭제 후 새 이미지로 교체
ws._images.clear()

import openpyxl.drawing.image as img_mod
architecture_png = r'c:\Users\admin\Desktop\WeddingPlatform\temp\architecture_saas.png'
try:
    img = Image(architecture_png)
    img.anchor = 'B4'
    ws.add_image(img)
    wb.save(output_path)
    print("시스템구성도 업데이트 완료")
except Exception as e:
    print(f"이미지 삽입 실패 (PNG 생성 먼저 필요): {e}")
