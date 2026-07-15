from __future__ import annotations

import json
import math
from datetime import datetime
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
import yfinance as yf

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware


# =========================================================
# CONFIGURATION
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

MODEL_DIR = BASE_DIR / "models"
MODEL_FILE = MODEL_DIR / "gold_return_model.joblib"
METADATA_FILE = MODEL_DIR / "model_metadata.json"

GOLD_TICKER = "GC=F"
RECENT_DATA_PERIOD = "1y"

DEFAULT_HISTORY_DAYS = 90
MAX_HISTORY_DAYS = 365


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="Muliya Gold Prediction Service",
    description=(
        "Experimental next-trading-day gold-price "
        "prediction and historical market-data service."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# GLOBAL MODEL STATE
# =========================================================

model_artifact: dict[str, Any] | None = None
model_metadata: dict[str, Any] = {}


# =========================================================
# MODEL LOADING
# =========================================================

def load_model_artifacts() -> None:
    global model_artifact
    global model_metadata

    if not MODEL_FILE.exists():
        model_artifact = None
        raise RuntimeError(
            f"Model file not found: {MODEL_FILE}"
        )

    loaded_artifact = joblib.load(MODEL_FILE)

    if not isinstance(loaded_artifact, dict):
        raise RuntimeError(
            "The saved model artifact is invalid."
        )

    if "model" not in loaded_artifact:
        raise RuntimeError(
            "The saved artifact does not contain a model."
        )

    if "featureColumns" not in loaded_artifact:
        raise RuntimeError(
            "The saved artifact does not contain feature columns."
        )

    model_artifact = loaded_artifact

    if METADATA_FILE.exists():
        with open(
            METADATA_FILE,
            "r",
            encoding="utf-8",
        ) as metadata_file:
            model_metadata = json.load(metadata_file)
    else:
        model_metadata = {}

    print(
        "Gold prediction model loaded:",
        model_artifact.get("modelName", "Unknown"),
    )


@app.on_event("startup")
def startup_event() -> None:
    try:
        load_model_artifacts()
    except Exception as error:
        print(
            f"Unable to load gold prediction model: {error}"
        )


# =========================================================
# MARKET DATA
# =========================================================

def download_recent_gold_data() -> pd.DataFrame:
    data = yf.download(
        GOLD_TICKER,
        period=RECENT_DATA_PERIOD,
        auto_adjust=False,
        progress=False,
    )

    if data.empty:
        raise RuntimeError(
            "Unable to download recent gold-price data."
        )

    if isinstance(data.columns, pd.MultiIndex):
        data.columns = data.columns.get_level_values(0)

    required_columns = {
        "Open",
        "High",
        "Low",
        "Close",
        "Volume",
    }

    missing_columns = required_columns.difference(
        data.columns
    )

    if missing_columns:
        raise RuntimeError(
            "Recent gold-price data is missing columns: "
            f"{sorted(missing_columns)}"
        )

    data = data[
        [
            "Open",
            "High",
            "Low",
            "Close",
            "Volume",
        ]
    ].copy()

    data.index = pd.to_datetime(data.index)
    data.sort_index(inplace=True)

    for column in data.columns:
        data[column] = pd.to_numeric(
            data[column],
            errors="coerce",
        )

    data.replace(
        [np.inf, -np.inf],
        np.nan,
        inplace=True,
    )

    data.dropna(
        subset=[
            "Open",
            "High",
            "Low",
            "Close",
        ],
        inplace=True,
    )

    return data


# =========================================================
# FEATURE ENGINEERING
# Must match train_model.py exactly
# =========================================================

def safe_divide(
    numerator: pd.Series,
    denominator: pd.Series,
) -> pd.Series:
    safe_denominator = denominator.replace(
        0,
        np.nan,
    )

    return numerator / safe_denominator


def create_prediction_features(
    raw_data: pd.DataFrame,
) -> pd.DataFrame:
    data = raw_data.copy()

    close = data["Close"]

    data["Return_1D"] = close.pct_change(1)
    data["Return_2D"] = close.pct_change(2)
    data["Return_3D"] = close.pct_change(3)
    data["Return_5D"] = close.pct_change(5)
    data["Return_10D"] = close.pct_change(10)

    data["Return_Lag_1"] = data[
        "Return_1D"
    ].shift(1)

    data["Return_Lag_2"] = data[
        "Return_1D"
    ].shift(2)

    data["Return_Lag_3"] = data[
        "Return_1D"
    ].shift(3)

    data["Return_Lag_5"] = data[
        "Return_1D"
    ].shift(5)

    data["Return_Lag_10"] = data[
        "Return_1D"
    ].shift(10)

    ma_5 = close.rolling(5).mean()
    ma_10 = close.rolling(10).mean()
    ma_20 = close.rolling(20).mean()
    ma_50 = close.rolling(50).mean()

    ema_10 = close.ewm(
        span=10,
        adjust=False,
    ).mean()

    ema_20 = close.ewm(
        span=20,
        adjust=False,
    ).mean()

    data["Close_MA5_Ratio"] = (
        safe_divide(close, ma_5) - 1
    )

    data["Close_MA10_Ratio"] = (
        safe_divide(close, ma_10) - 1
    )

    data["Close_MA20_Ratio"] = (
        safe_divide(close, ma_20) - 1
    )

    data["Close_MA50_Ratio"] = (
        safe_divide(close, ma_50) - 1
    )

    data["MA5_MA20_Ratio"] = (
        safe_divide(ma_5, ma_20) - 1
    )

    data["MA10_MA50_Ratio"] = (
        safe_divide(ma_10, ma_50) - 1
    )

    data["Close_EMA10_Ratio"] = (
        safe_divide(close, ema_10) - 1
    )

    data["Close_EMA20_Ratio"] = (
        safe_divide(close, ema_20) - 1
    )

    daily_return = close.pct_change()

    data["Volatility_5"] = (
        daily_return.rolling(5).std()
    )

    data["Volatility_10"] = (
        daily_return.rolling(10).std()
    )

    data["Volatility_20"] = (
        daily_return.rolling(20).std()
    )

    previous_close = close.shift(1)

    true_range = pd.concat(
        [
            data["High"] - data["Low"],
            (
                data["High"] - previous_close
            ).abs(),
            (
                data["Low"] - previous_close
            ).abs(),
        ],
        axis=1,
    ).max(axis=1)

    data["True_Range_Ratio"] = safe_divide(
        true_range,
        previous_close,
    )

    data["Open_Close_Return"] = safe_divide(
        data["Close"] - data["Open"],
        data["Open"],
    )

    data["High_Low_Range"] = safe_divide(
        data["High"] - data["Low"],
        data["Open"],
    )

    daily_range = (
        data["High"] - data["Low"]
    )

    data["Close_Position_In_Range"] = (
        safe_divide(
            data["Close"] - data["Low"],
            daily_range,
        )
    )

    volume = data["Volume"].replace(
        0,
        np.nan,
    )

    volume_ma_20 = volume.rolling(
        20
    ).mean()

    data["Volume_Change"] = (
        volume.pct_change()
    )

    data["Volume_MA20_Ratio"] = (
        safe_divide(
            volume,
            volume_ma_20,
        )
        - 1
    )

    data["Volume_Change"] = (
        data["Volume_Change"].fillna(0)
    )

    data["Volume_MA20_Ratio"] = (
        data["Volume_MA20_Ratio"].fillna(0)
    )

    data["Momentum_5"] = (
        safe_divide(
            close,
            close.shift(5),
        )
        - 1
    )

    data["Momentum_10"] = (
        safe_divide(
            close,
            close.shift(10),
        )
        - 1
    )

    data["DayOfWeek"] = data.index.dayofweek
    data["Month"] = data.index.month

    data.replace(
        [np.inf, -np.inf],
        np.nan,
        inplace=True,
    )

    return data


# =========================================================
# PREDICTION HELPERS
# =========================================================

def get_trend(
    predicted_simple_return: float,
    threshold: float,
) -> str:
    if predicted_simple_return > threshold:
        return "Up"

    if predicted_simple_return < -threshold:
        return "Down"

    return "Stable"


def calculate_price_range(
    current_price: float,
    predicted_log_return: float,
    lower_residual: float,
    upper_residual: float,
) -> dict[str, float]:
    lower_price = current_price * math.exp(
        predicted_log_return + lower_residual
    )

    upper_price = current_price * math.exp(
        predicted_log_return + upper_residual
    )

    return {
        "lower": round(
            float(lower_price),
            2,
        ),
        "upper": round(
            float(upper_price),
            2,
        ),
    }


def get_prediction_payload() -> dict[str, Any]:
    if model_artifact is None:
        raise RuntimeError(
            "The prediction model is not loaded."
        )

    recent_data = download_recent_gold_data()

    feature_data = create_prediction_features(
        recent_data
    )

    feature_columns = model_artifact[
        "featureColumns"
    ]

    usable_rows = feature_data.dropna(
        subset=feature_columns
    )

    if usable_rows.empty:
        raise RuntimeError(
            "Insufficient recent market data to create prediction features."
        )

    latest_row = usable_rows.iloc[-1]

    latest_date = usable_rows.index[-1]

    current_price = float(
        latest_row["Close"]
    )

    model_input = pd.DataFrame(
        [
            {
                feature: latest_row[feature]
                for feature in feature_columns
            }
        ]
    )

    model_input = model_input[
        feature_columns
    ]

    model = model_artifact["model"]

    predicted_log_return = float(
        model.predict(model_input)[0]
    )

    predicted_simple_return = (
        math.exp(predicted_log_return) - 1
    )

    predicted_price = (
        current_price
        * math.exp(predicted_log_return)
    )

    price_change = (
        predicted_price - current_price
    )

    percentage_change = (
        price_change / current_price
    ) * 100

    stable_threshold = float(
        model_artifact.get(
            "stableReturnThreshold",
            0.001,
        )
    )

    trend = get_trend(
        predicted_simple_return,
        stable_threshold,
    )

    residual_quantiles = model_artifact.get(
        "residualQuantiles",
        {},
    )

    range_80 = calculate_price_range(
        current_price=current_price,
        predicted_log_return=
            predicted_log_return,
        lower_residual=float(
            residual_quantiles.get(
                "lower80",
                -0.01,
            )
        ),
        upper_residual=float(
            residual_quantiles.get(
                "upper80",
                0.01,
            )
        ),
    )

    range_95 = calculate_price_range(
        current_price=current_price,
        predicted_log_return=
            predicted_log_return,
        lower_residual=float(
            residual_quantiles.get(
                "lower95",
                -0.02,
            )
        ),
        upper_residual=float(
            residual_quantiles.get(
                "upper95",
                0.02,
            )
        ),
    )

    reliability = model_metadata.get(
        "reliability",
        {
            "rating": "Experimental",
            "suitableForDisplay": True,
            "beatsNaiveBaseline": False,
            "returnMAEImprovementPercent": 0,
        },
    )

    prediction_date = (
        latest_date
        + pd.tseries.offsets.BDay(1)
    )

    return {
        "success": True,

        "ticker": GOLD_TICKER,

        "currency": "USD",

        "unit": "USD per troy ounce",

        "latestMarketDate": str(
            latest_date.date()
        ),

        "predictionDate": str(
            prediction_date.date()
        ),

        "currentPrice": round(
            current_price,
            2,
        ),

        "predictedPrice": round(
            float(predicted_price),
            2,
        ),

        "predictedChange": round(
            float(price_change),
            2,
        ),

        "predictedChangePercent": round(
            float(percentage_change),
            4,
        ),

        "predictedLogReturn": round(
            predicted_log_return,
            8,
        ),

        "trend": trend,

        "range80": range_80,

        "range95": range_95,

        "model": {
            "name": model_artifact.get(
                "modelName",
                "Unknown",
            ),

            "target":
                "Next trading-day logarithmic return",

            "reliability": reliability,

            "featureCount": len(
                feature_columns
            ),
        },

        "generatedAt":
            datetime.utcnow().isoformat()
            + "Z",

        "disclaimer": (
            model_metadata.get(
                "disclaimer"
            )
            or (
                "This is an experimental analytical estimate "
                "and not financial advice."
            )
        ),
    }


# =========================================================
# ROUTES
# =========================================================

@app.get("/")
def root() -> dict[str, Any]:
    return {
        "success": True,
        "message":
            "Muliya Gold Prediction service is running.",
        "modelLoaded":
            model_artifact is not None,
        "ticker": GOLD_TICKER,
    }


@app.get("/health")
def health_check() -> dict[str, Any]:
    return {
        "success": True,
        "status": "healthy",
        "modelLoaded":
            model_artifact is not None,
        "modelName": (
            model_artifact.get(
                "modelName",
                "",
            )
            if model_artifact
            else ""
        ),
        "featureCount": (
            len(
                model_artifact.get(
                    "featureColumns",
                    [],
                )
            )
            if model_artifact
            else 0
        ),
    }


@app.get("/prediction")
def get_prediction() -> dict[str, Any]:
    try:
        return get_prediction_payload()

    except Exception as error:
        print(
            f"Gold prediction error: {error}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to generate the gold-price prediction. "
                f"{error}"
            ),
        ) from error


@app.get("/history")
def get_history(
    days: int = DEFAULT_HISTORY_DAYS,
) -> dict[str, Any]:
    try:
        days = max(
            7,
            min(
                days,
                MAX_HISTORY_DAYS,
            ),
        )

        data = download_recent_gold_data()

        selected_data = data.tail(
            days
        )

        history = []

        for date, row in selected_data.iterrows():
            history.append(
                {
                    "date": str(
                        date.date()
                    ),
                    "open": round(
                        float(row["Open"]),
                        2,
                    ),
                    "high": round(
                        float(row["High"]),
                        2,
                    ),
                    "low": round(
                        float(row["Low"]),
                        2,
                    ),
                    "close": round(
                        float(row["Close"]),
                        2,
                    ),
                    "volume": int(
                        row["Volume"]
                    )
                    if not pd.isna(
                        row["Volume"]
                    )
                    else 0,
                }
            )

        return {
            "success": True,
            "ticker": GOLD_TICKER,
            "currency": "USD",
            "unit": "USD per troy ounce",
            "count": len(history),
            "history": history,
        }

    except Exception as error:
        print(
            f"Gold history error: {error}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to retrieve gold-price history."
            ),
        ) from error


@app.get("/model-info")
def get_model_info() -> dict[str, Any]:
    if model_artifact is None:
        raise HTTPException(
            status_code=503,
            detail=
                "The prediction model is not loaded.",
        )

    return {
        "success": True,
        "modelName": model_artifact.get(
            "modelName",
            "",
        ),
        "ticker": model_artifact.get(
            "ticker",
            GOLD_TICKER,
        ),
        "featureCount": len(
            model_artifact.get(
                "featureColumns",
                [],
            )
        ),
        "featureColumns":
            model_artifact.get(
                "featureColumns",
                [],
            ),
        "reliability":
            model_metadata.get(
                "reliability",
                {},
            ),
        "holdoutResults":
            model_metadata.get(
                "holdoutResults",
                {},
            ),
        "naiveBaseline":
            model_metadata.get(
                "naiveBaseline",
                {},
            ),
        "featureImportance":
            model_metadata.get(
                "featureImportance",
                [],
            ),
        "dataStartDate":
            model_metadata.get(
                "dataStartDate",
                "",
            ),
        "dataEndDate":
            model_metadata.get(
                "dataEndDate",
                "",
            ),
        "disclaimer":
            model_metadata.get(
                "disclaimer",
                "",
            ),
    }


@app.post("/reload-model")
def reload_model() -> dict[str, Any]:
    try:
        load_model_artifacts()

        return {
            "success": True,
            "message":
                "Gold prediction model reloaded.",
            "modelLoaded":
                model_artifact is not None,
            "modelName":
                model_artifact.get(
                    "modelName",
                    "",
                )
                if model_artifact
                else "",
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error


# =========================================================
# LOCAL SERVER
# =========================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
    )