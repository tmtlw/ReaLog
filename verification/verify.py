
from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        print("Loading...")
        page.goto("http://localhost:3000")
        time.sleep(5)

        page.screenshot(path="verification/dashboard.png")
        print("Done.")
        browser.close()

if __name__ == "__main__":
    run()
