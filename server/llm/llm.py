import json
import os
import uuid

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


class AIConfigurationError(Exception):
    pass


class AIResponseError(Exception):
    pass


def _get_client():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise AIConfigurationError(
            "AI is not configured. Set OPENAI_API_KEY on the server."
        )

    return OpenAI(
        api_key=api_key,
        base_url=os.getenv("OPENAI_BASE_URL") or None,
    )


def _get_model():
    return os.getenv("OPENAI_MODEL") or "google.gemma-3-4b-it"


def generate_note_assistance(
    action, text, question="", note_title="", format_mode="blocks"
):
    prompts = {
        "ask": (
            "Answer the user's request using the note excerpt as context, not as "
            "the only allowed source. If the user asks to explain, introduce, add, "
            "or write about a topic that is missing from the note, use your general "
            "knowledge to provide the requested useful content; do not answer only "
            "that the note lacks information. Be accurate, clear, and appropriately "
            "detailed, and return the passage directly without prefacing it with "
            "a statement about what is or is not in the note."
        ),
        "summarize": (
            "Summarize the provided note excerpt in a clear, concise way. "
            "Preserve its important facts and return only the summary."
        ),
        "concise": (
            "Rewrite the provided note excerpt to be more concise while "
            "preserving its important meaning and facts. Return only the rewritten text."
        ),
        "edit": (
            "Improve the provided note excerpt for clarity, grammar, and flow "
            "while preserving the author's meaning and facts. Return only the "
            "edited passage."
        ),
        "insert": (
            "Write a concise, useful note passage based on the user's request. "
            "Use the existing note excerpt as context when provided. Return only "
            "the passage to insert."
        ),
    }
    if action not in prompts:
        raise AIResponseError("Choose a valid note AI action.")
    if not isinstance(format_mode, str) or format_mode not in {"inline", "blocks"}:
        raise AIResponseError("Choose a valid note formatting mode.")

    formatting_prompt = (
        "Return a valid HTML fragment using only inline tags: strong, em, u, "
        "code, span, and br. Do not output block tags, Markdown, code fences, "
        "or html/body wrappers. Use bold for key terms and code for commands "
        "or identifiers. Apply inline color or background-color only when "
        "helpful, using the note palette (#a5b4fc, #6ee7b7, #fcd34d)."
        if format_mode == "inline"
        else (
            "Return a valid, styled HTML fragment, not Markdown, and no html/body "
            "wrappers. Use only p, h1, h2, h3, h4, strong, em, u, br, hr, ul, ol, "
            "li, blockquote, pre, code, and span. Use h2 for the main heading, h3 "
            "for sections, lists for grouped points, blockquote for tips, and "
            "pre/code for commands or examples. Emphasize key terms with strong "
            "and code. When useful, color key terms with span inline styles using "
            "only #a5b4fc, #6ee7b7, or #fcd34d. Do not use classes, scripts, "
            "links, images, tables, or arbitrary attributes."
        )
    )

    note_context = f"Note title: {note_title}\n" if note_title else ""
    user_content = f"{note_context}Note excerpt:\n{text}"
    if action in {"ask", "insert"}:
        user_content = f"{user_content}\n\nRequest: {question}"

    response = _get_client().chat.completions.create(
        model=_get_model(),
        messages=[
            {
                "role": "system",
                "content": f"{prompts[action]}\n\n{formatting_prompt}",
            },
            {"role": "user", "content": user_content},
        ],
        temperature=0.3,
        max_tokens=700,
    )

    answer = response.choices[0].message.content if response.choices else None
    if not isinstance(answer, str) or not answer.strip():
        raise AIResponseError("The AI service returned an empty response.")

    return answer.strip()


def generate_note_quiz(text, note_title=""):
    response = _get_client().chat.completions.create(
        model=_get_model(),
        messages=[
            {
                "role": "system",
                "content": (
                    "Create a short quiz based only on the supplied study note. "
                    "Return one JSON object with a string title and a questions "
                    "array containing exactly 5 multiple-choice questions. Each "
                    "question must have a string prompt and exactly 4 distinct "
                    "string choices. Do not include answers, explanations, "
                    "Markdown, or code fences."
                ),
            },
            {
                "role": "user",
                "content": f"Note title: {note_title}\n\nStudy note:\n{text}",
            },
        ],
        temperature=0.3,
        max_tokens=1200,
    )

    answer = response.choices[0].message.content if response.choices else None
    if not isinstance(answer, str) or not answer.strip():
        raise AIResponseError("The AI service returned an empty quiz.")

    quiz_json = answer.strip()
    if quiz_json.startswith("```"):
        quiz_json = quiz_json[3:].strip()
        if quiz_json.lower().startswith("json"):
            quiz_json = quiz_json[4:].strip()
        if quiz_json.endswith("```"):
            quiz_json = quiz_json[:-3].strip()

    try:
        generated_quiz = json.loads(quiz_json)
    except json.JSONDecodeError as error:
        raise AIResponseError("The AI service returned an invalid quiz.") from error

    if not isinstance(generated_quiz, dict):
        raise AIResponseError("The AI service returned an invalid quiz.")

    title = generated_quiz.get("title")
    questions = generated_quiz.get("questions")
    if not isinstance(title, str) or not title.strip():
        raise AIResponseError("The AI service returned an invalid quiz title.")
    if not isinstance(questions, list) or len(questions) != 5:
        raise AIResponseError("The AI service returned an invalid quiz question list.")

    validated_questions = []
    for question in questions:
        if not isinstance(question, dict):
            raise AIResponseError("The AI service returned an invalid quiz question.")

        prompt = question.get("prompt")
        choices = question.get("choices")
        if (
            not isinstance(prompt, str)
            or not prompt.strip()
            or not isinstance(choices, list)
            or len(choices) != 4
            or any(not isinstance(choice, str) or not choice.strip() for choice in choices)
            or len({choice.strip().casefold() for choice in choices}) != 4
        ):
            raise AIResponseError("The AI service returned an invalid quiz question.")

        validated_questions.append({
            "id": f"question_{uuid.uuid4().hex}",
            "type": "mcq",
            "prompt": prompt.strip()[:1000],
            "choices": [choice.strip()[:300] for choice in choices],
        })

    return {
        "id": f"quiz_{uuid.uuid4().hex}",
        "title": title.strip()[:200],
        "duration": "5 min",
        "generated": True,
        "questions": validated_questions,
    }


def open_skill_roadmap_stream(skill_name, goal):
    return _get_client().chat.completions.create(
        model=_get_model(),
        messages=[
            {
                "role": "system",
                "content": (
                    "Create an ordered learning roadmap for the requested skill. "
                    "Return 48 to 60 modules (aim for 54), one complete JSON "
                    "object per line, "
                    'in the exact format {"title":"Module name"}. Do not use '
                    "markdown, code fences, numbering, or text outside those JSON "
                    "lines. Make the roadmap beginner-friendly and comprehensive, "
                    "moving from prerequisites through practical, goal-specific "
                    "projects. Split broad subjects into small, teachable concepts: "
                    "each module should cover one concept or a tightly related "
                    "skill, not bundle several large topics under one title. Avoid "
                    "duplicates, trivial one-line variations, and unrelated "
                    "advanced topics. Keep titles concrete and concise. Use the "
                    "roadmap to cover foundations, core concepts, practical "
                    "application of the skill, and a final project or deployment. "
                    "For programming goals, separately cover setup, syntax, "
                    "variables and types, operators, input/output, conditions, "
                    "for and while loops, collections, functions, modules and "
                    "packages, errors, files, object-oriented concepts, and testing. "
                    "For Python-to-backend goals, reserve a substantial final "
                    "portion for HTTP, Flask or another relevant framework, routing, "
                    "request/response handling, REST APIs, persistence, validation, "
                    "authentication, security, testing, and deployment. For other "
                    "skills, divide the roadmap among their own foundations, "
                    "important subskills, and goal-specific practice."
                ),
            },
            {
                "role": "user",
                "content": f"Skill: {skill_name}\nLearning goal: {goal}",
            },
        ],
        temperature=0.4,
        max_tokens=1400,
        stream=True,
    )


def iter_skill_roadmap_titles(response):
    buffer = ""
    yielded_titles = set()

    for chunk in response:
        if not chunk.choices:
            continue
        content = chunk.choices[0].delta.content
        if not isinstance(content, str):
            continue

        buffer += content
        while "\n" in buffer:
            line, buffer = buffer.split("\n", 1)
            title = _parse_roadmap_line(line)
            if title and title.casefold() not in yielded_titles:
                yielded_titles.add(title.casefold())
                yield title

    title = _parse_roadmap_line(buffer)
    if title and title.casefold() not in yielded_titles:
        yielded_titles.add(title.casefold())
        yield title

    if not yielded_titles:
        raise AIResponseError("The AI service returned no roadmap modules.")


def _parse_roadmap_line(line):
    line = line.strip()
    if not line or line in {"```", "```json"}:
        return None

    try:
        module = json.loads(line)
    except json.JSONDecodeError as error:
        raise AIResponseError("The AI service returned invalid roadmap JSON.") from error

    if not isinstance(module, dict):
        raise AIResponseError("Each roadmap JSON line must be an object.")

    title = module.get("title")
    if not isinstance(title, str) or not title.strip():
        raise AIResponseError("Each roadmap module must have a title.")

    title = title.strip()
    if len(title) > 255:
        raise AIResponseError("A roadmap module title exceeded 255 characters.")

    return title
