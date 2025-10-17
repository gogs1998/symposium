FROM python:3.11-slim

WORKDIR /app

# Copy production requirements and install
COPY backend/requirements.prod.txt ./
RUN pip install --no-cache-dir -r requirements.prod.txt

# Copy application code and vector database
COPY backend ./backend

# Set working directory to backend
WORKDIR /app/backend

# Start application (using exec form to avoid shell issues)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port $PORT"]
