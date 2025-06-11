from pydantic import BaseModel
from typing import Any
from typing import List

class Question(BaseModel):
    question_id: str
    condition_id: int

class UserQuestionsModel(BaseModel):
    user_id: str
    section_order: List[int]
    questions_list: List[Question]
    progress_id: Any  # Assuming progress_id is a string, change the type if needed