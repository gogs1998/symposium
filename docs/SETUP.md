# Symposium.ai Setup Guide

## Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- OpenAI API key (for embeddings and LLM)
- Git

## Quick Start (5 minutes)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd symposium-rag
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### 3. Ingest Sample Data (Einstein)

```bash
# From the project root
cd ingestion
python ingest_figure.py --figure einstein --source-dir sources/einstein
```

This will:
- Process Einstein's biography and thought experiments
- Chunk the text into manageable pieces
- Generate embeddings
- Store in ChromaDB vector database

You should see output like:
```
============================================================
Ingesting sources for: Albert Einstein
============================================================

Loading documents from: sources/einstein
✓ Loaded biography.md (12453 chars)
✓ Loaded thought_experiments.md (15678 chars)

Found 2 documents

Ingesting into vector database...

============================================================
✓ SUCCESS!
  Figure: Albert Einstein
  Documents: 2
  Chunks: 45
============================================================
```

### 4. Start the Backend

```bash
cd ../backend
python main.py
```

You should see:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 5. Start the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 543 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 6. Open Your Browser

Go to http://localhost:3000

You should see:
- The Symposium.ai interface
- Einstein as an available figure
- Click on Einstein to start chatting!

## Testing the Chat

Try asking Einstein:
- "Can you explain your thought experiment about riding alongside a beam of light?"
- "What led you to develop the theory of relativity?"
- "How would you explain E=mc² to a child?"

You should get responses that:
- Reference his actual thought experiments
- Use his teaching style (simple analogies)
- Include citations to the source documents

## Adding More Historical Figures

### 1. Create Source Directory

```bash
mkdir -p ingestion/sources/curie
mkdir -p ingestion/sources/caesar
```

### 2. Add Source Materials

Add text files, markdown files, or PDFs:
- Biographies
- Their actual writings (papers, letters, speeches)
- Historical accounts
- Documented quotes

Example structure:
```
sources/
├── curie/
│   ├── biography.md
│   ├── research_notes.txt
│   ├── nobel_speech.md
│   └── letters.txt
└── caesar/
    ├── gallic_wars.md
    ├── civil_war.md
    └── biography.txt
```

### 3. Update Figure Configuration

Edit `backend/agents/figures.py` to add your new figure with appropriate system prompt.

### 4. Ingest the Data

```bash
cd ingestion
python ingest_figure.py --figure curie --source-dir sources/curie
python ingest_figure.py --figure caesar --source-dir sources/caesar
```

### 5. Restart Backend

The new figures will be available immediately!

## Troubleshooting

### "No knowledge base found"
- Make sure you've run the ingestion script
- Check that the figure ID matches between ingestion and the API
- Look for error messages during ingestion

### ChromaDB errors
- Delete the `vector_db_data` directory and re-ingest
- Check file permissions

### API key errors
- Verify your `.env` file has `OPENAI_API_KEY=sk-...`
- Make sure there are no extra spaces or quotes

### Import errors
- Activate your virtual environment
- Re-run `pip install -r requirements.txt`

## API Endpoints

### Health Check
```bash
curl http://localhost:8000/health
```

### List Figures
```bash
curl http://localhost:8000/figures
```

### Chat with Einstein
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "figure": "einstein",
    "message": "What is relativity?",
    "include_citations": true
  }'
```

## Configuration

Edit `backend/.env` to customize:
- `CHUNK_SIZE` - Size of text chunks (default: 800)
- `CHUNK_OVERLAP` - Overlap between chunks (default: 200)
- `RETRIEVAL_K` - Number of chunks to retrieve (default: 5)
- `TEMPERATURE` - LLM creativity (default: 0.7)
- `DEFAULT_MODEL` - Which GPT model to use

## Next Steps

1. **Add more figures** - Build out your historical figure library
2. **Improve prompts** - Refine system prompts for better personality
3. **Add more sources** - More context = better responses
4. **Deploy** - Use Docker Compose or deploy to cloud
5. **Build features** - Multi-agent conversations, citations UI, etc.

## Getting Help

- Check the logs: `backend/main.py` has detailed logging
- API docs: http://localhost:8000/docs (FastAPI auto-generated)
- Issues: Open an issue on GitHub

Happy chatting with history! 🏛️
