FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy Deep Agents SDK from parent
COPY ../libs/deepagents /app/libs/deepagents

# Install Deep Agents SDK in development mode
RUN pip install -e /app/libs/deepagents

# Copy app
COPY app.py .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the app
CMD ["python", "app.py"]
