import hashlib
from cataract_doc_study.models.submit import SubmitModel
from datetime import datetime, timezone

async def submit_fn(submit_model: SubmitModel) -> bool:
    """
    Submit the current document to the server.
    """
    from cataract_doc_study.dependency_setup import survey_client, user_client

    str_concat = submit_model.user_id + submit_model.question_metadata.question_id + str(submit_model.question_metadata.condition_id)
    key = hashlib.md5(str_concat.encode()).hexdigest()
    json_data = [{
        "_id": key,
        "answer_data": submit_model.model_dump(),
        "timestamp": str(int(datetime.now(timezone.utc).timestamp()))
    }]
    print("json_data: ", json_data)
    user_id = submit_model.user_id
    next_progress_id = int(submit_model.progress_id) + 1
    query = [({"_id": user_id}, {"$set": {"progress_id": next_progress_id}})]
    try:
        await survey_client.ainsert(json_data)
        await user_client.aupdate(bulk_queries=query)
        return True, None
    except Exception as e:
        return False, e
        