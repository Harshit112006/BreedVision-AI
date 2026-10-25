# BreedVision
BreedVision is an AI-powered image recognition tool designed for Indian livestock management. It instantly identifies Indian cattle breeds (49 breeds; buffalo are not covered) from standard photos. The system aims to simplify livestock registration and reduce human error. It does not currently integrate with Bharat Pashudhan or any national database.
<img width="623" height="864" alt="image" src="https://github.com/user-attachments/assets/9bbb6425-e6ab-4080-9c5e-9430cc04dcb9" />

FastAPI will eventually be organized as:
<img width="975" height="1008" alt="image" src="https://github.com/user-attachments/assets/fbf2d506-fbec-4537-b2ce-5a5b9e6e9ba9" />


## Status and how to run

- **Model:** EfficientNet-B0 (last three blocks fine-tuned), 49 Indian cattle breeds. On 1,114 held-out test photos: **61.9% top-1, 83.0% top-3**; when it names a breed (about 1 photo in 4) it is right about 90% of the time. Details and limits: [docs/test-evaluation.md](docs/test-evaluation.md).
- **Cattle value:** an indicative rupee estimate for a cow (breed listing range + milk yield + pregnancy), not a market quote; sources and limits in [docs/price-reference.md](docs/price-reference.md).
- **Breed library:** all 49 breeds have a description, traits and cited sources (guide/journal summaries, not the full ICAR records): [docs/breed-descriptions.md](docs/breed-descriptions.md).
- **Not covered:** buffalo (none in the dataset); field photos have not been tested; no Bharat Pashudhan integration.
- **Run the demo:** [docs/demo-runbook.md](docs/demo-runbook.md). Talking points: [docs/demo-script.md](docs/demo-script.md).
- **Web app languages:** English, Hindi, Marathi, Tamil, Telugu (AI-written, not yet reviewed by native speakers): [docs/i18n.md](docs/i18n.md).
- **Other docs:** [docs/explained.md](docs/explained.md) (plain-language explanation), [docs/non-cattle-check.md](docs/non-cattle-check.md), [docs/explainability.md](docs/explainability.md), [docs/duplicate-detection.md](docs/duplicate-detection.md), [docs/supabase.md](docs/supabase.md) (accounts and cloud backup are built but switched off for now).
