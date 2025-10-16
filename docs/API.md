# Symposium.ai API Reference

## Base URL
```
http://localhost:8000
```

## Authentication
Currently no authentication required (add JWT/API keys for production)

---

## Endpoints

### Health Check

**GET** `/health`

Check if the API is running and vector database is accessible.

**Response:**
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "vector_db": "healthy",
  "figures_available": 3
}
```

---

### List Figures

**GET** `/figures`

Get all available historical figures.

**Response:**
```json
[
  {
    "id": "einstein",
    "name": "Albert Einstein",
    "description": "Theoretical physicist who developed the theory of relativity",
    "era": "1879-1955",
    "fields": ["Physics", "Philosophy of Science", "Mathematics"],
    "source_count": 45,
    "available": true
  }
]
```

---

### Get Figure Details

**GET** `/figures/{figure_id}`

Get detailed information about a specific historical figure.

**Parameters:**
- `figure_id` (path) - Figure identifier (e.g., "einstein")

**Response:**
```json
{
  "id": "einstein",
  "name": "Albert Einstein",
  "description": "Theoretical physicist who developed the theory of relativity",
  "era": "1879-1955",
  "fields": ["Physics", "Philosophy of Science", "Mathematics"],
  "source_count": 45,
  "available": true
}
```

---

### Chat with Figure

**POST** `/chat`

Send a message to a historical figure and get a response.

**Request Body:**
```json
{
  "figure": "einstein",
  "message": "Can you explain relativity?",
  "conversation_id": "optional-uuid-for-context",
  "include_citations": true
}
```

**Response:**
```json
{
  "figure": "einstein",
  "message": "Of course! Let me explain relativity using a thought experiment...",
  "citations": [
    {
      "source": "thought_experiments.md",
      "excerpt": "When Einstein was just 16 years old, he began pondering...",
      "relevance_score": 0.92
    }
  ],
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "retrieved_chunks": null
}
```

---

### Multi-Agent Chat

**POST** `/chat/multi`

Have multiple historical figures respond to the same prompt.

**Request Body:**
```json
{
  "figures": ["einstein", "curie", "caesar"],
  "message": "What is leadership?",
  "conversation_id": "optional-uuid",
  "orchestration_mode": "round_robin"
}
```

**Orchestration Modes:**
- `round_robin` - Each figure responds in order
- `all_respond` - All figures respond simultaneously
- `natural` - Figures decide whether to respond (coming soon)

**Response:**
```json
{
  "responses": [
    {
      "figure": "einstein",
      "message": "Leadership in science requires...",
      "citations": [...],
      "conversation_id": "...",
      "retrieved_chunks": null
    },
    {
      "figure": "curie",
      "message": "Through my experience...",
      "citations": [...],
      "conversation_id": "...",
      "retrieved_chunks": null
    }
  ],
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### Delete Conversation

**DELETE** `/conversations/{conversation_id}`

Delete a conversation and its history.

**Parameters:**
- `conversation_id` (path) - Conversation UUID

**Response:**
```json
{
  "message": "Conversation deleted"
}
```

---

## Error Responses

### 404 Not Found
```json
{
  "detail": "Figure 'unknown' not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Error message describing what went wrong"
}
```

---

## Rate Limiting

Current limit: 60 requests per minute per IP (configurable in `.env`)

---

## Interactive Documentation

Visit http://localhost:8000/docs for interactive Swagger UI documentation where you can test all endpoints directly.

---

## Example Usage with cURL

### Get all figures
```bash
curl http://localhost:8000/figures
```

### Chat with Einstein
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "figure": "einstein",
    "message": "What inspired your theory of relativity?",
    "include_citations": true
  }'
```

### Multi-agent discussion
```bash
curl -X POST http://localhost:8000/chat/multi \
  -H "Content-Type: application/json" \
  -d '{
    "figures": ["einstein", "curie"],
    "message": "What is the role of imagination in science?",
    "orchestration_mode": "all_respond"
  }'
```

---

## Python SDK Example

```python
import requests

API_BASE = "http://localhost:8000"

# Get available figures
response = requests.get(f"{API_BASE}/figures")
figures = response.json()
print(f"Available figures: {[f['name'] for f in figures]}")

# Chat with Einstein
chat_request = {
    "figure": "einstein",
    "message": "What is your most famous equation?",
    "include_citations": True
}

response = requests.post(f"{API_BASE}/chat", json=chat_request)
result = response.json()

print(f"\n{result['message']}\n")

if result.get('citations'):
    print("Sources:")
    for citation in result['citations']:
        print(f"  - {citation['source']}")
```

---

## JavaScript/TypeScript Example

```typescript
const API_BASE = 'http://localhost:8000';

async function chatWithFigure(figureId: string, message: string) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      figure: figureId,
      message: message,
      include_citations: true,
    }),
  });

  const data = await response.json();
  return data;
}

// Usage
const response = await chatWithFigure('einstein', 'Explain time dilation');
console.log(response.message);
```
