import time
from playwright.sync_api import sync_playwright

def verify_dashboard():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Open the app using file:// protocol
        page.goto("file:///app/index.html")

        # Wait for app to load (indicator to disappear)
        try:
            page.wait_for_selector("text=Rendszer indítása...", state="detached", timeout=15000)
            print("Loader disappeared.")
        except Exception as e:
            print("Loader did not disappear, checking for errors...")
            page.screenshot(path="verification/error_loader.png")
            content = page.content()
            print(content[:2000]) # Print first 2000 chars of HTML to check for error screens
            browser.close()
            return

        # Check if we are on Dashboard
        try:
            # Look for "Szia," greeting or "Közösségi Üzenőfal"
            page.wait_for_selector("text=Szia,", timeout=5000)
            print("Found greeting.")

            page.wait_for_selector("text=Közösségi Üzenőfal", timeout=5000)
            print("Found Social Feed.")

            # Take screenshot of Dashboard
            page.screenshot(path="verification/dashboard_verified.png")
            print("Screenshot taken: verification/dashboard_verified.png")

        except Exception as e:
            print(f"Dashboard verification failed: {e}")
            page.screenshot(path="verification/dashboard_failed.png")

        browser.close()

if __name__ == "__main__":
    verify_dashboard()
