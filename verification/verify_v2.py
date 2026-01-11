import time
from playwright.sync_api import sync_playwright

def verify_dashboard():
    with sync_playwright() as p:
        # Enable file access for fetch() to work with file:// protocol
        browser = p.chromium.launch(headless=True, args=["--allow-file-access-from-files"])
        page = browser.new_page()

        # Open the app using file:// protocol pointing to absolute path in sandbox
        page.goto("file:///app/index.html")

        # Wait for app to load
        try:
            page.wait_for_selector("text=Rendszer indítása...", state="detached", timeout=15000)
            print("Loader disappeared.")
        except Exception as e:
            print("Loader did not disappear.")
            page.screenshot(path="verification/error_loader_retry.png")
            return

        # Check for Dashboard elements
        try:
            # Look for greeting
            page.wait_for_selector("text=Szia,", timeout=5000)
            print("Found greeting.")

            # Look for Social Feed header
            page.wait_for_selector("text=Közösségi Üzenőfal", timeout=5000)
            print("Found Social Feed.")

            # Take verification screenshot
            page.screenshot(path="verification/dashboard_verified.png")
            print("Verification successful. Screenshot: verification/dashboard_verified.png")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/dashboard_failed_retry.png")

        browser.close()

if __name__ == "__main__":
    verify_dashboard()
