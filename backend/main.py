import os
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from model import load_model, predict


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
    model_path = os.environ.get('MODEL_PATH')
    if not model_path:
        print('ERROR: MODEL_PATH environment variable is not set.', file=sys.stderr)
        raise RuntimeError('MODEL_PATH is required')
    if not os.path.isfile(model_path):
        print(f'ERROR: Model file not found at {model_path}', file=sys.stderr)
        raise RuntimeError(f'Model file not found: {model_path}')

    app.state.model = load_model(model_path)
    print(f'Model loaded from {model_path}', flush=True)
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
