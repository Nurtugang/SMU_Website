from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

import predictor
from predictor import PredictRequest
from i18n import TRANSLATIONS, SUPPORTED_LANGS, resolve_lang

app = FastAPI(docs_url=None, redoc_url=None)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365


def render(request: Request, name: str, lang_param: str | None):
    lang = resolve_lang(request, lang_param)
    response = templates.TemplateResponse(
        request=request,
        name=name,
        context={"lang": lang, "t": TRANSLATIONS[lang]},
    )
    if lang_param in SUPPORTED_LANGS:
        response.set_cookie("lang", lang, max_age=LANG_COOKIE_MAX_AGE)
    return response


@app.get("/", response_class=HTMLResponse)
async def index(request: Request, lang: str | None = None):
    return render(request, "index.html", lang)


@app.get("/results", response_class=HTMLResponse)
async def results(request: Request, lang: str | None = None):
    return render(request, "results.html", lang)


@app.get("/predict", response_class=HTMLResponse)
async def predict_page(request: Request, lang: str | None = None):
    return render(request, "predict.html", lang)


@app.post("/api/predict2")
async def api_predict_gen2(req: PredictRequest):
    return predictor.predict_gen2(req)


@app.post("/api/predict3")
async def api_predict_gen3(req: PredictRequest):
    return predictor.predict_gen3(req)
