import time
import threading
import http.server
import socketserver
from playwright.sync_api import sync_playwright

PORT = 8000

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    Handler = http.server.SimpleHTTPRequestHandler
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"Serving at port {PORT}")
            httpd.serve_forever()
    except OSError as e:
        print(f"Server error: {e}")

def verify_dashboard():
    # Start server in background
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2) # Wait for server to start

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))
        page.on("pageerror", lambda err: print(f"BROWSER ERROR: {err}"))

        # Navigate to localhost
        page.goto(f"http://localhost:{PORT}/index.html")

        try:
            # Wait for loader to finish
            page.wait_for_selector("text=Rendszer indítása...", state="detached", timeout=20000)
            print("Loader disappeared.")

            # --- Login Flow ---
            # Wait for login screen explicitly
            try:
                page.wait_for_selector("text=ReaLog", timeout=3000)
                print("Login Screen detected.")

                print("Entering password...")
                page.fill("input[data-testid='password-input']", "grind")

                page.wait_for_timeout(500)

                print("Submitting login form via JS...")
                page.evaluate("document.querySelector('form').requestSubmit()")
            except Exception as e:
                print(f"Login screen skipped or not found: {e}")


            # --- Dashboard Verification ---
            print("Waiting for dashboard...")
            page.wait_for_selector("text=Szia,", timeout=10000)
            print("Found greeting (Dashboard loaded).")

            page.wait_for_selector(":has-text('Közösségi Üzenőfal')", timeout=10000)
            print("Found Social Feed.")

            if page.is_visible(":has-text('Statisztika')"):
                 print("Found Stats widget.")

            # Take success screenshot
            page.screenshot(path="verification/dashboard_http_success.png")
            print("Verification successful.")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/dashboard_http_failed.png")

        browser.close()

if __name__ == "__main__":
    verify_dashboard()
