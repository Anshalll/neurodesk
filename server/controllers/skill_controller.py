# -*- coding: utf-8 -*-
import time
from datetime import datetime, timezone
from flask import Blueprint, jsonify, request, session
from db.db import db
from models.skills import Skill, Page, Note
from models.users import User

skill_bp = Blueprint("skills", __name__, url_prefix="/api/skills")

DEFAULT_SKILLS = [
    {
        "id": "skill_cpp_01",
        "name": "C++ Systems Programming",
        "category": "Computer Science",
        "description": "Master low-level memory control, modern C++20 idioms, RAII, smart pointers, and STL algorithms.",
        "color": "indigo",
        "icon": "Terminal",
        "progressMode": "auto",
        "manualProgress": 40,
        "targetDate": "2026-11-20",
        "createdAt": "2026-09-01",
        "updatedAt": "Just now",
        "subtopics": [
            {
                "id": "sub_cpp_1",
                "title": "1. Pointers, Memory & Reference Semantics",
                "emoji": "⚡",
                "completed": True,
                "status": "mastered",
                "content": "",
            },
            {
                "id": "sub_cpp_2",
                "title": "2. RAII & Smart Pointers (unique_ptr, shared_ptr)",
                "emoji": "🛡️",
                "completed": True,
                "status": "mastered",
                "content": "",
            },
            {
                "id": "sub_cpp_3",
                "title": "3. STL Containers, Iterators & Ranges",
                "emoji": "📦",
                "completed": False,
                "status": "in_progress",
                "content": "",
            },
            {
                "id": "sub_cpp_4",
                "title": "4. Object-Oriented Polymorphism & Virtual Tables",
                "emoji": "🧬",
                "completed": False,
                "status": "not_started",
                "content": "",
            },
            {
                "id": "sub_cpp_5",
                "title": "5. Concurrency, Threads & Atomic Operations",
                "emoji": "⚡",
                "completed": False,
                "status": "not_started",
                "content": "",
            },
        ],
    },
    {
        "id": "skill_dsa_02",
        "name": "Data Structures & Algorithms",
        "category": "Computer Science",
        "description": "Master binary search trees, graph traversals (BFS/DFS), dynamic programming, and heaps for coding interviews.",
        "color": "emerald",
        "icon": "BrainCircuit",
        "progressMode": "auto",
        "manualProgress": 66,
        "targetDate": "2026-10-30",
        "createdAt": "2026-08-20",
        "updatedAt": "Just now",
        "subtopics": [
            {
                "id": "sub_dsa_1",
                "title": "1. Binary Trees, BST & Tree Traversals",
                "emoji": "🌲",
                "completed": True,
                "status": "mastered",
                "content": "",
            },
            {
                "id": "sub_dsa_2",
                "title": "2. Graph Algorithms: Dijkstra & Topological Sort",
                "emoji": "🕸️",
                "completed": True,
                "status": "mastered",
                "content": "",
            },
            {
                "id": "sub_dsa_3",
                "title": "3. Dynamic Programming & Memoization",
                "emoji": "🧩",
                "completed": False,
                "status": "in_progress",
                "content": "",
            },
        ],
    },
    {
        "id": "skill_web_03",
        "name": "Full-Stack System Architecture",
        "category": "Software Engineering",
        "description": "High-availability backend design, caching layers (Redis), relational indexing, and message streaming with Kafka.",
        "color": "violet",
        "icon": "Layers",
        "progressMode": "auto",
        "manualProgress": 33,
        "targetDate": "2026-12-15",
        "createdAt": "2026-09-05",
        "updatedAt": "Just now",
        "subtopics": [
            {
                "id": "sub_web_1",
                "title": "1. Database Indexing & Query Optimization",
                "emoji": "🗄️",
                "completed": True,
                "status": "mastered",
                "content": "",
            },
            {
                "id": "sub_web_2",
                "title": "2. Distributed Caching with Redis",
                "emoji": "⚡",
                "completed": False,
                "status": "in_progress",
                "content": "",
            },
            {
                "id": "sub_web_3",
                "title": "3. Event-Driven Architecture & Message Queues",
                "emoji": "📨",
                "completed": False,
                "status": "not_started",
                "content": "",
            },
        ],
    },
]


def _get_current_user():
    """Retrieves and validates the currently authenticated User."""
    user_id = session.get("user_id")
    if not user_id:
        return None
    user = db.session.get(User, user_id)
    if not user:
        session.clear()
        return None
    return user


def _sync_skill_pages_and_notes(skill_id, user_id, raw_subtopics):
    """
    Synchronizes the pages and notes tables in MySQL for a skill workspace.
    - Saves every page in the `pages` table related to skill and user
    - Saves every note in the `notes` table related to skill, page, and user
    - Removes pages/notes that were deleted by the user
    """
    if raw_subtopics is None:
        return

    existing_pages = {
        p.id: p for p in Page.query.filter_by(skill_id=skill_id, user_id=user_id).all()
    }
    seen_page_ids = set()

    for idx, item in enumerate(raw_subtopics):
        page_id = item.get("id") or f"sub_{int(time.time() * 1000)}_{idx + 1}"
        seen_page_ids.add(page_id)
        title = item.get("title", f"{idx + 1}. Note")
        emoji = item.get("emoji", "📄")
        completed = bool(item.get("completed", False))
        status = item.get("status", "mastered" if completed else "in_progress")
        content = item.get("content", "")
        updated_at = item.get("updatedAt", "Just now")
        created_at = (
            item.get("createdAt")
            or datetime.now(timezone.utc).strftime("%Y-%m-%d")
        )

        if page_id in existing_pages:
            p = existing_pages[page_id]
            p.title = title
            p.emoji = emoji
            p.completed = completed
            p.status = status
            p.order_index = idx
            p.updated_at = updated_at
        else:
            p = Page(
                id=page_id,
                skill_id=skill_id,
                user_id=user_id,
                title=title,
                emoji=emoji,
                completed=completed,
                status=status,
                order_index=idx,
                created_at=created_at,
                updated_at=updated_at,
            )
            db.session.add(p)

        # Update or create the Note for this page
        existing_note = Note.query.filter_by(
            page_id=page_id, skill_id=skill_id, user_id=user_id
        ).first()
        if existing_note:
            existing_note.content = content
            existing_note.updated_at = updated_at
        else:
            note_id = f"note_{page_id}"
            n = Note(
                id=note_id,
                user_id=user_id,
                skill_id=skill_id,
                page_id=page_id,
                content=content,
                created_at=created_at,
                updated_at=updated_at,
            )
            db.session.add(n)

    # Remove pages (and cascading notes) that were deleted in the UI
    for page_id, p in existing_pages.items():
        if page_id not in seen_page_ids:
            db.session.delete(p)


def _seed_user_skills(user_id):
    """Seeds default skill workspaces for a user in MySQL without duplicate queries."""
    existing_skills = Skill.query.filter_by(user_id=user_id).all()
    existing_ids = {s.id for s in existing_skills}
    created_skills = []

    for item in DEFAULT_SKILLS:
        skill_id = f"{item['id']}_{user_id}"
        if skill_id not in existing_ids:
            s = Skill(
                id=skill_id,
                user_id=user_id,
                name=item["name"],
                category=item["category"],
                description=item["description"],
                color=item["color"],
                icon=item["icon"],
                progress_mode=item["progressMode"],
                manual_progress=item["manualProgress"],
                target_date=item["targetDate"],
                subtopics=item["subtopics"],
                created_at=item["createdAt"],
                updated_at=item["updatedAt"],
            )
            db.session.add(s)
            created_skills.append(s)

            # Sync pages and notes into MySQL tables
            _sync_skill_pages_and_notes(skill_id, user_id, item.get("subtopics", []))

    if created_skills:
        db.session.commit()

    return Skill.query.filter_by(user_id=user_id).all()


@skill_bp.route("", methods=["GET"])
def get_skills():
    user = _get_current_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401

    skills = Skill.query.filter_by(user_id=user.id).all()
    return jsonify({"skills": [s.to_dict() for s in skills]}), 200


@skill_bp.route("", methods=["POST"])
def create_skill():
    user = _get_current_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401

    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "Skill name is required"}), 400

    skill_id = data.get("id") or f"skill_{int(time.time() * 1000)}"
    now_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    raw_subtopics = data.get("subtopics") or data.get("pages") or []

    skill = Skill(
        id=skill_id,
        user_id=user.id,
        name=name,
        category=data.get("category", "Computer Science"),
        description=data.get("description", ""),
        color=data.get("color", "indigo"),
        icon=data.get("icon", "Terminal"),
        progress_mode=data.get("progressMode", "auto"),
        manual_progress=data.get("manualProgress", 0),
        target_date=data.get("targetDate", ""),
        subtopics=raw_subtopics,
        created_at=data.get("createdAt") or now_date,
        updated_at=data.get("updatedAt", "Just now"),
    )
    db.session.add(skill)

    # Save pages and notes in their respective tables
    _sync_skill_pages_and_notes(skill_id, user.id, raw_subtopics)

    db.session.commit()
    return jsonify({"skill": skill.to_dict()}), 201


@skill_bp.route("/<string:skill_id>", methods=["PUT"])
def update_skill(skill_id):
    user = _get_current_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401

    skill = Skill.query.filter_by(id=skill_id, user_id=user.id).first()
    if not skill:
        return jsonify({"error": "Skill workspace not found"}), 404

    data = request.get_json(silent=True) or {}
    if "name" in data:
        skill.name = data["name"].strip()
    if "category" in data:
        skill.category = data["category"]
    if "description" in data:
        skill.description = data["description"]
    if "color" in data:
        skill.color = data["color"]
    if "icon" in data:
        skill.icon = data["icon"]
    if "progressMode" in data:
        skill.progress_mode = data["progressMode"]
    if "manualProgress" in data:
        skill.manual_progress = data["manualProgress"]
    if "targetDate" in data:
        skill.target_date = data["targetDate"]
    if "updatedAt" in data:
        skill.updated_at = data["updatedAt"]

    # When notes/pages/subtopics are updated, sync directly into `pages` and `notes` tables
    if "subtopics" in data:
        skill.subtopics = data["subtopics"]
        _sync_skill_pages_and_notes(skill.id, user.id, data["subtopics"])
    elif "pages" in data:
        _sync_skill_pages_and_notes(skill.id, user.id, data["pages"])

    db.session.commit()
    return jsonify({"skill": skill.to_dict()}), 200


@skill_bp.route("/<string:skill_id>", methods=["DELETE"])
def delete_skill(skill_id):
    user = _get_current_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401

    skill = Skill.query.filter_by(id=skill_id, user_id=user.id).first()
    if not skill:
        return jsonify({"error": "Skill workspace not found"}), 404

    # Cascade deletes all related pages and notes
    db.session.delete(skill)
    db.session.commit()
    return jsonify({"message": "Skill and associated pages/notes deleted successfully"}), 200


@skill_bp.route("/reset", methods=["POST"])
def reset_skills():
    user = _get_current_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401

    Skill.query.filter_by(user_id=user.id).delete()
    db.session.commit()

    skills = _seed_user_skills(user.id)
    return jsonify({"skills": [s.to_dict() for s in skills]}), 200


# ─── Dedicated Pages & Notes Endpoints ────────────────────────────────────────

@skill_bp.route("/<string:skill_id>/pages", methods=["GET"])
def get_skill_pages(skill_id):
    user = _get_current_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401

    pages = Page.query.filter_by(skill_id=skill_id, user_id=user.id).order_by(Page.order_index).all()
    return jsonify({"pages": [p.to_dict() for p in pages]}), 200


@skill_bp.route("/<string:skill_id>/pages", methods=["POST"])
def create_skill_page(skill_id):
    user = _get_current_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401

    skill = Skill.query.filter_by(id=skill_id, user_id=user.id).first()
    if not skill:
        return jsonify({"error": "Skill not found"}), 404

    data = request.get_json(silent=True) or {}
    page_id = data.get("id") or f"page_{int(time.time() * 1000)}"
    existing_count = Page.query.filter_by(skill_id=skill_id, user_id=user.id).count()

    page = Page(
        id=page_id,
        skill_id=skill_id,
        user_id=user.id,
        title=data.get("title", f"{existing_count + 1}. New Page"),
        emoji=data.get("emoji", "📄"),
        completed=bool(data.get("completed", False)),
        status=data.get("status", "in_progress"),
        order_index=data.get("orderIndex", existing_count),
    )
    db.session.add(page)

    note = Note(
        id=f"note_{page_id}",
        user_id=user.id,
        skill_id=skill_id,
        page_id=page_id,
        content=data.get("content", ""),
    )
    db.session.add(note)

    db.session.commit()
    return jsonify({"page": page.to_dict()}), 201


@skill_bp.route("/pages/<string:page_id>", methods=["PUT"])
def update_page(page_id):
    user = _get_current_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401

    page = Page.query.filter_by(id=page_id, user_id=user.id).first()
    if not page:
        return jsonify({"error": "Page not found"}), 404

    data = request.get_json(silent=True) or {}
    if "title" in data:
        page.title = data["title"].strip()
    if "emoji" in data:
        page.emoji = data["emoji"]
    if "completed" in data:
        page.completed = bool(data["completed"])
    if "status" in data:
        page.status = data["status"]
    if "orderIndex" in data:
        page.order_index = int(data["orderIndex"])
    page.updated_at = "Just now"

    if "content" in data:
        note = Note.query.filter_by(page_id=page_id, user_id=user.id).first()
        if note:
            note.content = data["content"]
            note.updated_at = "Just now"
        else:
            note = Note(
                id=f"note_{page_id}",
                user_id=user.id,
                skill_id=page.skill_id,
                page_id=page.id,
                content=data["content"],
            )
            db.session.add(note)

    db.session.commit()
    return jsonify({"page": page.to_dict()}), 200


@skill_bp.route("/pages/<string:page_id>", methods=["DELETE"])
def delete_page(page_id):
    user = _get_current_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401

    page = Page.query.filter_by(id=page_id, user_id=user.id).first()
    if not page:
        return jsonify({"error": "Page not found"}), 404

    db.session.delete(page)
    db.session.commit()
    return jsonify({"message": "Page and associated notes deleted successfully"}), 200


@skill_bp.route("/pages/<string:page_id>/notes", methods=["GET"])
def get_page_note(page_id):
    user = _get_current_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401

    note = Note.query.filter_by(page_id=page_id, user_id=user.id).first()
    if not note:
        return jsonify({"content": "", "note": None}), 200
    return jsonify({"note": note.to_dict(), "content": note.content}), 200


@skill_bp.route("/pages/<string:page_id>/notes", methods=["PUT"])
def update_page_note(page_id):
    user = _get_current_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401

    page = Page.query.filter_by(id=page_id, user_id=user.id).first()
    if not page:
        return jsonify({"error": "Page not found"}), 404

    data = request.get_json(silent=True) or {}
    content = data.get("content", "")

    note = Note.query.filter_by(page_id=page_id, user_id=user.id).first()
    if note:
        note.content = content
        note.updated_at = "Just now"
    else:
        note = Note(
            id=f"note_{page_id}",
            user_id=user.id,
            skill_id=page.skill_id,
            page_id=page_id,
            content=content,
        )
        db.session.add(note)

    page.updated_at = "Just now"
    db.session.commit()
    return jsonify({"note": note.to_dict()}), 200
