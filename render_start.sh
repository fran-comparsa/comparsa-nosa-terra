#!/bin/bash
# Script de inicio para Render
cd /app/backend
uvicorn server:app --host 0.0.0.0 --port $PORT
