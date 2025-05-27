from azure.identity import get_bearer_token_provider, DefaultAzureCredential
from cataract_doc_study.core.llm import AsyncLLamaIndexAzureOpenAILLM

token_provider = get_bearer_token_provider(
    DefaultAzureCredential(), "https://cognitiveservices.azure.com/.default"
)
llm_client = AsyncLLamaIndexAzureOpenAILLM(
    model="gpt-4o",
    deployment_name="gpt-4o",
    azure_endpoint="https://swasthyabot-oai-vision.openai.azure.com/",
    token_provider=token_provider,
    api_version="2023-03-15-preview",
)


from cataract_doc_study.core.database import AsyncAzureCosmosMongoDB, AsyncAzureCosmosMongoDBCollection
connection_string = 'mongodb+srv://mohja:Byoeb%4012@byoeb-mongodb-vcore.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000'
db_name = 'cataract_doc_study'
db_client = AsyncAzureCosmosMongoDB(connection_string, db_name)

survey_collection_name = 'internal_pilot_collection'
survey_collection = db_client.get_collection(survey_collection_name)
survey_client = AsyncAzureCosmosMongoDBCollection(survey_collection)

user_collection_name = 'internal_user_collection'
user_collection = db_client.get_collection(user_collection_name)
user_client = AsyncAzureCosmosMongoDBCollection(user_collection)