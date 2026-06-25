FROM pytorch/pytorch:2.2.0-cuda12.1-cudnn8-runtime
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
RUN git clone https://github.com/openai/shap-e.git
RUN git clone https://github.com/VAST-AI-Research/TripoSR.git
COPY worker.py .
CMD ["python", "worker.py"]
