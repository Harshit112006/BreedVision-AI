"""Single-image inference for a Phase 2 checkpoint.

This is the reference implementation of the prediction path: the backend's ML
service (Phase 9) should call into this rather than re-deriving preprocessing,
so the model can never be served with a different transform than it was
trained with.

Usage:
    python ml/training/inference.py --run phase2-frozen-baseline__resnet50 \\
        --image path/to/animal.jpg
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from dataclasses import dataclass
from pathlib import Path

import torch
import torch.nn as nn
from PIL import Image

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from ml.training import data as data_mod  # noqa: E402
from ml.training import features as feat_mod  # noqa: E402
from ml.training import train as train_mod  # noqa: E402


@dataclass
class Candidate:
    breed: str
    probability: float


@dataclass
class PredictionOutput:
    top: Candidate
    candidates: list[Candidate]
    inference_ms: float
    model_version: str


class BreedPredictor:
    """Loads a checkpoint once and serves predictions.

    The backend must construct this at startup, never per request.
    """

    def __init__(self, checkpoint: Path, mean, std, device: str = "cpu"):
        ckpt = torch.load(checkpoint, map_location=device, weights_only=False)

        self.class_to_idx: dict[str, int] = ckpt["class_to_idx"]
        self.idx_to_class = {v: k for k, v in self.class_to_idx.items()}
        self.image_size: int = ckpt["image_size"]
        self.model_version = Path(checkpoint).stem

        self.backbone, dim = feat_mod.build_backbone(ckpt["backbone_timm_name"])
        self.backbone.eval().to(device)

        self.head = nn.Linear(dim, len(self.class_to_idx))
        self.head.load_state_dict(ckpt["head_state_dict"])
        self.head.eval().to(device)

        # Feature standardisation fitted on the training split. Applying the
        # wrong statistics silently degrades accuracy, so they travel with the
        # checkpoint rather than being recomputed.
        self.feature_mean = ckpt["feature_mean"].to(device)
        self.feature_std = ckpt["feature_std"].to(device)

        self.transform = data_mod.build_transform(self.image_size, mean, std)
        self.device = device

    @torch.inference_mode()
    def predict(self, image_path: str | Path, top_k: int = 5) -> PredictionOutput:
        with Image.open(image_path) as im:
            img = im.convert("RGB")
            img.load()

        x = self.transform(img).unsqueeze(0).to(self.device)

        t0 = time.perf_counter()
        feats = self.backbone(x)
        logits = self.head((feats - self.feature_mean) / self.feature_std)
        probs = torch.softmax(logits, dim=1)[0]
        elapsed_ms = (time.perf_counter() - t0) * 1000.0

        k = min(top_k, probs.numel())
        values, indices = torch.topk(probs, k)
        candidates = [
            Candidate(self.idx_to_class[int(i)], float(v))
            for v, i in zip(values, indices)
        ]
        return PredictionOutput(
            top=candidates[0],
            candidates=candidates,
            inference_ms=elapsed_ms,
            model_version=self.model_version,
        )


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--run", required=True, help="run id (checkpoint stem)")
    ap.add_argument("--image", required=True)
    ap.add_argument("--config", default=None)
    ap.add_argument("--top-k", type=int, default=5)
    args = ap.parse_args()

    cfg = train_mod.load_config(Path(args.config) if args.config else None)
    ckpt = Path(cfg["paths"]["runs"]) / f"{args.run}.pt"
    if not ckpt.is_file():
        print(f"ERROR: checkpoint not found: {ckpt}")
        return 2

    predictor = BreedPredictor(
        ckpt, cfg["preprocess"]["mean"], cfg["preprocess"]["std"])
    out = predictor.predict(args.image, top_k=args.top_k)

    print(json.dumps(
        {
            "model_version": out.model_version,
            "inference_ms": round(out.inference_ms, 1),
            "top": {"breed": out.top.breed,
                    "probability": round(out.top.probability, 4)},
            "candidates": [
                {"breed": c.breed, "probability": round(c.probability, 4)}
                for c in out.candidates
            ],
        },
        indent=2,
    ))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
