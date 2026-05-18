import base64
import io
import sys

import numpy as np
import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as T
from huggingface_hub import hf_hub_download
from PIL import Image

HF_REPO_ID = "sgupta7049/skiniq-efficientnet-b3"
HF_FILENAME = "skiniq_best.pth"

# Alphabetical ordering matches torchvision.datasets.ImageFolder default on HAM10000.
# Verify this matches your training dataset's class_to_idx before deploying.
CLASS_NAMES = ['akiec', 'bcc', 'bkl', 'df', 'mel', 'nv', 'vasc']

DISEASE_LABELS = {
    'akiec': 'Actinic Keratosis',
    'bcc':   'Basal Cell Carcinoma',
    'bkl':   'Benign Keratosis',
    'df':    'Dermatofibroma',
    'mel':   'Melanoma',
    'nv':    'Melanocytic Nevus',
    'vasc':  'Vascular Lesion',
}

CLINICAL_URGENCY_MAP = {
    'akiec': 'Moderate',
    'bcc':   'High',
    'bkl':   'Low',
    'df':    'Low',
    'mel':   'High',
    'nv':    'Low',
    'vasc':  'Low',
}

SKIN_ISSUES_MAP = {
    'akiec': ['Sun Damage', 'Rough Texture', 'Pre-cancerous Changes'],
    'bcc':   ['Lesion', 'Abnormal Growth', 'Sun Damage'],
    'bkl':   ['Pigmentation', 'Rough Texture', 'Age Spots'],
    'df':    ['Firm Bump', 'Fibrous Tissue'],
    'mel':   ['Irregular Pigmentation', 'Asymmetric Lesion', 'Skin Lesion'],
    'nv':    ['Moles', 'Pigmentation'],
    'vasc':  ['Redness', 'Vascular Changes'],
}

SKIN_TYPE_MAP = {
    'akiec': 'Sensitive',
    'bcc':   'Sensitive',
    'bkl':   'Normal',
    'df':    'Normal',
    'mel':   'Sensitive',
    'nv':    'Normal',
    'vasc':  'Sensitive',
}

PREPROCESS = T.Compose([
    T.Resize((224, 224)),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


def download_model() -> nn.Module:
    print(f'Downloading {HF_FILENAME} from {HF_REPO_ID}...', flush=True)
    try:
        model_path = hf_hub_download(
            repo_id=HF_REPO_ID,
            filename=HF_FILENAME,
        )
    except Exception as exc:
        print(f'ERROR: Failed to download model from HuggingFace: {exc}', file=sys.stderr)
        raise RuntimeError(f'Model download failed: {exc}')

    print(f'Model cached at {model_path}', flush=True)
    model = models.efficientnet_b3(weights=None)
    model.classifier[1] = nn.Linear(model.classifier[1].in_features, len(CLASS_NAMES))
    state_dict = torch.load(model_path, map_location='cpu', weights_only=True)
    model.load_state_dict(state_dict)
    model.eval()
    return model


def decode_image(image_data: str) -> Image.Image:
    # Strip data URL prefix ("data:image/jpeg;base64,") if present.
    # The frontend sends the full data URL, not raw base64.
    if ',' in image_data:
        image_data = image_data.split(',', 1)[1]
    return Image.open(io.BytesIO(base64.b64decode(image_data))).convert('RGB')


def estimate_skin_tone(image: Image.Image) -> str:
    arr = np.array(image.resize((64, 64)))
    h, w = arr.shape[:2]
    # Center crop to avoid background bias.
    center = arr[h // 4: 3 * h // 4, w // 4: 3 * w // 4]
    brightness = center.mean()
    if brightness > 200:
        return 'Fair'
    elif brightness > 160:
        return 'Light'
    elif brightness > 120:
        return 'Medium'
    elif brightness > 80:
        return 'Olive'
    return 'Deep'


def predict(model: nn.Module, image_data: str) -> dict:
    image = decode_image(image_data)
    tensor = PREPROCESS(image).unsqueeze(0)

    with torch.no_grad():
        logits = model(tensor)
        probs = torch.softmax(logits, dim=1)
        confidence, idx = probs.max(dim=1)

    cls = CLASS_NAMES[idx.item()]
    return {
        'skinType':    SKIN_TYPE_MAP[cls],
        'skinIssues':  SKIN_ISSUES_MAP[cls],
        'skinTone':    estimate_skin_tone(image),
        'disease':     DISEASE_LABELS[cls],
        'clinicalUrgency': CLINICAL_URGENCY_MAP[cls],
        'confidence':  round(confidence.item(), 4),
    }
