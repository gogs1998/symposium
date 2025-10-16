# Symposium.ai - RAG Stack

> Have authentic conversations with history's greatest minds, grounded in their actual writings and ideas.

## 🎯 Project Overview

Symposium.ai is an educational platform where users can have deep, accurate conversations with historical figures. Unlike generic AI roleplay, each figure is powered by RAG (Retrieval-Augmented Generation) using their actual writings, papers, letters, and documented thinking patterns.

## 🏗️ Architecture

```
symposium-rag/
├── backend/              # FastAPI server
│   ├── api/             # API endpoints
│   ├── agents/          # Historical figure agents
│   ├── rag/             # RAG pipeline
│   └── models/          # Data models
├── ingestion/           # Data ingestion scripts
│   ├── chunkers/        # Text chunking utilities
│   ├── embedders/       # Embedding generation
│   └── sources/         # Raw source materials
├── frontend/            # React chat interface
├── vector-db/           # ChromaDB/Qdrant setup
└── docs/               # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker (optional, for vector DB)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run the server
python main.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Ingestion (Add Historical Figures)

```bash
cd ingestion
python ingest_figure.py --figure einstein --source-dir sources/einstein
```

## 📚 Adding a New Historical Figure

1. **Collect sources** - Add to `ingestion/sources/{figure_name}/`
2. **Run ingestion** - `python ingest_figure.py --figure {figure_name}`
3. **Create agent config** - Add to `backend/agents/{figure_name}.py`
4. **Test** - Run evaluation scripts in `tests/`

## 🧠 RAG Pipeline

1. **Chunking**: Text split into 500-1000 token chunks with 100-200 token overlap
2. **Embedding**: OpenAI `text-embedding-3-small` or open-source alternatives
3. **Storage**: ChromaDB vector database (can swap to Qdrant/Pinecone)
4. **Retrieval**: Top-k similarity search (k=5 by default)
5. **Generation**: LLM generates response with retrieved context

## 🎭 Available Historical Figures

- **Albert Einstein** - Physics, philosophy of science, thought experiments
- **Marie Curie** - Chemistry, physics, perseverance
- **Julius Caesar** - Military strategy, leadership, Roman politics
- *(More coming soon)*

## 🔧 Configuration

See `backend/config.py` for:
- Model selection (OpenRouter/OpenAI/Anthropic)
- RAG parameters (chunk size, retrieval count)
- Vector database settings
- API rate limits

## 📊 Evaluation

Run evals to test figure accuracy:

```bash
cd tests
python run_evals.py --figure einstein
```

## 🚢 Deployment

```bash
# Docker deployment
docker-compose up -d

# Or deploy to your preferred platform
# (Render, Railway, Vercel, etc.)
```

## 📖 Documentation

- [Architecture Overview](docs/architecture.md)
- [Adding Historical Figures](docs/adding-figures.md)
- [RAG Pipeline Details](docs/rag-pipeline.md)
- [API Reference](docs/api-reference.md)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 License

MIT License - See [LICENSE](LICENSE)

## 🙏 Acknowledgments

Built with:
- FastAPI
- LangChain
- ChromaDB
- OpenAI/OpenRouter APIs
- React + TypeScript
