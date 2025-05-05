import re
from cataract_doc_study.models.update_answer import IncomingUpdateModel

system_prompt = """
<task_description> 

You are an assistant to a chatbot that helps answer queries of cataract surgery patients and their attendants. You are provided with one such query (query), along with the chatbot’s response to that question (response_chatbot) and an ophthalmologist’s correction to that response (expert_feedback). Your task is to appropriately edit response_chatbot by taking expert_feedback into account, to generate the final edited response (response_edited). Follow the below instructions: 

</task_description>   

<instructions> 

1. response_edited should be **COMPLETELY GROUNDED** within **ONLY the provided query, response_chatbot, and expert_feedback**. 

2. In case of conflicting information, rely on expert_feedback. 

3. response_edited must be **SUCCINCT** and to-the-point, but do **NOT** remove or unnecessarily edit any information from response_chatbot unless instructed by expert_feedback. 

4. response_edited must use **SIMPLE** terms without medical jargon or uncommon words.     

5. Output response_edited in XML format. Do **NOT** generate any other opening or closing explanations or code. Sample output: 

<output> 

<response_edited>Content of response_edited</response_edited> 

</output> 

</instructions> 
"""

template_user_promt = """
<query>{query}</query>\n<response_chatbot>{response_chatbot}</response_chatbot>\n<expert_feedback>{expert_feedback}</expert_feedback> 
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
        pattern = r"<response_edited>(.*?)</response_edited>"
        match = re.search(pattern, text, re.DOTALL)
        return match.group(1).strip() if match else None
    from cataract_doc_study.dependency_setup import llm_client
    user_prompt = template_user_promt.replace(
        "{query}", question
    ).replace(
        "{response_chatbot}", answer
    ).replace(
        "{expert_feedback}", update_info
    )
    # user_prompt = f"""Here is the question: {question} asnwer: {answer} and the update information: {update_info}. Respond in following structure: <BEGIN_UPDATE_ANSWER> updated answer comes here <END_UPDATE_ANSWER>"""
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
    