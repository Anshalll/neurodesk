import secrets
from functools import wraps
from flask import g, session, jsonify

from Errors.app_errors import UserNotFound
from db.db import db
from models.users import AuthCredential, User


def is_user_authenticated():
    user_id = session.get("user_id")
    user = db.session.get(User, user_id) if user_id else None
    credential = (
        AuthCredential.query.filter_by(user_id=user.id).first() if user else None
    )
    if (
        not user
        or not credential
        or not credential.email_verified
        or not secrets.compare_digest(
            credential.session_version or "", session.get("session_version", "")
        )
    ):
        raise UserNotFound("Authentication required.")
    g.current_user = user
    return {"user": user.email, "id": user.id}


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            is_user_authenticated()
        except UserNotFound as e:
            return jsonify({"error": str(e)}), 401
        return f(*args, **kwargs)
    return decorated_function