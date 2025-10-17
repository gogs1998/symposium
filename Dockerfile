FROM python:3.11-slim

WORKDIR /app/backend

# Copy requirements from backend
COPY backend/requirements.prod.txt .
RUN pip install --no-cache-dir -r requirements.prod.txt

# Copy all backend code
COPY backend/ .

# Start uvicorn directly - Railway will inject PORT env var
CMD python -m uvicorn main:app --host 0.0.0.0 --port $PORT
