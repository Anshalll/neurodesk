import hashlib
import re
import secrets
import time
from flask import Blueprint, jsonify, request, session
from werkzeug.security import check_password_hash, generate_password_hash

from Errors.app_errors import (
    InvalidCredentials,
    TokenExpiredOrInvalid,
    UserAlreadyExists,
    UserNotFound,
    ValidationError,
)
from db.db import db
from models.users import AuthCredential, User
from services.email_service import send_otp_email

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def _is_valid_email(email: str) -> bool:
    return bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email or ""))


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required."}), 400

    if not _is_valid_email(email):
        return jsonify({"error": "Please enter a valid email address."}), 400

    if len(password) < 6:
        return (
            jsonify({"error": "Password must be at least 6 characters long."}),
            400,
        )

    # Check if user already exists
    existing = User.query.filter_by(email=email).first()
    if existing:
        return (
            jsonify({"error": "An account with this email already exists."}),
            409,
        )

    session_ver = secrets.token_hex(16)
    new_user = User(name=name, email=email)
    db.session.add(new_user)
    db.session.flush()

    credential = AuthCredential(
        user_id=new_user.id,
        password_hash=generate_password_hash(password),
        email_verified=True,
        session_version=session_ver,
    )
    db.session.add(credential)
    db.session.commit()

    # Log user in
    session["user_id"] = new_user.id
    session["session_version"] = session_ver
    session.permanent = True

    return (
        jsonify(
            {
                "message": "Account created successfully.",
                "user": new_user.to_dict(),
            }
        ),
        201,
    )


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        print("user not found!")
        return jsonify({"error": "Invalid email or password."}), 401

    credential = AuthCredential.query.filter_by(user_id=user.id).first()
    print(check_password_hash(credential.password_hash, password))
    if not credential or not check_password_hash(credential.password_hash, password):
        return jsonify({"error": "Invalid email or password."}), 401

    # Ensure session_version exists
    if not credential.session_version:
        credential.session_version = secrets.token_hex(16)
        db.session.commit()

    session["user_id"] = user.id
    session["session_version"] = credential.session_version
    session.permanent = True

    return (
        jsonify(
            {
                "message": "Signed in successfully.",
                "user": user.to_dict(),
            }
        ),
        200,
    )


@auth_bp.route("/google", methods=["POST"])
def google_auth():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "alex.student@gmail.com").strip().lower()
    name = (data.get("name") or "Alex Student").strip()

    user = User.query.filter_by(email=email).first()
    if not user:
        session_ver = secrets.token_hex(16)
        user = User(name=name, email=email)
        db.session.add(user)
        db.session.flush()

        credential = AuthCredential(
            user_id=user.id,
            password_hash=generate_password_hash(secrets.token_hex(16)),
            email_verified=True,
            session_version=session_ver,
        )
        db.session.add(credential)
        db.session.commit()
    else:
        credential = AuthCredential.query.filter_by(user_id=user.id).first()
        if not credential:
            credential = AuthCredential(
                user_id=user.id,
                password_hash=generate_password_hash(secrets.token_hex(16)),
                email_verified=True,
                session_version=secrets.token_hex(16),
            )
            db.session.add(credential)
            db.session.commit()

    session["user_id"] = user.id
    session["session_version"] = credential.session_version or secrets.token_hex(16)
    session.permanent = True

    return (
        jsonify(
            {
                "message": "Signed in successfully with Google.",
                "user": user.to_dict(),
            }
        ),
        200,
    )


@auth_bp.route("/me", methods=["GET"])
def get_current_user():
    user_id = session.get("user_id")
    session_ver = session.get("session_version", "")

    if not user_id:
        return jsonify({"user": None}), 200

    user = db.session.get(User, user_id)
    if not user:
        session.clear()
        return jsonify({"user": None}), 200

    credential = AuthCredential.query.filter_by(user_id=user.id).first()
    if not credential or not secrets.compare_digest(
        credential.session_version or "", session_ver
    ):
        session.clear()
        return jsonify({"user": None}), 200

    return jsonify({"user": user.to_dict()}), 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully."}), 200


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()

    if not email or not _is_valid_email(email):
        return jsonify({"error": "Please provide a valid email address."}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return (
            jsonify({"error": "No account found with this email address."}),
            404,
        )

    credential = AuthCredential.query.filter_by(user_id=user.id).first()
    if not credential:
        return jsonify({"error": "Authentication record not found."}), 404

    # Generate 6-digit OTP
    otp_code = f"{secrets.randbelow(900000) + 100000}"
    code_hash = hashlib.sha256(otp_code.encode()).hexdigest()
    expires_at = int(time.time()) + (15 * 60)  # 15 minutes

    credential.reset_code_hash = code_hash
    credential.reset_expires_at = expires_at
    credential.reset_requested_at = int(time.time())
    credential.reset_attempts = 0
    db.session.commit()

    send_otp_email(email, otp_code, purpose="Password Reset")

    return (
        jsonify(
            {
                "message": "A 6-digit verification code has been sent to your email.",
                "email": email,
            }
        ),
        200,
    )


@auth_bp.route("/verify-reset-code", methods=["POST"])
def verify_reset_code():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    otp = (data.get("otp") or "").strip()

    if not email or not otp:
        return jsonify({"error": "Email and verification code are required."}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Invalid request."}), 400

    credential = AuthCredential.query.filter_by(user_id=user.id).first()
    if not credential or not credential.reset_code_hash:
        return (
            jsonify({"error": "No password reset requested for this account."}),
            400,
        )

    if credential.reset_attempts >= 5:
        return (
            jsonify({"error": "Too many failed attempts. Please request a new code."}),
            429,
        )

    now = int(time.time())
    if not credential.reset_expires_at or now > credential.reset_expires_at:
        return (
            jsonify({"error": "Verification code has expired. Please request a new code."}),
            400,
        )

    hashed_input = hashlib.sha256(otp.encode()).hexdigest()
    if not secrets.compare_digest(credential.reset_code_hash, hashed_input):
        credential.reset_attempts += 1
        db.session.commit()
        return jsonify({"error": "Incorrect verification code."}), 400

    return jsonify({"message": "Verification code is valid.", "valid": True}), 200


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    otp = (data.get("otp") or "").strip()
    new_password = data.get("new_password") or ""

    if not email or not otp or not new_password:
        return (
            jsonify(
                {"error": "Email, verification code, and new password are required."}
            ),
            400,
        )

    if len(new_password) < 6:
        return (
            jsonify({"error": "Password must be at least 6 characters long."}),
            400,
        )

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Invalid request."}), 400

    credential = AuthCredential.query.filter_by(user_id=user.id).first()
    if not credential or not credential.reset_code_hash:
        return (
            jsonify({"error": "No active password reset request found."}),
            400,
        )

    if credential.reset_attempts >= 5:
        return (
            jsonify({"error": "Too many failed attempts. Please request a new code."}),
            429,
        )

    now = int(time.time())
    if not credential.reset_expires_at or now > credential.reset_expires_at:
        return (
            jsonify({"error": "Verification code has expired. Please request a new one."}),
            400,
        )

    hashed_input = hashlib.sha256(otp.encode()).hexdigest()
    if not secrets.compare_digest(credential.reset_code_hash, hashed_input):
        credential.reset_attempts += 1
        db.session.commit()
        return jsonify({"error": "Incorrect verification code."}), 400

    # Code is valid, update password
    credential.password_hash = generate_password_hash(new_password)
    credential.reset_code_hash = None
    credential.reset_expires_at = None
    credential.reset_requested_at = None
    credential.reset_attempts = 0
    # Invalidate old sessions
    credential.session_version = secrets.token_hex(16)
    db.session.commit()

    # Clear current session to force fresh login with new password
    session.clear()

    return (
        jsonify(
            {
                "message": "Password reset successfully! You can now log in with your new password."
            }
        ),
        200,
    )
