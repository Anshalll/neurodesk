from datetime import datetime, timezone
from db.db import db


class Skill(db.Model):
    __tablename__ = "skills"

    id = db.Column(db.String(100), primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100), default="Computer Science")
    description = db.Column(db.Text)
    color = db.Column(db.String(50), default="indigo")
    icon = db.Column(db.String(50), default="Terminal")
    progress_mode = db.Column(db.String(20), default="auto")
    manual_progress = db.Column(db.Integer, default=0)
    target_date = db.Column(db.String(50))
    subtopics = db.Column(db.JSON, default=list)
    created_at = db.Column(
        db.String(50),
        default=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%d"),
    )
    updated_at = db.Column(
        db.String(50),
        default="Just now",
    )

    user = db.relationship("User", backref=db.backref("skills", cascade="all, delete-orphan"))
    pages = db.relationship("Page", backref="skill", cascade="all, delete-orphan", order_by="Page.order_index")
    notes = db.relationship("Note", backref="skill", cascade="all, delete-orphan")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def to_dict(self):
        subtopics_list = []
        saved_subtopics = {
            item.get("id"): item
            for item in (self.subtopics or [])
            if isinstance(item, dict) and item.get("id")
        }
        for p in self.pages:
            note_content = p.notes[0].content if (hasattr(p, "notes") and p.notes) else ""
            saved_subtopic = saved_subtopics.get(p.id, {})
            subtopics_list.append({
                "id": p.id,
                "title": p.title,
                "emoji": p.emoji or "📄",
                "completed": bool(p.completed),
                "status": p.status or "in_progress",
                "content": note_content,
                "quizzes": saved_subtopic.get("quizzes", []),
                "createdAt": p.created_at,
                "updatedAt": p.updated_at,
            })

        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "description": self.description or "",
            "color": self.color or "indigo",
            "icon": self.icon or "Terminal",
            "progressMode": self.progress_mode or "auto",
            "manualProgress": self.manual_progress or 0,
            "targetDate": self.target_date or "",
            "subtopics": subtopics_list,
            "pages": [p.to_dict() for p in self.pages] if self.pages else [],
            "createdAt": self.created_at,
            "updatedAt": self.updated_at,
        }


class Page(db.Model):
    __tablename__ = "pages"

    id = db.Column(db.String(100), primary_key=True)
    skill_id = db.Column(
        db.String(100),
        db.ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = db.Column(db.String(255), nullable=False)
    emoji = db.Column(db.String(50), default="📄")
    completed = db.Column(db.Boolean, default=False, nullable=False)
    status = db.Column(db.String(50), default="in_progress", nullable=False)
    order_index = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(
        db.String(50),
        default=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%d"),
    )
    updated_at = db.Column(
        db.String(50),
        default="Just now",
    )

    user = db.relationship("User", backref=db.backref("pages", cascade="all, delete-orphan"))
    notes = db.relationship("Note", backref="page", cascade="all, delete-orphan")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def to_dict(self):
        note_content = ""
        if hasattr(self, "notes") and self.notes:
            note_content = self.notes[0].content or ""
        return {
            "id": self.id,
            "skillId": self.skill_id,
            "userId": self.user_id,
            "title": self.title,
            "emoji": self.emoji or "📄",
            "completed": bool(self.completed),
            "status": self.status or "in_progress",
            "orderIndex": self.order_index,
            "content": note_content,
            "createdAt": self.created_at,
            "updatedAt": self.updated_at,
        }


class Note(db.Model):
    __tablename__ = "notes"

    id = db.Column(db.String(100), primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    skill_id = db.Column(
        db.String(100),
        db.ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    page_id = db.Column(
        db.String(100),
        db.ForeignKey("pages.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    content = db.Column(db.Text, nullable=False, default="")
    created_at = db.Column(
        db.String(50),
        default=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%d"),
    )
    updated_at = db.Column(
        db.String(50),
        default="Just now",
    )

    user = db.relationship("User", backref=db.backref("notes", cascade="all, delete-orphan"))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "skillId": self.skill_id,
            "pageId": self.page_id,
            "content": self.content or "",
            "createdAt": self.created_at,
            "updatedAt": self.updated_at,
        }
