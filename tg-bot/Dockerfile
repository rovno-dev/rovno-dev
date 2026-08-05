FROM python:3.12-slim
WORKDIR /app
RUN pip install --no-cache-dir aiogram sqlalchemy psycopg2-binary openpyxl python-dotenv httpx
COPY . .
CMD ["python", "app/bot.py"]
