import re
import asyncio
from cataract_doc_study.models.update_answer import IncomingUpdateModel, QuestionMetadata

system_prompt = """
<task_description> 

You are an assistant to a chatbot that helps answer queries of cataract surgery patients and their attendants. You are provided with one such query (query), the chatbot’s response to that query (response_chatbot), an ophthalmologist’s correction to response_chatbot (expert_feedback), and the ophthalmologist’s corrections to n previous versions of response_chatbot (expert_feedback_history). Your task is to appropriately edit response_chatbot by taking expert_feedback and expert_feedback_history into account, and generate the final edited response (response_edited). Follow the below instructions: 

</task_description>   

<instructions> 

1. You are provided with expert_feedback_history, which includes n previous turns (turn_1 through turn_n) of response_chatbot and corresponding expert_feedback.  expert_feedback may reference, reinforce, or even seek to undo previous feedback. **Use expert_feedback_history to understand the context and intent of the ophthalmologist’s correction**. 

2. response_edited should be **COMPLETELY GROUNDED** within **ONLY the provided query, response_chatbot, expert_feedback, and expert_feedback_history**. 

3. In case of conflicting information, rely on expert_feedback. 

4. response_edited must be **SUCCINCT** and to-the-point, but do **NOT** remove or unnecessarily edit any information from response_chatbot unless instructed by expert_feedback. 

5. response_edited must use **SIMPLE** terms without medical jargon or uncommon words.     

6. Output response_edited in XML format. Do **NOT** generate any other opening or closing explanations or code. Sample output: 

<output> 

<response_edited>Content of response_edited</response_edited> 

</output> 

</instructions> 
"""

template_user_promt = """
<query>{query}</query>\n<response_chatbot>{response_chatbot}</response_chatbot>\n<expert_feedback>{expert_feedback}</expert_feedback>\n 
<n>{n}</n> 
<expert_feedback_history> 
{feedback_history}
</expert_feedback_history>
"""

def create_feedback_history(update_info: IncomingUpdateModel):
    """
    Create a feedback history string from the update information.
    """
    feedback_history = ""
    if len(update_info.question_metadata.update_activities) == 0:
        return feedback_history, len(update_info.question_metadata.update_activities)
    for i, info in enumerate(update_info.question_metadata.update_activities):
        feedback_history += f"<turn_{i+1}><response_chatbot>{info.answer}</response_chatbot><expert_feedback>{info.feedback}</expert_feedback></turn_{i+1}>\n"
    return feedback_history, len(update_info.question_metadata.update_activities)

async def update_answer_fn(
    update_request: IncomingUpdateModel,
) -> str:
    """
    Update the answer to a question with the new information provided.
    """
    question = update_request.question_metadata.question
    answer = update_request.question_metadata.answer
    update_info = update_request.question_metadata.update_info
    feedback_history, n = create_feedback_history(update_request)
    print("length of feedback_history: ", n)
    print("feedback_history: ", feedback_history)

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
    ).replace(
        "{feedback_history}", feedback_history
    ).replace(
        "{n}", str(n)
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

async def main():
    update_info = IncomingUpdateModel(
        user_id="user123",
        question_metadata=QuestionMetadata(
            question_id="q1",
            question="Can I eat breakfast before the surgery?",
            answer="Before cataract surgery, you\u2019ll usually be asked not to eat or drink anything for at least 6 hours beforehand. This is to reduce the risk of complications from anesthesia. If your surgery is in the morning, you\u2019ll likely need to skip breakfast. However, some clinics allow small sips of water or clear fluids up to 2 hours before. Always follow the exact instructions your doctor or surgical team gives you\u2014they\u2019ll tell you what\u2019s safe for your specific case. If you\u2019re unsure, call the clinic to confirm.",
            update_info="breakfast can be done",
            update_activities=[]
        )
    )
    updated_answer, error = await update_answer_fn(update_info)
    print("Updated Answer: ", updated_answer)

if __name__ == "__main__":
    asyncio.run(main())