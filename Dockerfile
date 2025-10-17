FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and vector database
COPY backend ./backend

# Set working directory to backend
WORKDIR /app/backend

# Start application
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
