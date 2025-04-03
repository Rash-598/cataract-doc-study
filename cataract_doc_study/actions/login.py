from cataract_doc_study.models.load import UserQuestionsModel
async def login_fn(
    user_id: str,
) -> UserQuestionsModel:
    from cataract_doc_study.dependency_setup import user_client
    query = {
        "_id": user_id
    }
    user_question_set = await user_client.afetch(query)
    user_set = UserQuestionsModel(**user_question_set)
    return user_set
