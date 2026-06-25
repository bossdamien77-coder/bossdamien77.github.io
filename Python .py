import os
import uuid
import subprocess
from pathlib import Path
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel
import uvicorn

app = FastAPI()
BASE_DIR = Path("/data")
BASE_DIR.mkdir(exist_ok=True)
UPLOADS = BASE_DIR / "uploads"
OUTPUTS = BASE_DIR / "outputs"
UPLOADS.mkdir(exist_ok=True)
OUTPUTS.mkdir(exist_ok=True)

class TextTo3DRequest(BaseModel):
    prompt: str

@app.post("/api/text-to-3d")
async def text_to_3d(req: TextTo3DRequest):
    job_id = str(uuid.uuid4())
    out_dir = OUTPUTS / job_id
    out_dir.mkdir()
    
    # Pipeline: Shap-E pour text→3D
    cmd = (
        f"cd /app/shap-e && python -c \""
        f"from shap_e.diffusion.sample import sample_latents; "
        f"from shap_e.diffusion.gaussian_diffusion import diffusion_from_config; "
        f"from shap_e.models.download import load_model, load_config; "
        f"from shap_e.util.notebooks import decode_latent_mesh; "
        f"device = 'cuda'; "
        f"xm = load_model('transmitter', device=device); "
        f"model = load_model('text300M', device=device); "
        f"diffusion = diffusion_from_config(load_config('diffusion')); "
        f"latents = sample_latents('{req.prompt}', model, diffusion, device, guidance_scale=15.0); "
        f"mesh = decode_latent_mesh(xm, latents[0]).tri_mesh(); "
        f"with open('{out_dir}/model.obj', 'w') as f: f.write(mesh.stringify()); "
        f"print('DONE')\""
    )
    subprocess.Popen(cmd, shell=True)
    return {"job_id": job_id, "status": "processing"}

@app.post("/api/image-to-3d")
async def image_to_3d(file: UploadFile = File(...)):
    job_id = str(uuid.uuid4())
    out_dir = OUTPUTS / job_id
    out_dir.mkdir()
    img_path = UPLOADS / f"{job_id}.png"
    
    with open(img_path, "wb") as f:
        f.write(await file.read())
    
    # TripoSR pour image→3D
    cmd = (
        f"cd /app/TripoSR && python run.py "
        f"--image {img_path} "
        f"--output-dir {out_dir} "
        f"--model-save-interval 0 "
        f"--do-export-obj"
    )
    subprocess.Popen(cmd, shell=True)
    return {"job_id": job_id, "status": "processing"}

@app.get("/api/status/{job_id}")
async def get_status(job_id: str):
    obj_path = OUTPUTS / job_id / "model.obj"
    glb_path = OUTPUTS / job_id / "model.glb"
    ready = obj_path.exists() or glb_path.exists()
    return {"ready": ready, "job_id": job_id}

@app.get("/api/model/{job_id}")
async def get_model(job_id: str):
    glb_path = OUTPUTS / job_id / "model.glb"
    obj_path = OUTPUTS / job_id / "model.obj"
    
    # Convertir OBJ → GLB si nécessaire
    if obj_path.exists() and not glb_path.exists():
        import trimesh
        mesh = trimesh.load(str(obj_path))
        mesh.export(str(glb_path), file_type='glb')
    
    if glb_path.exists():
        return FileResponse(str(glb_path), media_type="model/gltf-binary")
    return {"error": "Model not ready"}, 404

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
