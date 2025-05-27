import logging
import hashlib
import os
from starlette.responses import FileResponse
from cataract_doc_study.actions.login import login_fn
from cataract_doc_study.actions.submit import submit_fn
from cataract_doc_study.actions.update_answer import update_answer_fn
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from cataract_doc_study.models.submit import SubmitModel
from cataract_doc_study.models.update_answer import IncomingUpdateModel

SURVEY_API_NAME = 'survery_apis'

survey_apis_router = APIRouter()
_logger = logging.getLogger(SURVEY_API_NAME)

@survey_apis_router.get("/")
async def index():
    curr_dir = os.path.dirname(os.path.abspath(__file__))
    ui_dir = os.path.join(curr_dir, "frontend_compiled")
    index_path = os.path.join(ui_dir, "index.html")
    return FileResponse(index_path)

@survey_apis_router.get("/login")
async def login(request: Request):
    """
    Route to handle the registration process.
    """
    # print("Received the request: ", request.query_params._dict)
    params = request.query_params._dict
    user_id = params.get("user_id")
    user_data = await login_fn(user_id)
    return JSONResponse(content=user_data.model_dump(), status_code=200)

@survey_apis_router.post("/update_answer")
async def update_answer(request: Request):
    """
    Route to handle the registration process.
    """
    # print("Received the request: ", request.query_params._dict)
    body = await request.json()
    update_request = IncomingUpdateModel(**body)
    print("Received the request: ", update_request)
    update_answer, e = await update_answer_fn(update_request)
    if e is not None:
        _logger.error(msg=f"Error: {e}")
        return JSONResponse(content={"message": str(e)}, status_code=500)
    return JSONResponse(content={"updated_answer": update_answer}, status_code=200)
    # return JSONResponse(content={"message": "received"}, status_code=200)

@survey_apis_router.post("/submit")
async def submit(request: Request):
    """
    Route to handle the registration process.
    """
    # print("Received the request: ", request.query_params._dict)
    body = await request.json()
    submit_request = SubmitModel(**body)
    status, e = await submit_fn(submit_request)
    if e is not None:
        _logger.error(msg=f"Error: {e}")
        return JSONResponse(content={"message": str(e)}, status_code=500)
    return JSONResponse(content=status, status_code=200)
    # return JSONResponse(content={"message": "received"}, status_code=200)

@survey_apis_router.get("/get_user")
async def get_user_questions(request: Request):
    params = params = request.query_params._dict
    user_id = params.get("user_id")
    user_data = await login_fn(user_id)
    return JSONResponse(content=user_data.model_dump(), status_code=200)

@survey_apis_router.get("/get_users")
async def get_users_questions():
    from cataract_doc_study.dependency_setup import user_client
    user_data = await user_client.afetch_all()
    return JSONResponse(content=user_data, status_code=200)

@survey_apis_router.get("/get_answer")
async def get_answer(request: Request):
    from cataract_doc_study.dependency_setup import survey_client
    params = params = request.query_params._dict
    user_id = params.get("user_id")
    question_id = params.get("question_id")
    condition_id = params.get("condition_id")
    key = hashlib.md5((user_id + question_id + condition_id).encode()).hexdigest()
    document = await survey_client.afetch({"_id": key})
    print("document: ", document)
    ans = SubmitModel(**(document.get("answer_data")))
    return JSONResponse(content=ans.model_dump(), status_code=200)
