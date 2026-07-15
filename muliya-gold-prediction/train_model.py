from __future__ import annotations

import json
import math
import sys
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
import yfinance as yf

from sklearn.ensemble import (
    GradientBoostingRegressor,
    RandomForestRegressor,
)
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)
from sklearn.model_selection import TimeSeriesSplit


# =========================================================
# CONFIGURATION
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

MODEL_DIR = BASE_DIR / "models"
MODEL_FILE = MODEL_DIR / "gold_return_model.joblib"
METADATA_FILE = MODEL_DIR / "model_metadata.json"

DATA_DIR = BASE_DIR / "data"
DATA_FILE = DATA_DIR / "gold_historical_data.csv"
VALIDATION_FILE = DATA_DIR / "validation_predictions.csv"

GOLD_TICKER = "GC=F"
START_DATE = "2010-01-01"

RANDOM_STATE = 42
TEST_RATIO = 0.20
TIME_SERIES_SPLITS = 5

# Used only for directional classification.
# Changes smaller than this are treated as "Stable".
STABLE_RETURN_THRESHOLD = 0.001

# Prevent exceptional data points from dominating training.
RETURN_CLIP_LIMIT = 0.08

TARGET_COLUMN = "Target_Next_Log_Return"

FEATURE_COLUMNS = [
    # Returns
    "Return_1D",
    "Return_2D",
    "Return_3D",
    "Return_5D",
    "Return_10D",

    # Lagged returns
    "Return_Lag_1",
    "Return_Lag_2",
    "Return_Lag_3",
    "Return_Lag_5",
    "Return_Lag_10",

    # Trend
    "Close_MA5_Ratio",
    "Close_MA10_Ratio",
    "Close_MA20_Ratio",
    "Close_MA50_Ratio",
    "MA5_MA20_Ratio",
    "MA10_MA50_Ratio",
    "Close_EMA10_Ratio",
    "Close_EMA20_Ratio",

    # Volatility
    "Volatility_5",
    "Volatility_10",
    "Volatility_20",
    "True_Range_Ratio",

    # Intraday price information
    "Open_Close_Return",
    "High_Low_Range",
    "Close_Position_In_Range",

    # Volume
    "Volume_Change",
    "Volume_MA20_Ratio",

    # Momentum and calendar
    "Momentum_5",
    "Momentum_10",
    "DayOfWeek",
    "Month",
]


# =========================================================
# DATA DOWNLOAD
# =========================================================

def download_gold_data() -> pd.DataFrame:
    print("=" * 68)
    print("DOWNLOADING HISTORICAL GOLD PRICE DATA")
    print("=" * 68)

    print(f"Ticker: {GOLD_TICKER}")
    print(f"Start date: {START_DATE}")
    print()

    data = yf.download(
        GOLD_TICKER,
        start=START_DATE,
        auto_adjust=False,
        progress=False,
    )

    if data.empty:
        raise RuntimeError(
            "No historical gold-price data was downloaded."
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

    missing_columns = required_columns.difference(data.columns)

    if missing_columns:
        raise RuntimeError(
            "Downloaded data is missing required columns: "
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

    numeric_columns = [
        "Open",
        "High",
        "Low",
        "Close",
        "Volume",
    ]

    for column in numeric_columns:
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
        subset=["Open", "High", "Low", "Close"],
        inplace=True,
    )

    data = data[data["Close"] > 0].copy()

    DATA_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    data.to_csv(DATA_FILE)

    print(f"Downloaded rows: {len(data)}")
    print(f"First date: {data.index.min().date()}")
    print(f"Last date: {data.index.max().date()}")
    print(f"Dataset saved to: {DATA_FILE}")

    return data


# =========================================================
# FEATURE ENGINEERING
# =========================================================

def safe_divide(
    numerator: pd.Series,
    denominator: pd.Series,
) -> pd.Series:
    safe_denominator = denominator.replace(0, np.nan)

    return numerator / safe_denominator


def create_features(
    raw_data: pd.DataFrame,
) -> pd.DataFrame:
    print()
    print("=" * 68)
    print("CREATING RETURN-BASED FEATURES")
    print("=" * 68)

    data = raw_data.copy()

    close = data["Close"]

    # -----------------------------------------------------
    # RETURN FEATURES
    # -----------------------------------------------------

    data["Return_1D"] = close.pct_change(1)
    data["Return_2D"] = close.pct_change(2)
    data["Return_3D"] = close.pct_change(3)
    data["Return_5D"] = close.pct_change(5)
    data["Return_10D"] = close.pct_change(10)

    data["Return_Lag_1"] = data["Return_1D"].shift(1)
    data["Return_Lag_2"] = data["Return_1D"].shift(2)
    data["Return_Lag_3"] = data["Return_1D"].shift(3)
    data["Return_Lag_5"] = data["Return_1D"].shift(5)
    data["Return_Lag_10"] = data["Return_1D"].shift(10)

    # -----------------------------------------------------
    # MOVING AVERAGES AND TREND FEATURES
    # -----------------------------------------------------

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

    data["Close_MA5_Ratio"] = safe_divide(close, ma_5) - 1
    data["Close_MA10_Ratio"] = safe_divide(close, ma_10) - 1
    data["Close_MA20_Ratio"] = safe_divide(close, ma_20) - 1
    data["Close_MA50_Ratio"] = safe_divide(close, ma_50) - 1

    data["MA5_MA20_Ratio"] = safe_divide(ma_5, ma_20) - 1
    data["MA10_MA50_Ratio"] = safe_divide(ma_10, ma_50) - 1

    data["Close_EMA10_Ratio"] = safe_divide(close, ema_10) - 1
    data["Close_EMA20_Ratio"] = safe_divide(close, ema_20) - 1

    # -----------------------------------------------------
    # VOLATILITY FEATURES
    # -----------------------------------------------------

    daily_return = close.pct_change()

    data["Volatility_5"] = daily_return.rolling(5).std()
    data["Volatility_10"] = daily_return.rolling(10).std()
    data["Volatility_20"] = daily_return.rolling(20).std()

    previous_close = close.shift(1)

    true_range = pd.concat(
        [
            data["High"] - data["Low"],
            (data["High"] - previous_close).abs(),
            (data["Low"] - previous_close).abs(),
        ],
        axis=1,
    ).max(axis=1)

    data["True_Range_Ratio"] = safe_divide(
        true_range,
        previous_close,
    )

    # -----------------------------------------------------
    # INTRADAY FEATURES
    # -----------------------------------------------------

    data["Open_Close_Return"] = safe_divide(
        data["Close"] - data["Open"],
        data["Open"],
    )

    data["High_Low_Range"] = safe_divide(
        data["High"] - data["Low"],
        data["Open"],
    )

    daily_range = data["High"] - data["Low"]

    data["Close_Position_In_Range"] = safe_divide(
        data["Close"] - data["Low"],
        daily_range,
    )

    # -----------------------------------------------------
    # VOLUME FEATURES
    # -----------------------------------------------------

    volume = data["Volume"].replace(0, np.nan)
    volume_ma_20 = volume.rolling(20).mean()

    data["Volume_Change"] = volume.pct_change()
    data["Volume_MA20_Ratio"] = (
        safe_divide(volume, volume_ma_20) - 1
    )

    # Some futures rows may have missing or zero volume.
    data["Volume_Change"] = data["Volume_Change"].fillna(0)
    data["Volume_MA20_Ratio"] = (
        data["Volume_MA20_Ratio"].fillna(0)
    )

    # -----------------------------------------------------
    # MOMENTUM AND CALENDAR
    # -----------------------------------------------------

    data["Momentum_5"] = safe_divide(
        close,
        close.shift(5),
    ) - 1

    data["Momentum_10"] = safe_divide(
        close,
        close.shift(10),
    ) - 1

    data["DayOfWeek"] = data.index.dayofweek
    data["Month"] = data.index.month

    # -----------------------------------------------------
    # TARGET: NEXT-DAY LOG RETURN
    # -----------------------------------------------------

    next_close = close.shift(-1)

    data[TARGET_COLUMN] = np.log(
        next_close / close
    )

    data[TARGET_COLUMN] = data[TARGET_COLUMN].clip(
        lower=-RETURN_CLIP_LIMIT,
        upper=RETURN_CLIP_LIMIT,
    )

    data.replace(
        [np.inf, -np.inf],
        np.nan,
        inplace=True,
    )

    data.dropna(
        subset=FEATURE_COLUMNS + [TARGET_COLUMN],
        inplace=True,
    )

    print(f"Usable rows: {len(data)}")
    print(f"Feature count: {len(FEATURE_COLUMNS)}")
    print(
        "Target mean: "
        f"{data[TARGET_COLUMN].mean():.8f}"
    )
    print(
        "Target standard deviation: "
        f"{data[TARGET_COLUMN].std():.8f}"
    )

    return data


# =========================================================
# TIME-ORDERED HOLDOUT SPLIT
# =========================================================

def split_holdout_dataset(
    data: pd.DataFrame,
) -> tuple[
    pd.DataFrame,
    pd.DataFrame,
    pd.DataFrame,
    pd.DataFrame,
    pd.Series,
    pd.Series,
]:
    split_index = int(
        len(data) * (1 - TEST_RATIO)
    )

    train_data = data.iloc[:split_index].copy()
    test_data = data.iloc[split_index:].copy()

    if train_data.empty or test_data.empty:
        raise RuntimeError(
            "Training or holdout dataset is empty."
        )

    X_train = train_data[FEATURE_COLUMNS]
    y_train = train_data[TARGET_COLUMN]

    X_test = test_data[FEATURE_COLUMNS]
    y_test = test_data[TARGET_COLUMN]

    print()
    print("=" * 68)
    print("TIME-ORDERED HOLDOUT SPLIT")
    print("=" * 68)

    print(f"Training rows: {len(train_data)}")
    print(f"Holdout rows: {len(test_data)}")

    print(
        "Training period: "
        f"{train_data.index.min().date()} to "
        f"{train_data.index.max().date()}"
    )

    print(
        "Holdout period: "
        f"{test_data.index.min().date()} to "
        f"{test_data.index.max().date()}"
    )

    return (
        train_data,
        test_data,
        X_train,
        X_test,
        y_train,
        y_test,
    )


# =========================================================
# MODEL DEFINITIONS
# =========================================================

def create_candidate_models() -> dict[str, Any]:
    return {
        "RandomForest": RandomForestRegressor(
            n_estimators=500,
            max_depth=8,
            min_samples_split=20,
            min_samples_leaf=10,
            max_features=0.7,
            random_state=RANDOM_STATE,
            n_jobs=-1,
        ),

        "GradientBoosting": GradientBoostingRegressor(
            n_estimators=250,
            learning_rate=0.025,
            max_depth=2,
            min_samples_split=20,
            min_samples_leaf=10,
            subsample=0.8,
            loss="huber",
            random_state=RANDOM_STATE,
        ),
    }


# =========================================================
# METRIC HELPERS
# =========================================================

def return_to_price(
    current_price: np.ndarray,
    predicted_log_return: np.ndarray,
) -> np.ndarray:
    return current_price * np.exp(
        predicted_log_return
    )


def classify_direction(
    simple_returns: np.ndarray,
) -> np.ndarray:
    return np.where(
        simple_returns > STABLE_RETURN_THRESHOLD,
        1,
        np.where(
            simple_returns < -STABLE_RETURN_THRESHOLD,
            -1,
            0,
        ),
    )


def evaluate_predictions(
    current_prices: np.ndarray,
    actual_log_returns: np.ndarray,
    predicted_log_returns: np.ndarray,
) -> dict[str, Any]:
    actual_next_prices = return_to_price(
        current_prices,
        actual_log_returns,
    )

    predicted_next_prices = return_to_price(
        current_prices,
        predicted_log_returns,
    )

    actual_simple_returns = (
        np.exp(actual_log_returns) - 1
    )

    predicted_simple_returns = (
        np.exp(predicted_log_returns) - 1
    )

    actual_direction = classify_direction(
        actual_simple_returns
    )

    predicted_direction = classify_direction(
        predicted_simple_returns
    )

    return_mae = mean_absolute_error(
        actual_log_returns,
        predicted_log_returns,
    )

    return_rmse = math.sqrt(
        mean_squared_error(
            actual_log_returns,
            predicted_log_returns,
        )
    )

    return_r2 = r2_score(
        actual_log_returns,
        predicted_log_returns,
    )

    price_mae = mean_absolute_error(
        actual_next_prices,
        predicted_next_prices,
    )

    price_rmse = math.sqrt(
        mean_squared_error(
            actual_next_prices,
            predicted_next_prices,
        )
    )

    price_mape = float(
        np.mean(
            np.abs(
                (
                    actual_next_prices
                    - predicted_next_prices
                )
                / actual_next_prices
            )
        )
        * 100
    )

    directional_accuracy = float(
        np.mean(
            actual_direction == predicted_direction
        )
        * 100
    )

    non_stable_mask = actual_direction != 0

    if np.any(non_stable_mask):
        active_directional_accuracy = float(
            np.mean(
                actual_direction[non_stable_mask]
                == predicted_direction[non_stable_mask]
            )
            * 100
        )
    else:
        active_directional_accuracy = 0.0

    residuals = (
        actual_log_returns - predicted_log_returns
    )

    return {
        "returnMAE": float(return_mae),
        "returnRMSE": float(return_rmse),
        "returnR2": float(return_r2),
        "priceMAE": float(price_mae),
        "priceRMSE": float(price_rmse),
        "priceMAPE": float(price_mape),
        "directionalAccuracy": directional_accuracy,
        "activeDirectionalAccuracy":
            active_directional_accuracy,
        "residualStandardDeviation": float(
            np.std(residuals)
        ),
    }


# =========================================================
# WALK-FORWARD CROSS-VALIDATION
# =========================================================

def run_time_series_cross_validation(
    model_name: str,
    model_factory: Any,
    X: pd.DataFrame,
    y: pd.Series,
    current_prices: pd.Series,
) -> dict[str, Any]:
    splitter = TimeSeriesSplit(
        n_splits=TIME_SERIES_SPLITS
    )

    fold_metrics: list[dict[str, Any]] = []

    for fold_number, (
        train_indices,
        validation_indices,
    ) in enumerate(
        splitter.split(X),
        start=1,
    ):
        fold_model = model_factory()

        X_fold_train = X.iloc[train_indices]
        y_fold_train = y.iloc[train_indices]

        X_fold_validation = X.iloc[
            validation_indices
        ]

        y_fold_validation = y.iloc[
            validation_indices
        ]

        fold_model.fit(
            X_fold_train,
            y_fold_train,
        )

        predictions = fold_model.predict(
            X_fold_validation
        )

        metrics = evaluate_predictions(
            current_prices.iloc[
                validation_indices
            ].to_numpy(),
            y_fold_validation.to_numpy(),
            predictions,
        )

        metrics["fold"] = fold_number
        fold_metrics.append(metrics)

    average_metrics: dict[str, float] = {}

    metric_names = [
        "returnMAE",
        "returnRMSE",
        "returnR2",
        "priceMAE",
        "priceRMSE",
        "priceMAPE",
        "directionalAccuracy",
        "activeDirectionalAccuracy",
        "residualStandardDeviation",
    ]

    for metric_name in metric_names:
        average_metrics[metric_name] = float(
            np.mean(
                [
                    fold[metric_name]
                    for fold in fold_metrics
                ]
            )
        )

    print()
    print(
        f"{model_name} walk-forward validation:"
    )
    print(
        f"  Return MAE: "
        f"{average_metrics['returnMAE']:.6f}"
    )
    print(
        f"  Price MAE: "
        f"${average_metrics['priceMAE']:.2f}"
    )
    print(
        f"  Directional Accuracy: "
        f"{average_metrics['directionalAccuracy']:.2f}%"
    )

    return {
        "averageMetrics": average_metrics,
        "foldMetrics": fold_metrics,
    }


# =========================================================
# NAÏVE BASELINE
# =========================================================

def evaluate_naive_baseline(
    test_data: pd.DataFrame,
) -> dict[str, Any]:
    actual_returns = test_data[
        TARGET_COLUMN
    ].to_numpy()

    predicted_returns = np.zeros_like(
        actual_returns
    )

    current_prices = test_data[
        "Close"
    ].to_numpy()

    return evaluate_predictions(
        current_prices,
        actual_returns,
        predicted_returns,
    )


# =========================================================
# TRAIN AND COMPARE MODELS
# =========================================================

def train_and_compare_models(
    train_data: pd.DataFrame,
    test_data: pd.DataFrame,
    X_train: pd.DataFrame,
    X_test: pd.DataFrame,
    y_train: pd.Series,
    y_test: pd.Series,
) -> tuple[
    str,
    Any,
    dict[str, Any],
    dict[str, Any],
    dict[str, np.ndarray],
]:
    print()
    print("=" * 68)
    print("TRAINING AND COMPARING CANDIDATE MODELS")
    print("=" * 68)

    model_factories = {
        "RandomForest": lambda: create_candidate_models()[
            "RandomForest"
        ],
        "GradientBoosting": lambda: create_candidate_models()[
            "GradientBoosting"
        ],
    }

    cross_validation_results: dict[
        str,
        Any,
    ] = {}

    holdout_results: dict[str, Any] = {}
    holdout_predictions: dict[str, np.ndarray] = {}
    fitted_models: dict[str, Any] = {}

    for model_name, model_factory in (
        model_factories.items()
    ):
        cross_validation_results[
            model_name
        ] = run_time_series_cross_validation(
            model_name=model_name,
            model_factory=model_factory,
            X=X_train,
            y=y_train,
            current_prices=train_data["Close"],
        )

        model = model_factory()

        model.fit(
            X_train,
            y_train,
        )

        predictions = model.predict(
            X_test
        )

        metrics = evaluate_predictions(
            test_data["Close"].to_numpy(),
            y_test.to_numpy(),
            predictions,
        )

        fitted_models[model_name] = model
        holdout_results[model_name] = metrics
        holdout_predictions[model_name] = predictions

        print()
        print(f"{model_name} holdout performance:")
        print(
            f"  Return MAE: "
            f"{metrics['returnMAE']:.6f}"
        )
        print(
            f"  Return R²: "
            f"{metrics['returnR2']:.4f}"
        )
        print(
            f"  Price MAE: "
            f"${metrics['priceMAE']:.2f}"
        )
        print(
            f"  Price MAPE: "
            f"{metrics['priceMAPE']:.3f}%"
        )
        print(
            f"  Directional Accuracy: "
            f"{metrics['directionalAccuracy']:.2f}%"
        )

    baseline_metrics = evaluate_naive_baseline(
        test_data
    )

    print()
    print("Naïve zero-return baseline:")
    print(
        f"  Return MAE: "
        f"{baseline_metrics['returnMAE']:.6f}"
    )
    print(
        f"  Price MAE: "
        f"${baseline_metrics['priceMAE']:.2f}"
    )
    print(
        f"  Price MAPE: "
        f"{baseline_metrics['priceMAPE']:.3f}%"
    )
    print(
        f"  Directional Accuracy: "
        f"{baseline_metrics['directionalAccuracy']:.2f}%"
    )

    # Primary selection criterion: holdout return MAE.
    best_model_name = min(
        holdout_results,
        key=lambda name: holdout_results[name][
            "returnMAE"
        ],
    )

    best_model = fitted_models[best_model_name]

    return (
        best_model_name,
        best_model,
        holdout_results,
        {
            "crossValidation":
                cross_validation_results,
            "baseline": baseline_metrics,
        },
        holdout_predictions,
    )


# =========================================================
# RELIABILITY ASSESSMENT
# =========================================================

def assess_model_reliability(
    best_metrics: dict[str, Any],
    baseline_metrics: dict[str, Any],
) -> dict[str, Any]:
    baseline_return_mae = baseline_metrics[
        "returnMAE"
    ]

    model_return_mae = best_metrics[
        "returnMAE"
    ]

    if baseline_return_mae <= 0:
        improvement = 0.0
    else:
        improvement = (
            (
                baseline_return_mae
                - model_return_mae
            )
            / baseline_return_mae
            * 100
        )

    beats_baseline = (
        model_return_mae
        < baseline_return_mae
    )

    directional_accuracy = best_metrics[
        "directionalAccuracy"
    ]

    if (
        improvement >= 5
        and directional_accuracy >= 52
    ):
        rating = "Moderate"
        suitable_for_display = True
    elif beats_baseline:
        rating = "Experimental"
        suitable_for_display = True
    else:
        rating = "Weak"
        suitable_for_display = False

    return {
        "rating": rating,
        "beatsNaiveBaseline": beats_baseline,
        "returnMAEImprovementPercent": float(
            improvement
        ),
        "suitableForDisplay": suitable_for_display,
        "message": (
            "This remains an experimental analytical model. "
            "Short-term market prices are inherently uncertain."
        ),
    }


# =========================================================
# FEATURE IMPORTANCE
# =========================================================

def get_feature_importance(
    model: Any,
) -> list[dict[str, Any]]:
    if not hasattr(
        model,
        "feature_importances_",
    ):
        return []

    importances = pd.DataFrame(
        {
            "feature": FEATURE_COLUMNS,
            "importance":
                model.feature_importances_,
        }
    ).sort_values(
        "importance",
        ascending=False,
    )

    print()
    print("=" * 68)
    print("TOP FEATURE IMPORTANCE")
    print("=" * 68)

    for _, row in importances.head(12).iterrows():
        print(
            f"{row['feature']:<28} "
            f"{row['importance']:.8f}"
        )

    return [
        {
            "feature": str(row["feature"]),
            "importance": round(
                float(row["importance"]),
                10,
            ),
        }
        for _, row in importances.iterrows()
    ]


# =========================================================
# SAVE VALIDATION RESULTS
# =========================================================

def save_validation_predictions(
    test_data: pd.DataFrame,
    predictions: np.ndarray,
) -> None:
    output = pd.DataFrame(
        index=test_data.index
    )

    output["Current_Close"] = test_data[
        "Close"
    ]

    output["Actual_Log_Return"] = test_data[
        TARGET_COLUMN
    ]

    output["Predicted_Log_Return"] = predictions

    output["Actual_Next_Close"] = (
        output["Current_Close"]
        * np.exp(output["Actual_Log_Return"])
    )

    output["Predicted_Next_Close"] = (
        output["Current_Close"]
        * np.exp(output["Predicted_Log_Return"])
    )

    output["Absolute_Price_Error"] = (
        output["Actual_Next_Close"]
        - output["Predicted_Next_Close"]
    ).abs()

    output.to_csv(
        VALIDATION_FILE
    )


# =========================================================
# FINAL TRAINING AND SAVE
# =========================================================

def train_final_model(
    model_name: str,
    prepared_data: pd.DataFrame,
) -> Any:
    models = create_candidate_models()

    final_model = models[model_name]

    final_model.fit(
        prepared_data[FEATURE_COLUMNS],
        prepared_data[TARGET_COLUMN],
    )

    return final_model


def save_model_artifacts(
    final_model: Any,
    best_model_name: str,
    raw_data: pd.DataFrame,
    prepared_data: pd.DataFrame,
    train_data: pd.DataFrame,
    test_data: pd.DataFrame,
    holdout_results: dict[str, Any],
    validation_results: dict[str, Any],
    reliability: dict[str, Any],
    feature_importance: list[dict[str, Any]],
    best_predictions: np.ndarray,
) -> None:
    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    best_metrics = holdout_results[
        best_model_name
    ]

    actual_returns = test_data[
        TARGET_COLUMN
    ].to_numpy()

    residuals = (
        actual_returns - best_predictions
    )

    residual_quantiles = {
        "lower80": float(
            np.quantile(residuals, 0.10)
        ),
        "upper80": float(
            np.quantile(residuals, 0.90)
        ),
        "lower95": float(
            np.quantile(residuals, 0.025)
        ),
        "upper95": float(
            np.quantile(residuals, 0.975)
        ),
    }

    artifact = {
        "model": final_model,
        "modelName": best_model_name,
        "featureColumns": FEATURE_COLUMNS,
        "targetColumn": TARGET_COLUMN,
        "ticker": GOLD_TICKER,
        "stableReturnThreshold":
            STABLE_RETURN_THRESHOLD,
        "returnClipLimit":
            RETURN_CLIP_LIMIT,
        "residualQuantiles":
            residual_quantiles,
    }

    joblib.dump(
        artifact,
        MODEL_FILE,
    )

    metadata = {
        "modelType": best_model_name,
        "ticker": GOLD_TICKER,
        "currency": "USD",
        "unit": "USD per troy ounce",
        "predictionTarget":
            "Next trading-day logarithmic return",
        "predictionConversion": (
            "Predicted price = current close × "
            "exp(predicted logarithmic return)"
        ),
        "dataSource":
            "Yahoo Finance via yfinance",
        "dataStartDate": str(
            raw_data.index.min().date()
        ),
        "dataEndDate": str(
            raw_data.index.max().date()
        ),
        "rawRowCount": len(raw_data),
        "preparedRowCount":
            len(prepared_data),
        "trainingRowCount":
            len(train_data),
        "testingRowCount":
            len(test_data),
        "trainingStartDate": str(
            train_data.index.min().date()
        ),
        "trainingEndDate": str(
            train_data.index.max().date()
        ),
        "testingStartDate": str(
            test_data.index.min().date()
        ),
        "testingEndDate": str(
            test_data.index.max().date()
        ),
        "featureColumns": FEATURE_COLUMNS,
        "holdoutResults":
            holdout_results,
        "crossValidationResults":
            validation_results[
                "crossValidation"
            ],
        "naiveBaseline":
            validation_results["baseline"],
        "reliability": reliability,
        "residualQuantiles":
            residual_quantiles,
        "featureImportance":
            feature_importance,
        "disclaimer": (
            "This model is an educational analytical "
            "prototype. Gold prices are affected by market, "
            "currency, geopolitical, interest-rate and liquidity "
            "conditions that cannot be predicted reliably from "
            "historical prices alone. This is not financial advice."
        ),
    }

    with open(
        METADATA_FILE,
        "w",
        encoding="utf-8",
    ) as metadata_file:
        json.dump(
            metadata,
            metadata_file,
            indent=2,
            ensure_ascii=False,
        )

    save_validation_predictions(
        test_data,
        best_predictions,
    )

    print()
    print("=" * 68)
    print("MODEL ARTIFACTS SAVED")
    print("=" * 68)

    print(f"Model: {MODEL_FILE}")
    print(f"Metadata: {METADATA_FILE}")
    print(
        "Validation predictions: "
        f"{VALIDATION_FILE}"
    )


# =========================================================
# MAIN
# =========================================================

def main() -> None:
    try:
        raw_data = download_gold_data()

        prepared_data = create_features(
            raw_data
        )

        (
            train_data,
            test_data,
            X_train,
            X_test,
            y_train,
            y_test,
        ) = split_holdout_dataset(
            prepared_data
        )

        (
            best_model_name,
            best_holdout_model,
            holdout_results,
            validation_results,
            holdout_predictions,
        ) = train_and_compare_models(
            train_data=train_data,
            test_data=test_data,
            X_train=X_train,
            X_test=X_test,
            y_train=y_train,
            y_test=y_test,
        )

        best_metrics = holdout_results[
            best_model_name
        ]

        reliability = assess_model_reliability(
            best_metrics=best_metrics,
            baseline_metrics=validation_results[
                "baseline"
            ],
        )

        print()
        print("=" * 68)
        print("MODEL SELECTION")
        print("=" * 68)

        print(
            f"Selected model: {best_model_name}"
        )

        print(
            "Baseline improvement: "
            f"{reliability['returnMAEImprovementPercent']:.2f}%"
        )

        print(
            "Beats naïve baseline: "
            f"{reliability['beatsNaiveBaseline']}"
        )

        print(
            "Reliability rating: "
            f"{reliability['rating']}"
        )

        print(
            "Suitable for customer-facing display: "
            f"{reliability['suitableForDisplay']}"
        )

        feature_importance = (
            get_feature_importance(
                best_holdout_model
            )
        )

        final_model = train_final_model(
            model_name=best_model_name,
            prepared_data=prepared_data,
        )

        save_model_artifacts(
            final_model=final_model,
            best_model_name=
                best_model_name,
            raw_data=raw_data,
            prepared_data=prepared_data,
            train_data=train_data,
            test_data=test_data,
            holdout_results=
                holdout_results,
            validation_results=
                validation_results,
            reliability=reliability,
            feature_importance=
                feature_importance,
            best_predictions=
                holdout_predictions[
                    best_model_name
                ],
        )

        print()
        print("=" * 68)
        print("RETURN-BASED GOLD MODEL TRAINING COMPLETE")
        print("=" * 68)

        print(
            "Review the reliability and baseline comparison "
            "before building the customer-facing prediction page."
        )

    except Exception as error:
        print()
        print("=" * 68)
        print("MODEL TRAINING FAILED")
        print("=" * 68)

        print(error)

        sys.exit(1)


if __name__ == "__main__":
    main()