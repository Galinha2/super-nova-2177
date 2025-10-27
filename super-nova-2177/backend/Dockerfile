# Multi-stage build for a minimal production image
# Stage 1: Builder
FROM python:3.12-slim as builder

WORKDIR /app

# Copy only the dependency file first to leverage Docker cache
COPY requirements.txt .
# Install dependencies into a local directory
RUN apt-get update && apt-get install -y build-essential g++ && rm -rf /var/lib/apt/lists/*
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Final, slim image
FROM python:3.12-slim

WORKDIR /app

# Copy only the installed packages from the builder stage
COPY --from=builder /root/.local /root/.local
# Copy all backend code (contexto de build)
COPY . .

# Make sure scripts in /root/.local are usable
ENV PATH=/root/.local/bin:$PATH

EXPOSE 8000

# Use a simple command without --reload for production
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]