"""
AI Comic Story Studio - Web Launcher
"""
import uvicorn
import sys
import io

# Fix Windows console encoding for emoji
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

PORT = 8080

if __name__ == "__main__":
    print()
    print("=" * 60)
    print("AI COMIC STORY STUDIO - Web Application")
    print(f"Server starting at: http://127.0.0.1:{PORT}")
    print("=" * 60)
    print()

    uvicorn.run(
        "server:app",
        host="127.0.0.1",
        port=PORT,
        reload=True,
    )
