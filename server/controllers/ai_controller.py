from flask import Blueprint, current_app, jsonify, request
from openai import OpenAIError

from llm.llm import (
    AIConfigurationError,
    AIResponseError,
    generate_note_assistance,
    generate_note_quiz,
)
from middleware.isuserauthenticated import login_required

ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")


@ai_bp.route("/note-assistant", methods=["POST"])
@login_required
def note_assistant():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "A JSON request body is required."}), 400

    action = data.get("action")
    text = data.get("text")
    question = data.get("question", "")
    note_title = data.get("noteTitle", "")
    format_mode = data.get("format", "blocks")

    if not isinstance(action, str) or action not in {
        "ask",
        "summarize",
        "concise",
        "edit",
        "insert",
    }:
        return jsonify({"error": "Choose a valid note AI action."}), 400
    if not isinstance(text, str):
        return jsonify({"error": "Note text must be text."}), 400
    if action in {"summarize", "concise", "edit"} and not text.strip():
        return jsonify({"error": "Select a line of note text first."}), 400
    if len(text) > 8000:
        return jsonify({"error": "Select less text and try again."}), 413
    if action in {"ask", "insert"} and (
        not isinstance(question, str) or not question.strip()
    ):
        message = (
            "Describe what you want to add at the cursor."
            if action == "insert"
            else "Enter a question about the selected line."
        )
        return jsonify({"error": message}), 400
    if isinstance(question, str) and len(question) > 1000:
        return jsonify({"error": "Keep the question under 1,000 characters."}), 413
    if not isinstance(note_title, str):
        return jsonify({"error": "Note title must be text."}), 400
    if not isinstance(format_mode, str) or format_mode not in {"inline", "blocks"}:
        return jsonify({"error": "Choose a valid note formatting mode."}), 400

    try:
        answer = generate_note_assistance(
            action=action,
            text=text.strip(),
            question=question.strip() if isinstance(question, str) else "",
            note_title=note_title[:200],
            format_mode=format_mode,
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


@ai_bp.route("/generate-quiz", methods=["POST"])
@login_required
def generate_quiz():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "A JSON request body is required."}), 400

    text = data.get("text")
    note_title = data.get("noteTitle", "")
    if not isinstance(text, str) or not text.strip():
        return jsonify({"error": "Add note content before generating a quiz."}), 400
    if len(text) > 8000:
        return jsonify({"error": "This note is too long to generate a quiz."}), 413
    if not isinstance(note_title, str):
        return jsonify({"error": "Note title must be text."}), 400

    try:
        quiz = generate_note_quiz(
            text=text.strip(),
            note_title=note_title.strip()[:200],
        )
    except AIConfigurationError as error:
        return jsonify({"error": str(error)}), 503
    except AIResponseError as error:
        current_app.logger.error("Quiz generation returned an invalid response: %s", error)
        return jsonify({"error": "The AI service could not create a valid quiz. Please try again."}), 502
    except OpenAIError:
        current_app.logger.exception("Quiz generation request failed")
        return jsonify({"error": "The AI service request failed. Please try again."}), 502

    return jsonify({"quiz": quiz}), 200
