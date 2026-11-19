from datetime import datetime, timezone
from db.db import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    auth_credential = db.relationship(
        "AuthCredential",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def to_dict(self):
        created_str = (
            self.created_at.isoformat()
            if self.created_at
            else datetime.now(timezone.utc).isoformat()
        )
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "avatar": f"https://ui-avatars.com/api/?name={self.name}&background=6366f1&color=fff&size=96",
            "provider": "email",
            "joinedAt": created_str,
            "created_at": created_str,
        }


class AuthCredential(db.Model):
    __tablename__ = "user_auth_credentials"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    password_hash = db.Column(db.String(255), nullable=False)
    email_verified = db.Column(db.Boolean, default=False, nullable=False)
    verification_code_hash = db.Column(db.String(64))
    verification_expires_at = db.Column(db.BigInteger)
    verification_requested_at = db.Column(db.BigInteger)
    verification_attempts = db.Column(db.Integer, default=0, nullable=False)
    reset_code_hash = db.Column(db.String(64))
    reset_expires_at = db.Column(db.BigInteger)
    reset_requested_at = db.Column(db.BigInteger)
    reset_attempts = db.Column(db.Integer, default=0, nullable=False)
    token_version = db.Column(
        "session_version", db.String(64), nullable=False, default=""
    )
    user = db.relationship("User", back_populates="auth_credential")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)



class OTP(db.Model):
    __tablename__ = "otps"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False, index=True)
    code_seed = db.Column(db.String(64), nullable=False)
    code_hash = db.Column(db.String(64), nullable=False)
    expires_at = db.Column(db.BigInteger, nullable=False)
    verification_attempts = db.Column(db.Integer, default=0, nullable=False)
    resend_attempts = db.Column(db.Integer, default=0, nullable=False)
    resend_cooldown_until = db.Column(db.BigInteger)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

