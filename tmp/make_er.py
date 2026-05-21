import base64
import urllib.request
import json

mermaid_code = """
erDiagram
    MEMBER ||--o{ INVITATION : creates
    MEMBER ||--o{ PAYMENT : makes
    MEMBER ||--o{ PREFERENCE : inputs
    MEMBER ||--o{ RECOMMENDATION : receives
    MEMBER ||--o{ SCRAP : saves

    INVITATION ||--o{ GUESTBOOK : contains
    INVITATION ||--o{ RSVP : receives
    INVITATION ||--o{ PAYMENT : "축의금"

    PREFERENCE ||--o{ RECOMMENDATION : generates

    RECOMMENDATION ||--o{ SCRAP : "스크랩됨"

    MEMBER {
        VARCHAR member_id PK
        VARCHAR password
        VARCHAR name
        VARCHAR email
        VARCHAR phone
        VARCHAR subscription
    }

    INVITATION {
        VARCHAR inv_id PK
        VARCHAR member_id FK
        VARCHAR groom_name
        VARCHAR bride_name
        DATETIME wedding_date
        VARCHAR location
        VARCHAR bgm_url
    }

    GUESTBOOK {
        INT gb_id PK
        VARCHAR inv_id FK
        VARCHAR guest_name
        VARCHAR password
        TEXT message
    }

    RSVP {
        INT rsvp_id PK
        VARCHAR inv_id FK
        VARCHAR guest_name
        VARCHAR attend_status
        VARCHAR meal_status
        INT companion_count
    }

    PAYMENT {
        VARCHAR pay_id PK
        VARCHAR member_id FK
        VARCHAR inv_id FK
        VARCHAR pay_type
        INT amount
        VARCHAR status
    }

    PREFERENCE {
        INT pref_id PK
        VARCHAR member_id FK
        INT budget_min
        INT budget_max
        VARCHAR region
        VARCHAR season
        VARCHAR style
        INT guest_count
    }

    RECOMMENDATION {
        INT rec_id PK
        VARCHAR member_id FK
        INT pref_id FK
        VARCHAR vendor_type
        VARCHAR vendor_name
        VARCHAR vendor_region
        VARCHAR price_range
        DECIMAL match_score
    }

    SCRAP {
        INT scrap_id PK
        VARCHAR member_id FK
        INT rec_id FK
        TEXT memo
        TIMESTAMP created_at
    }
"""

with open(r'c:\Users\admin\Desktop\WeddingPlatform\temp\er_diagram.mmd', 'w', encoding='utf-8') as f:
    f.write(mermaid_code.strip())

state = {
    "code": mermaid_code.strip(),
    "mermaid": "{\n  \"theme\": \"default\"\n}",
    "autoSync": True,
    "updateDiagram": False
}
state_str = json.dumps(state)
b64 = base64.urlsafe_b64encode(state_str.encode('utf-8')).decode('ascii')
url = f"https://mermaid.ink/img/{b64}"

png_path = r'c:\Users\admin\Desktop\WeddingPlatform\temp\er_diagram.png'
try:
    print("Downloading ER Diagram PNG from mermaid.ink...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response, open(png_path, 'wb') as out_file:
        out_file.write(response.read())
    print(f"Saved: {png_path}")
except Exception as e:
    print(f"Error downloading PNG: {e}")
