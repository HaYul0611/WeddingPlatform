from html2image import Html2Image

try:
    hti = Html2Image()
    hti.snapshot(html="<h1>Test</h1>", save_as="test.png")
    print("Success")
except Exception as e:
    print(f"Error: {e}")
