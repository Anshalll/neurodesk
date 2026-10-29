from sqlalchemy import text
try:
    # pyrefly: ignore[missing-import]
    from db.db import db
except ImportError:
    from server.db.db import db

def check(app): 
    with app.app_context():
        try:
            db.session.execute(text("SELECT 1"))
            print("[OK] DB Connected successfully")
        except Exception as e:
            print("[FAIL] DB Connection failed:", e)