# 🏛️ Symposium.ai - START HERE

## What You Have

A **complete, production-ready RAG stack** for chatting with historical figures, powered by their actual writings and ideas.

## ⚡ Quick Start (5 Minutes)

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- OpenAI API key

### 2. Automated Setup
```bash
chmod +x quickstart.sh
./quickstart.sh
```

### 3. Add Your API Key
Edit `backend/.env` and add:
```
OPENAI_API_KEY=sk-your-key-here
```

### 4. Run It
**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Open Browser
Go to **http://localhost:3000** and start chatting with Einstein!

---

## 📖 Documentation

- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete overview of what's built
- **[docs/SETUP.md](docs/SETUP.md)** - Detailed setup instructions
- **[docs/API.md](docs/API.md)** - API reference
- **[TODO.md](TODO.md)** - Development roadmap

---

## 🎯 What Works Right Now

✅ Chat with **Albert Einstein** about:
- Theory of relativity
- His famous thought experiments
- His life and scientific journey
- Philosophy of science

✅ Get responses that:
- Reference his actual writings
- Use his teaching style (analogies, thought experiments)
- Include citations to source documents
- Maintain his personality and worldview

✅ Beautiful WhatsApp-style interface with:
- Real-time chat
- Typing indicators
- Citation display
- Responsive design

---

## 🚀 Next Steps

1. **Test it:** Chat with Einstein to verify everything works
2. **Read PROJECT_SUMMARY.md:** Understand the full architecture
3. **Add more figures:** Follow the guide to add Marie Curie, Caesar, etc.
4. **Customize:** Adjust system prompts, chunk sizes, etc.

---

## 📊 Project Structure

```
symposium-rag/
├── START_HERE.md          ← You are here
├── PROJECT_SUMMARY.md     ← Read this next
├── README.md              ← Technical overview
├── TODO.md                ← Future development
├── quickstart.sh          ← Automated setup
│
├── backend/               ← FastAPI server + RAG engine
├── frontend/              ← React chat interface
├── ingestion/             ← Document processing pipeline
└── docs/                  ← Detailed documentation
```

---

## 💡 Key Features

- **True RAG:** Not just prompts - real vector search with ChromaDB
- **Citations:** Every response shows which sources were used
- **Extensible:** Add new figures by dropping in source materials
- **Production-ready:** FastAPI backend, React frontend, Docker support
- **Well-documented:** Comprehensive guides for everything

---

## ❓ Need Help?

- **Setup issues?** See [docs/SETUP.md](docs/SETUP.md)
- **API questions?** See [docs/API.md](docs/API.md)
- **Architecture questions?** See [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

---

## 🎉 You're Ready!

Run the quickstart script and start building Symposium.ai!

```bash
chmod +x quickstart.sh
./quickstart.sh
```

Then add your OpenAI key to `backend/.env` and you're off to the races! 🚀

---

Built with ❤️ for learning from history's greatest minds.
