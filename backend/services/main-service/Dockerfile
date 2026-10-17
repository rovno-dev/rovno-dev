FROM python:3.12-slim
WORKDIR /app

# Install ffmpeg for video conversion
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY ./ /app/
CMD ["sh", "-c", "alembic upgrade head && uvicorn main:app --reload --host 0.0.0.0 --port 8000"]
