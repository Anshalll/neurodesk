import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from db.db import db
from db.check_db_connection import check
from models.users import User, AuthCredential, OTP
from models.skills import Skill, Page, Note
from controllers.auth_controller import auth_bp
from controllers.ai_controller import ai_bp
from controllers.skill_controller import skill_bp
from Errors.app_errors import AppError


def create_app():
    app = Flask(__name__)

    # Database configuration
    db_user = os.getenv("DB_USER", "root")
    db_password = os.getenv("DB_PASSWORD", "casper")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "3306")
    db_name = os.getenv("DB_NAME", "neurodesk")

    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    jwt_secret_key = os.getenv("JWT_SECRET_KEY")
    if not jwt_secret_key:
        raise RuntimeError("JWT_SECRET_KEY must be configured.")
    app.config["JWT_SECRET_KEY"] = jwt_secret_key
    app.config["JWT_ACCESS_TOKEN_SECONDS"] = int(
        os.getenv("JWT_ACCESS_TOKEN_SECONDS", "2592000")
    )
    if app.config["JWT_ACCESS_TOKEN_SECONDS"] <= 0:
        raise ValueError("JWT_ACCESS_TOKEN_SECONDS must be greater than zero.")
    app.config["JWT_COOKIE_NAME"] = "access_token"
    app.config["JWT_COOKIE_SECURE"] = os.getenv(
        "JWT_COOKIE_SECURE", "false"
    ).lower() in {"1", "true", "yes"}
    app.config["JWT_COOKIE_SAMESITE"] = os.getenv("JWT_COOKIE_SAMESITE", "Lax")
    if app.config["JWT_COOKIE_SAMESITE"] not in {"Lax", "Strict", "None"}:
        raise ValueError("JWT_COOKIE_SAMESITE must be Lax, Strict, or None.")
    if (
        app.config["JWT_COOKIE_SAMESITE"] == "None"
        and not app.config["JWT_COOKIE_SECURE"]
    ):
        raise ValueError("JWT_COOKIE_SECURE must be true when SameSite is None.")

    # CORS configuration
    import re
    client_origin = os.getenv("CLIENT_ORIGIN", "http://localhost:5173")
    localhost_regex = re.compile(r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$")
    CORS(
        app,
        supports_credentials=True,
        origins=[
            client_origin,
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5174",
            "http://localhost:5175",
            "http://127.0.0.1:5175",
            localhost_regex,
        ],
    )

    # Initialize extensions
    db.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(skill_bp)

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "healthy", "service": "Nurodesk Backend"}), 200

    @app.errorhandler(AppError)
    def handle_app_error(err):
        return jsonify({"error": err.message}), err.status_code

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "Internal server error"}), 500

    # Verify DB and create tables
    with app.app_context():
        check(app)
        db.create_all()
        print("[OK] Tables verified/created in database:", db_name)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
