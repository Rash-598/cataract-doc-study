from typing import Optional, List
from cataract_doc_study.models.submit import AnswerState
from pydantic import BaseModel

class QuestionMetadata(BaseModel):
    question_id: Optional[str] = None
    question: Optional[str] = None
    condition_id: Optional[int] = None
    answer: Optional[str] = None
    update_info: Optional[str] = None
    update_activities: Optional[List[AnswerState]] = []

class IncomingUpdateModel(BaseModel):
    user_id: Optional[str] = None
    question_metadata: Optional[QuestionMetadata] = None