import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


class AIConfigurationError(Exception):
    pass


class AIResponseError(Exception):
    pass


def generate_note_assistance(action, text, question="", note_title=""):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise AIConfigurationError("AI is not configured. Set OPENAI_API_KEY on the server.")

    prompts = {
        "ask": (
            "Answer the user's question about the provided note excerpt. "
            "Keep the answer clear and concise. If the excerpt does not contain "
            "enough information, say so instead of inventing details."
        ),
        "summarize": (
            "Summarize the provided note excerpt in a clear, concise way. "
            "Preserve its important facts and return only the summary."
        ),
        "concise": (
            "Rewrite the provided note excerpt to be more concise while "
            "preserving its important meaning and facts. Return only the rewritten text."
        ),
    }

    note_context = f"Note title: {note_title}\n" if note_title else ""
    user_content = f"{note_context}Note excerpt:\n{text}"
    if action == "ask":
        user_content = f"{user_content}\n\nQuestion: {question}"

    client = OpenAI(
        api_key=api_key,
        base_url=os.getenv("OPENAI_BASE_URL") or None,
    )
    response = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL") or "gpt-4o-mini",
        messages=[
            {"role": "system", "content": prompts[action]},
            {"role": "user", "content": user_content},
        ],
        temperature=0.3,
        max_tokens=700,
    )

    answer = response.choices[0].message.content if response.choices else None
    if not isinstance(answer, str) or not answer.strip():
        raise AIResponseError("The AI service returned an empty response.")

    return answer.strip()
