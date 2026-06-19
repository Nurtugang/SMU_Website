from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

import predictor
from predictor import PredictRequest

app = FastAPI(docs_url=None, redoc_url=None)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")


@app.get("/results", response_class=HTMLResponse)
async def results(request: Request):
    return templates.TemplateResponse(request=request, name="results.html")


@app.get("/predict", response_class=HTMLResponse)
async def predict_page(request: Request):
    return templates.TemplateResponse(request=request, name="predict.html")


@app.post("/api/predict2")
async def api_predict_gen2(req: PredictRequest):
    return predictor.predict_gen2(req)


@app.post("/api/predict3")
async def api_predict_gen3(req: PredictRequest):
    return predictor.predict_gen3(req)
