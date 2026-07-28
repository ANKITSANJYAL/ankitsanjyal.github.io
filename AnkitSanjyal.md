<div align="center">
  <img src="https://media.giphy.com/media/M9gbBd9nbDrOTu1Mqx/giphy.gif" width="100"/>
  <h1>Ankit Sanjyal</h1>
  <p><strong>AI Safety &amp; Interpretability Researcher · Chain-of-Thought Monitoring · Model Internals · Multi-Agent Safety</strong></p>

  <a href="https://ankitsanjyal.github.io">
    <img src="https://img.shields.io/badge/Portfolio-12100E?style=for-the-badge&logo=github&logoColor=white" />
  </a>
  <a href="https://www.lesswrong.com/users/ankit-sanjyal">
    <img src="https://img.shields.io/badge/LessWrong-2B6E62?style=for-the-badge&logoColor=white" />
  </a>
  <a href="https://arxiv.org/search/?searchtype=all&query=Ankit+Sanjyal">
    <img src="https://img.shields.io/badge/arXiv-B31B1B?style=for-the-badge&logo=arxiv&logoColor=white" />
  </a>
  <a href="https://linkedin.com/in/ankit-sanjyal">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" />
  </a>
  <a href="mailto:asanjyal82@gmail.com">
    <img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" />
  </a>
</div>

---

### 🔬 About Me

I'm an interpretability and AI safety researcher (M.S. Data Science, Fordham University). The question I keep coming back to is: **when can we say a system's externalized computation is a reliable window into its actual decision process — and what breaks that reliability?**

Chain-of-thought monitoring is cheap, scalable, and increasingly treated as a first line of defence, but the behavioral results keep showing that written reasoning doesn't track the features actually driving outputs. I want the mechanistic layer beneath those results. The second half of the question is what happens when systems stop being one model and become many talking to each other — the trace becomes a delegation graph, inter-agent messages become a second externalized reasoning channel with their own faithfulness problem, and watching each agent stops adding up to watching the system.

My background runs through causal inference and hands-on interpretability work — extracting and causally intervening on internal representations — plus four arXiv preprints and a stretch building autonomous multi-agent systems. I completed [BlueDot Impact](https://bluedot.org/courses/technical-ai-safety)'s Technical AI Safety course and now work on interpretability research full-time.

📄 [Research statement](https://docs.google.com/document/d/1xhv7jW235QPCo-AbFjMcOLMQA-ElxxYzHf6HNmd3XEY/edit?usp=sharing) · [CV](https://docs.google.com/document/d/1iLOd3weF8ErrZbXsRrUp5AjiW-H7to-MsZ9Qjo1kETg/edit?usp=sharing)

---

### 🧭 Current Research

#### [Necessity Protects Chain-of-Thought Monitoring by Prevention, Not Disclosure](https://www.lesswrong.com/posts/4EvWpvFvHzmPvuiF5/necessity-protects-chain-of-thought-monitoring-by-prevention)
*LessWrong, July 2026 · [code &amp; data](https://github.com/ANKITSANJYAL/Cot_faithfulness)*

Injected misleading "authority" cues into 1,700 problems per model across Qwen3-4B, DeepSeek-R1-Distill-8B, and Gemma-3-4B, then scored every captured trace — by LLM judge and by hand — for whether the reasoning admitted the cue.

- Where reasoning is **computationally necessary** (GSM8K), capture is near-zero: **0.4% / 2.2% / 0.0%**
- Where it's **optional** (non-symbolic MMLU, CommonsenseQA), cues land on up to **41%** of problems
- All nine necessity-vs-propensity contrasts significant; largest *p* = 1.9 × 10⁻⁵
- Disclosure is **categorical, not a gradient**: two models disclose ~51% of the time, one disclosed **once in 489** captured traces

Necessity protects the monitoring bet by **prevention**, not disclosure — and the design is a null result by construction, since the intervention eliminates the very events you'd need to measure faithfulness.

---

### 📄 Publications

- **[Multimodal Emotion Recognition via Causal-Diffusion Bridge (Affect-Diff)](https://arxiv.org/abs/2605.08252)**
  NOTEARS-learned causal graph + β-VAE + stop-gradiented 1D DDPM prior for interpretable multimodal emotion recognition. Counterfactual sampling makes modality attribution explicit. 18% relative improvement over the strongest baseline on CMU-MOSEI, and the only system with non-trivial performance on minority emotion classes.

- **[Local Prompt Adaptation for Style-Controllable Diffusion](https://arxiv.org/abs/2507.20094)**
  Training-free method for injecting content and style tokens into diffusion U-Nets to improve layout and stylistic control.

- **[RectifiedHR: High-Resolution Diffusion via Energy Profiling and Adaptive Guidance](https://arxiv.org/abs/2507.09441)**
  Adaptive CFG schedules that stabilize diffusion sampling, improving sharpness and reducing guidance artifacts.

- **[Limitations of NeRF with Pre-trained Vision Features for Few-Shot 3D Reconstruction](https://arxiv.org/abs/2506.18208)**
  Systematic evaluation of DINO-enhanced NeRF, showing pre-trained features *degrade* few-shot performance.

---

### 🚀 Featured Projects

#### [CoT Faithfulness Under Necessity vs. Propensity](https://github.com/ANKITSANJYAL/Cot_faithfulness)
Full experimental pipeline for the study above: behavioral necessity measurement (CoT-on vs. CoT-suppressed), seeded deterministic cue injection, capture detection, three-layer faithfulness scoring (string-match → LLM judge → human validation), and statistics from scratch — two-sided Fisher's exact via exact integer hypergeometric, Wilson score intervals.

#### [Diffusion Detective](https://github.com/ANKITSANJYAL/Diffusion-Detective)
Interpretability tooling for a generative model: surfaces what the model attends to at each denoising step, steers it by injecting a concept vector mid-generation (**94% steering success rate**), and explains what changed in natural language. Extract → intervene → explain, the same primitives as activation steering and patchscopes.

#### [Affect-Diff](https://github.com/ANKITSANJYAL/Multimodal-Emotion-Recognition)
Causal-diffusion bridge for interpretable emotion recognition. PyTorch Lightning + DDP on SLURM, Hydra configs, W&B logging. Causal graph over modalities → the same question mechanistic interpretability asks about attention heads and MLP layers.

#### [No-Propagation Diffusion Transformer](https://github.com/ANKITSANJYAL/NoPropagation)
From-scratch reproduction and extension of Oxford's NoPropDT using layer-wise local denoising blocks — no backpropagation. **~99% MNIST, ~76% CIFAR-10.** The reproduction muscle interpretability research runs on.

<!-- NOTE: github.com/Fordham-EDM-Lab/MAESTRO returns 404 to anonymous visitors — the org
     is public but the repo isn't, so the old README link was dead. Pointing at the live
     deployment instead; swap back if/when the repo is made public. -->
#### [MAESTRO: AI Video Generation Platform](https://erdos.dsm.fordham.edu/)
Text-to-video lecture generation (script synthesis → TTS → FFmpeg rendering) with RAG-powered chatbots and professor/student apps. Live at Fordham University.

---

### 🔧 Technical Stack

**Languages**: Python, SQL, Bash
**Core ML**: PyTorch, PyTorch Lightning (DDP), Hugging Face Transformers, vLLM, Hydra, scikit-learn
**Interpretability & analysis**: activation extraction and patching, counterfactual ablation, linear probes, LLM-as-judge pipelines, causal inference (DML, NOTEARS), Fisher's exact / Wilson intervals
**Agents & tooling**: MCP, CrewAI, LangChain, RAG pipelines, FastAPI, Flask
**Infra**: SLURM, Docker, Weights & Biases, GitHub Actions, MongoDB, Neo4j

---

### 📊 GitHub Stats

<!-- NOTE (checked 2026-07-28): the public github-readme-stats.vercel.app instance is
     returning 503 DEPLOYMENT_PAUSED, so the two cards below currently render broken.
     Fix by deploying your own instance (fork github-readme-stats → deploy to Vercel →
     swap the hostname), or delete this section until the public instance is restored.
     The streak card below is on the maintained demolab domain and does work. -->
<div align="center">
  <img src="https://streak-stats.demolab.com/?user=ANKITSANJYAL&theme=radical" />
  <img src="https://github-readme-stats.vercel.app/api?username=ANKITSANJYAL&show_icons=true&theme=radical&count_private=true" />
  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=ANKITSANJYAL&layout=compact&theme=radical&langs_count=6" />
</div>

---

### 📫 Reach Out

I'm focused on AI safety and interpretability research and open to **collaboration, mentorship, and fellowship or research roles** in the area. Particularly interested in talking to anyone working on CoT faithfulness, activation-level probes for silent capture, or monitorability in multi-agent systems.

📧 [asanjyal82@gmail.com](mailto:asanjyal82@gmail.com) · 🌐 [ankitsanjyal.github.io](https://ankitsanjyal.github.io)

---
