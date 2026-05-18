import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from model import download_model, predict


class PredictRequest(BaseModel):
    image: str


class PredictResponse(BaseModel):
    skinType: str
    skinIssues: list[str]
    skinTone: str
    disease: str
    clinicalUrgency: str
    confidence: float


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        app.state.model = download_model()
    except RuntimeError as exc:
        print(f'ERROR: {exc}', file=sys.stderr)
        raise
    yield


app = FastAPI(title='SkinIQ ML Backend', lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['GET', 'POST'],
    allow_headers=['*'],
)


@app.get('/health')
def health():
    return {'status': 'ok'}


@app.post('/predict', response_model=PredictResponse)
def predict_endpoint(body: PredictRequest):
    try:
        return predict(app.state.model, body.image)
    except (ValueError, OSError) as exc:
        raise HTTPException(status_code=422, detail=f'Invalid image data: {exc}')
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Inference error: {exc}')
