import re
from cataract_doc_study.models.update_answer import IncomingUpdateModel

system_prompt = """
Update the answer to a question with the new information provided.
"""
async def update_answer_fn(
    update_request: IncomingUpdateModel,
) -> str:
    """
    Update the answer to a question with the new information provided.
    """
    question = update_request.question_metadata.question
    answer = update_request.question_metadata.answer
    update_info = update_request.question_metadata.update_info
    def extract_updated_answer(text):
        pattern = r"<BEGIN_UPDATE_ANSWER>(.*?)<END_UPDATE_ANSWER>"
        match = re.search(pattern, text, re.DOTALL)
        return match.group(1).strip() if match else None
    from cataract_doc_study.dependency_setup import llm_client
    user_prompt = f"""Here is the question: {question} asnwer: {answer} and the update information: {update_info}. Respond in following structure: <BEGIN_UPDATE_ANSWER> updated answer comes here <END_UPDATE_ANSWER>"""
    try:
        response, content = await llm_client.agenerate_response(
            [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
        )
        updated_answer = extract_updated_answer(content)
        return updated_answer, None
    except Exception as e:
        return None, e
    