import logging
import logging.config
import os
import asyncio
import yaml
import uvicorn
from fastapi import FastAPI
from contextlib import asynccontextmanager
from cataract_doc_study.apis import survey_apis_router
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles

logger = logging.getLogger(__name__)
asyncio.get_event_loop().set_debug(True)
def create_app():
    """
    Creates and configures a FastAPI application.

    Returns:
        Flask: A configured FastAPI application instance.
    """
    curr_dir = os.path.dirname(os.path.abspath(__file__))
    ui_dir = os.path.join(curr_dir, "frontend_compiled")
    app = FastAPI()
    app.include_router(survey_apis_router)
    app.mount("/", StaticFiles(directory=ui_dir), name="ui")
    return app
app = create_app()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Issue with multiple workers in FastAPI
# https://github.com/encode/uvicorn/discussions/2450
if __name__ == '__main__':
    if os.getenv("APP_ENV") == "PROD":
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8000
        )
    else:
        uvicorn.run(
            app,
            host="127.0.0.1",
            port=5000
        )