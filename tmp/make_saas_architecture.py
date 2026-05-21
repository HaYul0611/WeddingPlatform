import base64
import urllib.request
import json
import asyncio
import openpyxl
from openpyxl.drawing.image import Image
from openpyxl.styles import Font
from playwright.async_api import async_playwright

puml_code = """
@startuml
!theme cerulean
skinparam defaultFontName Malgun Gothic
skinparam componentStyle rectangle
skinparam ArrowColor #555555
skinparam ArrowThickness 1.5

package "Client Layer" {
  [Mobile Web Browser] as Mobile
  [Desktop Web Browser] as Desktop
  [Tablet Browser] as Tablet
}

package "Frontend Layer (Next.js 14)" {
  [App Router (SSR/CSR)] as AppRouter
  [청첩장 뷰어 / BGM 플레이어] as InvView
  [SaaS 추천 UI] as SaasUI
  [관리자 Dashboard] as AdminUI
}

package "Backend Layer (Supabase)" {
  [Supabase Auth] as Auth
  database "PostgreSQL DB" as DB
  [Supabase Storage] as Storage
  [Realtime Engine] as Realtime
}

package "SaaS 추천 엔진 (Recommendation Engine)" {
  [선호도 분석기] as PrefEngine
  [업체 매칭 알고리즘] as MatchEngine
  [큐레이션 결과 생성] as CurationEngine
  [구독 관리 (SaaS)] as SubsManager
}

cloud "External APIs" {
  [Map (Naver/Kakao/Google)] as MapAPI
  [Payment (PortOne)] as Payment
  [카카오 알림톡] as Noti
  [웨딩 파트너 업체 DB] as VendorDB
}

Mobile  --> AppRouter : HTTP / HTTPS
Desktop --> AppRouter : HTTP / HTTPS
Tablet  --> AppRouter : HTTP / HTTPS

AppRouter --> InvView
AppRouter --> SaasUI
AppRouter --> AdminUI

AppRouter --> Auth    : SDK API
AppRouter --> DB      : SDK API
AppRouter --> Storage : SDK API
AppRouter --> Realtime : SDK API

SaasUI --> PrefEngine    : REST
PrefEngine --> MatchEngine
MatchEngine --> CurationEngine
CurationEngine --> SubsManager

AppRouter --> MapAPI  : REST
AppRouter --> Payment : REST
AppRouter --> Noti    : REST
MatchEngine --> VendorDB : REST

@enduml
"""

puml_path = r'c:\Users\admin\Desktop\WeddingPlatform\temp\architecture_saas.puml'
with open(puml_path, 'w', encoding='utf-8') as f:
    f.write(puml_code.strip())

# PlantUML 서버로 PNG 렌더링
from plantuml import PlantUML
pl = PlantUML(url='http://www.plantuml.com/plantuml/img/')
png_path = r'c:\Users\admin\Desktop\WeddingPlatform\temp\architecture_saas.png'
pl.processes_file(puml_path, outfile=png_path)
print(f"Saved PlantUML PNG: {png_path}")

# 시스템구성도 Excel 업데이트
xlsx_sys = r'c:\Users\admin\Desktop\WeddingPlatform\temp\20260521_시스템구성도.xlsx'
wb = openpyxl.load_workbook(xlsx_sys)
ws = wb.active
ws._images.clear()
img = Image(png_path)
img.anchor = 'B4'
ws.add_image(img)
wb.save(xlsx_sys)
print("시스템구성도.xlsx 업데이트 완료")
