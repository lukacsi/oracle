# A Magyar Jósda

**[oracle.gyoma.org](https://oracle.gyoma.org)** — a Hungarian proverb oracle. Ask any question, receive a random szólás vagy közmondás with its meaning.

## How it works

Type a question, click **Kérdezd a Jósdát**. The crystal orb shakes, then reveals a random Hungarian saying from a database of **12,679 entries** — each with its dictionary definition.

## Data source

Proverbs and meanings are extracted from:

> Bárdosi Vilmos – Kiss Gábor: *Magyar szólások, közmondások adatbázisa* (Tinta Könyvkiadó, 2012). 14,000 entries.

The extraction script parses the PDF's bold headwords and their definitions using PyMuPDF font analysis.

## Tech stack

- **Frontend**: vanilla HTML/CSS/JS (no framework, no build step)
- **Data**: `data/proverbs.json` — 1.3 MB, loaded client-side via `fetch()`
- **Container**: `nginxinc/nginx-unprivileged:alpine`
- **Deploy**: GitHub Actions → GHCR → ArgoCD (GitOps) → Kubernetes

## Project structure

```
oracle/
├── index.html          # page structure
├── css/style.css       # atmospheric dark/gold theme
├── js/app.js           # oracle logic (fetch, randomize, display)
├── data/proverbs.json  # 12,679 entries {proverb, meaning}
├── Dockerfile          # nginx static server
└── .github/workflows/docker.yml  # CI/CD pipeline
```

## CI/CD

Push to `main` triggers:
1. Docker image built → pushed to `ghcr.io/lukacsi/oracle:sha-<short>`
2. Image tag bumped in [`lukacsi/homelab`](https://github.com/lukacsi/homelab) `k8s/workload-apps/oracle/manifests/deployment.yaml`
3. ArgoCD auto-syncs (~3 min) → new pod rolls out

## License

MIT for the code. Proverb data is from the source cited above.
