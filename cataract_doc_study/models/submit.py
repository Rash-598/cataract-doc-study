from typing import Optional
from typing import List, Any
from pydantic import BaseModel, Field

class QuestionMetadata(BaseModel):
    question_id: Optional[str] = None
    condition_id: Optional[int] = None
    final_answer: Optional[str] = None  # Cannot be empty, but still optional
    duration: Optional[float] = None

class AnswerState(BaseModel):
    id: Optional[int] = None
    answer: Optional[str] = None

class ActivityTracker(BaseModel):
    action_type: Optional[str] = None
    timestamp: Optional[int] = None
    update_info: Optional[str] = None
    answer_states: Optional[List[AnswerState]] = Field([], title="AnswerState")  # Assuming it's a dictionary

class SubmitModel(BaseModel):
    user_id: Optional[str] = None
    question_metadata: Optional[QuestionMetadata] = None
    activity_tracker: Optional[List[ActivityTracker]] = Field([], title="ActivityTracker")  # Assuming it's a dictionary
    progress_id: Optional[Any] = None  # Assuming progress_id is a string, change the type if needed
    

