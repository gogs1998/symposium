FROM python:3.11-slim

WORKDIR /app

# Copy production requirements and install
COPY backend/requirements.prod.txt ./
RUN pip install --no-cache-dir -r requirements.prod.txt

# Copy application code and vector database
COPY backend ./backend

# Copy and make start script executable
COPY start.sh /app/backend/start.sh
RUN chmod +x /app/backend/start.sh

# Set working directory to backend
WORKDIR /app/backend

# Start application
CMD ["/app/backend/start.sh"]
