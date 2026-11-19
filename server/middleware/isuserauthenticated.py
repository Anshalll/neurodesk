import secrets
from functools import wraps
import jwt
from flask import current_app, g, request, jsonify

from db.db import db
from models.users import AuthCredential, User


def get_authenticated_user():
    token = request.cookies.get(current_app.config["JWT_COOKIE_NAME"])
    if not token:
        return None

    try:
        payload = jwt.decode(
            token,
            current_app.config["JWT_SECRET_KEY"],
            algorithms=["HS256"],
            options={"require": ["exp", "iat", "sub", "ver"]},
        )
        user_id = int(payload["sub"])
        token_version = payload["ver"]
        if not isinstance(token_version, str):
            return None
    except (jwt.InvalidTokenError, TypeError, ValueError):
        return None

    user = db.session.get(User, user_id)
    if not user:
        return None
    credential = AuthCredential.query.filter_by(user_id=user.id).first()
    if (
        not credential
        or not credential.email_verified
        or not secrets.compare_digest(
            credential.token_version or "", token_version
        )
    ):
        return None

    g.current_user = user
    return user


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not get_authenticated_user():
            return jsonify({"error": "Authentication required."}), 401
        return f(*args, **kwargs)

    return decorated_function