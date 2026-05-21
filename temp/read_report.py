import openpyxl
import json

file_path = r'c:\Users\admin\Desktop\WeddingPlatform\temp\8. 개인 프로젝트 결과 보고서.xlsx'
try:
    wb = openpyxl.load_workbook(file_path, data_only=True)
    ws = wb.active
    data = []
    for row in range(1, 25):
        row_data = []
        for col in range(1, 10):
            cell = ws.cell(row=row, column=col)
            row_data.append(str(cell.value) if cell.value else "")
        data.append(row_data)

    with open(r'c:\Users\admin\Desktop\WeddingPlatform\temp\report_template.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
except Exception as e:
    with open(r'c:\Users\admin\Desktop\WeddingPlatform\temp\report_template.json', 'w', encoding='utf-8') as f:
        f.write(str(e))
