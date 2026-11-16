from flask import Blueprint, current_app, jsonify, request, session
from openai import OpenAIError

from db.db import db
from llm.llm import (
    AIConfigurationError,
    AIResponseError,
    generate_note_assistance,
)
from models.users import User

ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")


@ai_bp.route("/note-assistant", methods=["POST"])
def note_assistant():
    user_id = session.get("user_id")
    if not user_id or not db.session.get(User, user_id):
        session.clear()
        return jsonify({"error": "Authentication required"}), 401

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "A JSON request body is required."}), 400

    action = data.get("action")
    text = data.get("text")
    question = data.get("question", "")
    note_title = data.get("noteTitle", "")

    if not isinstance(action, str) or action not in {"ask", "summarize", "concise"}:
        return jsonify({"error": "Choose a valid note AI action."}), 400
    if not isinstance(text, str) or not text.strip():
        return jsonify({"error": "Select a line of note text first."}), 400
    if len(text) > 8000:
        return jsonify({"error": "Select less text and try again."}), 413
    if action == "ask" and (
        not isinstance(question, str) or not question.strip()
    ):
        return jsonify({"error": "Enter a question about the selected line."}), 400
    if isinstance(question, str) and len(question) > 1000:
        return jsonify({"error": "Keep the question under 1,000 characters."}), 413
    if not isinstance(note_title, str):
        return jsonify({"error": "Note title must be text."}), 400

    try:
        answer = generate_note_assistance(
            action=action,
            text=text.strip(),
            question=question.strip() if isinstance(question, str) else "",
            note_title=note_title[:200],
        )
    except AIConfigurationError as error:
        return jsonify({"error": str(error)}), 503
    except AIResponseError as error:
        current_app.logger.error("Note assistant returned an invalid response: %s", error)
        return jsonify({"error": "The AI service returned an empty response."}), 502
    except OpenAIError:
        current_app.logger.exception("Note assistant request failed")
        return jsonify({"error": "The AI service request failed. Please try again."}), 502

    return jsonify({"answer": answer}), 200
