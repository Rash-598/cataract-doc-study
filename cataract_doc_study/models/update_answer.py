from typing import Optional
from pydantic import BaseModel

class QuestionMetadata(BaseModel):
    question_id: Optional[str] = None
    question: Optional[str] = None
    condition_id: Optional[int] = None
    update_info: Optional[str] = None
    answer: Optional[str] = None

class IncomingUpdateModel(BaseModel):
    user_id: Optional[str] = None
    question_metadata: Optional[QuestionMetadata] = None