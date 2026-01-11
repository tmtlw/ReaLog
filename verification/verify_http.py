import time
import threading
import http.server
import socketserver
from playwright.sync_api import sync_playwright

PORT = 8000

def start_server():
    Handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

def verify_dashboard():
    # Start server in background
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2) # Wait for server to start

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to localhost
        page.goto(f"http://localhost:{PORT}/index.html")

        try:
            # Wait for loader to finish
            page.wait_for_selector("text=Rendszer indítása...", state="detached", timeout=20000)
            print("Loader disappeared.")

            # Check for Dashboard content
            page.wait_for_selector("text=Szia,", timeout=10000)
            print("Found greeting.")

            page.wait_for_selector("text=Közösségi Üzenőfal", timeout=10000)
            print("Found Social Feed.")

            # Take success screenshot
            page.screenshot(path="verification/dashboard_http_success.png")
            print("Verification successful.")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/dashboard_http_failed.png")
            # Dump console logs if possible

        browser.close()

if __name__ == "__main__":
    verify_dashboard()
