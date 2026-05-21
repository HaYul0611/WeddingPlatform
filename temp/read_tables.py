import pandas as pd
import json

file_path = r'c:\Users\admin\Desktop\WeddingPlatform\temp\5. 테이블정의서.xlsx'
try:
    df = pd.read_excel(file_path, sheet_name=None)
    output = {}
    for sheet_name, sheet_df in df.items():
        sheet_df = sheet_df.fillna("")
        output[sheet_name] = sheet_df.head(15).to_dict(orient='records')
    
    with open(r'c:\Users\admin\Desktop\WeddingPlatform\temp\read_tables.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
except Exception as e:
    with open(r'c:\Users\admin\Desktop\WeddingPlatform\temp\read_tables.json', 'w', encoding='utf-8') as f:
        f.write(str(e))
