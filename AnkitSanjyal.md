<div align="center">
  <h1>Ankit Sanjyal</h1>
  <p><strong>ML and data engineer in Kathmandu</strong><br>
  Data pipelines · LLM and RAG systems · machine learning that is measured before it ships</p>

  <a href="https://ankitsanjyal.github.io"><img src="https://img.shields.io/badge/Portfolio-12100E?style=for-the-badge&logo=github&logoColor=white" /></a>
  <a href="https://huggingface.co/AnkitSanjyal"><img src="https://img.shields.io/badge/Hugging%20Face-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black" /></a>
  <a href="https://linkedin.com/in/ankit-sanjyal"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" /></a>
  <a href="mailto:asanjyal82@gmail.com"><img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" /></a>
  <a href="https://arxiv.org/search/?searchtype=all&query=Ankit+Sanjyal"><img src="https://img.shields.io/badge/arXiv-B31B1B?style=for-the-badge&logo=arxiv&logoColor=white" /></a>
</div>

---

### About

I build data pipelines, LLM and RAG systems, and machine learning models, and I measure whether they work before I call them done.

- **Industry:** a year and a half as a data consultant at Decision Foundry, building dbt pipelines into Amazon Redshift, tuning SQL on 1 TB+ tables (40% faster retrieval), and shipping 25+ client dashboards.
- **Production:** led MAESTRO at Fordham, an AI lecture generation system now running in production for university courses.
- **Education:** M.S. Data Science, Fordham University (May 2026). Four arXiv preprints and a published LLM evaluation study along the way.

Back in Kathmandu and looking for **ML engineer, AI engineer, data scientist and data engineer** roles.

[Portfolio](https://ankitsanjyal.github.io) · [CV](https://docs.google.com/document/d/1iLOd3weF8ErrZbXsRrUp5AjiW-H7to-MsZ9Qjo1kETg/edit?usp=sharing)

---

### Data engineering

**[nepse-pipeline](https://github.com/ANKITSANJYAL/nepse-pipeline)** · Python, DuckDB, Parquet, Pydantic, GitHub Actions, Hugging Face
Captures every Nepal Stock Exchange session after the close, validates it at each layer boundary, and publishes it as a [public dataset](https://huggingface.co/datasets/AnkitSanjyal/nepse-market-data): 330,978 floorsheet contracts and 93,859 daily price rows so far. Every API constraint was measured against the live endpoint, because the floorsheet is only served for the current session and a missed day is gone for good.

**[filing-agent](https://github.com/ANKITSANJYAL/filing-agent)** (data layer) · Python, Postgres, pgvector
Ingests 64 SEC filings, reducing 231 MB of markup to 17 MB of clean text and 9,449 table-safe chunks, with 2,010 resolved XBRL facts and 127 passing tests. Every ingest boundary asserts completeness as well as correctness, after the corpus turned up five silent data errors.

**[Big-Data](https://github.com/ANKITSANJYAL/Big-Data)** · PySpark, Spark ML, Hadoop HDFS
Four Spark ML pipelines submitted to a three-node Hadoop and Spark cluster.

### ML engineering

**[DocGuard and CareerMatch](https://github.com/ANKITSANJYAL/AI-ATS-Detector)** · FastAPI, Next.js, PostgreSQL, Redis, Docker, Nginx
Full-stack SaaS with a calibrated RoBERTa ensemble for sentence-level AI-text detection and ATS resume scoring. Async SQLAlchemy with Alembic migrations, Redis caching and rate limiting, Docker Compose, and unit, integration and contract tests in CI.

**[Affect-Diff](https://github.com/ANKITSANJYAL/Multimodal-Emotion-Recognition)** · PyTorch Lightning, DDP, SLURM, Hydra, W&B
Multi-GPU training on a SLURM cluster for multimodal emotion recognition: an 18% relative improvement over the strongest baseline on a heavily imbalanced dataset. [arXiv](https://arxiv.org/abs/2605.08252)

**[NoPropagation](https://github.com/ANKITSANJYAL/NoPropagation)** · PyTorch
A from-scratch implementation of a recent Oxford paper that trains without backpropagation: about 99% on MNIST and 76% on CIFAR-10.

### AI engineering

**[filing-agent](https://github.com/ANKITSANJYAL/filing-agent)** · LangGraph, pgvector, vLLM
An eval-first research agent over SEC filings. Numeric answers are graded by exact match against structured XBRL data, with no LLM judge in the loop, against a frozen 72-question benchmark.

**[MAESTRO](https://erdos.dsm.fordham.edu/)** · LangChain, OpenAI, FFmpeg, Flask, MongoDB
Turns a topic or document into a narrated video lecture with a RAG chatbot grounded in the transcript. In production at Fordham.

**[H-KFX](https://github.com/ANKITSANJYAL/MUGHackthon)** · GPT-4o, MCP, MongoDB vector search, Jira and GitHub APIs
An autonomous bug-fixing agent that goes from Jira ticket to tested pull request in 60 to 90 seconds. Won the MUG Hackathon 2025.

**[AutomatedBI](https://github.com/ANKITSANJYAL/AutomatedBI)** · CrewAI, Gemini, Flask, React, PostgreSQL
Four agents that turn an uploaded spreadsheet into a domain-aware KPI dashboard. It cut manual reporting time by about 80% in testing.

### Data science

**[CoT faithfulness study](https://github.com/ANKITSANJYAL/Cot_faithfulness)** · vLLM, Qwen3, DeepSeek-R1, Gemma-3
A controlled LLM evaluation over 1,700 problems per model across three model families, with seeded cue injection, LLM-judge and human scoring, and Fisher's exact tests and Wilson intervals written from scratch. All nine contrasts were significant (largest p = 1.9 × 10⁻⁵). [Write-up on LessWrong](https://www.lesswrong.com/posts/4EvWpvFvHzmPvuiF5/necessity-protects-chain-of-thought-monitoring-by-prevention)

**[NEPSE notebooks](https://github.com/ANKITSANJYAL/nepse-pipeline/tree/main/notebooks)** · pandas, DuckDB
Large broker positions repeat direction 71.8% of the time, 747 corporate actions were recovered from prices alone, and survivorship bias measures +0.74 points a year.

**[Causal factor discovery](https://github.com/ANKITSANJYAL/Causal-Factor-Discovery-in-S-P-500-Returns-)** · Double Machine Learning, scikit-learn
Estimates whether momentum causes next-day S&P 500 returns rather than merely correlating with them, with LSTM and random forest baselines.

---

### Stack

| | |
|---|---|
| **Languages** | Python, SQL, TypeScript, Bash |
| **Data** | PySpark, Hadoop, dbt, Amazon Redshift, DuckDB, Parquet, PostgreSQL, pgvector, MongoDB, Neo4j, Redis, Tableau |
| **ML** | PyTorch, PyTorch Lightning, Hugging Face Transformers and Diffusers, scikit-learn, vLLM |
| **LLM apps** | LangGraph, LangChain, CrewAI, MCP, RAG, LLM evaluation |
| **Serving and infra** | FastAPI, Flask, Docker, Nginx, GitHub Actions, SLURM, Weights & Biases, Hydra |

### Research

- [Multimodal Emotion Recognition via Causal-Diffusion Bridge](https://arxiv.org/abs/2605.08252) (2026)
- [RectifiedHR: High-Resolution Diffusion via Energy Profiling and Adaptive Guidance](https://arxiv.org/abs/2507.09441) (2025)
- [Local Prompt Adaptation for Style-Consistent Multi-Object Generation](https://arxiv.org/abs/2507.20094) (2025)
- [Limitations of NeRF with Pre-trained Vision Features for Few-Shot 3D Reconstruction](https://arxiv.org/abs/2506.18208) (2025)
- [Necessity Protects Chain-of-Thought Monitoring by Prevention, Not Disclosure](https://www.lesswrong.com/posts/4EvWpvFvHzmPvuiF5/necessity-protects-chain-of-thought-monitoring-by-prevention), LessWrong (2026)

Completed BlueDot Impact's Technical AI Safety course and project, and the ARENA curriculum. More on [LessWrong](https://www.lesswrong.com/users/ankit-sanjyal-1).

---

### Contact

Open to ML, AI and data roles in Kathmandu. [asanjyal82@gmail.com](mailto:asanjyal82@gmail.com) · [ankitsanjyal.github.io](https://ankitsanjyal.github.io)
