import os
import joblib
import pandas as pd
from pydantic import BaseModel, Field

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
FEATURE_ORDER = joblib.load(os.path.join(MODELS_DIR, "_feature_order.pkl"))

MODEL_SLUGS = ["lr", "rf", "xgboost"]
MODEL_LABELS = {
    "lr": "logistic_regression",
    "rf": "random_forest",
    "xgboost": "xgboost",
}

GEN2_TARGETS = ["chapter_I", "chapter_C", "composite"]
GEN3_TARGETS = ["chapter_I", "composite"]


def load_models(gen: str, targets: list[str]) -> dict:
    models = {}
    for slug in MODEL_SLUGS:
        models[slug] = {}
        for target in targets:
            path = os.path.join(MODELS_DIR, f"{gen}_{slug}_{target}.pkl")
            models[slug][target] = joblib.load(path)
    return models


gen2_models = load_models("gen2", GEN2_TARGETS)
gen3_models = load_models("gen3", GEN3_TARGETS)


class PredictRequest(BaseModel):
    father_dose: float = Field(..., description="Father aggregated dose (mGy)")
    mother_dose: float = Field(..., description="Mother aggregated dose (mGy)")
    sex: int = Field(..., description="1 = male, 0 = female")
    birth_year: int = Field(..., description="Year of birth")
    father_dose_available: int = Field(..., description="1 = father dose record exists, 0 = missing")
    mother_dose_available: int = Field(..., description="1 = mother dose record exists, 0 = missing")


def build_input(req: PredictRequest) -> pd.DataFrame:
    max_dose = max(req.father_dose, req.mother_dose)
    mean_dose = (req.father_dose + req.mother_dose) / 2.0
    row = {
        "father_aggregated_dose": req.father_dose,
        "mother_aggregated_dose": req.mother_dose,
        "max_parent_dose": max_dose,
        "mean_parent_dose": mean_dose,
        "sex_binary": float(req.sex),
        "birth_year": float(req.birth_year),
        "father_dose_available": float(req.father_dose_available),
        "mother_dose_available": float(req.mother_dose_available),
    }
    return pd.DataFrame([row])[FEATURE_ORDER]


def predict_all(models: dict, targets: list[str], X: pd.DataFrame) -> dict:
    result = {}
    for slug in MODEL_SLUGS:
        preds = {}
        for target in targets:
            proba = models[slug][target].predict_proba(X)[0, 1]
            preds[target] = round(float(proba), 4)
        result[MODEL_LABELS[slug]] = preds
    return result


def predict_gen2(req: PredictRequest) -> dict:
    return predict_all(gen2_models, GEN2_TARGETS, build_input(req))


def predict_gen3(req: PredictRequest) -> dict:
    return predict_all(gen3_models, GEN3_TARGETS, build_input(req))
