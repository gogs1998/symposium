FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and vector database
COPY backend ./backend

# Expose port
EXPOSE $PORT

# Start application
CMD cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
