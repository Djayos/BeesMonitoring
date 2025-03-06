from fastapi import FastAPI
import paramiko
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
import io
from io import BytesIO
from fastapi.responses import StreamingResponse

app = FastAPI()

# Activer CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],  # Autorise toutes les méthodes (GET, POST, etc.)
    allow_headers=["*"],  # Autorise tous les headers
)

# Informations de connexion au serveur Oracle
SSH_HOST = "89.168.38.245"
SSH_USER = "ubuntu"
SSH_KEY_PATH = "C:/Users/josep/Desktop/M2/bees_2/BeesMonitoring/id_rsa"
REMOTE_IMAGE_DIR = "/home/ubuntu/Bee_pictures/processed"

def list_remote_files():
    """Se connecte en SSH et récupère tous les fichiers .jpg dans tous les dossiers d'analyse"""
    try:
        key = paramiko.RSAKey.from_private_key_file(SSH_KEY_PATH)
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(SSH_HOST, username=SSH_USER, pkey=key)

        # Lister tous les dossiers d'analyse dans /processed/
        stdin, stdout, stderr = client.exec_command(f"ls -d {REMOTE_IMAGE_DIR}/analysis_* 2>/dev/null")
        analysis_folders = stdout.read().decode().splitlines()

        files_by_analysis = {}

        for folder in reversed(analysis_folders):
            folder_name = os.path.basename(folder)

            # Lister uniquement les fichiers .jpg dans ce dossier
            stdin, stdout, stderr = client.exec_command(f"ls {folder}/*_result.jpg 2>/dev/null")
            files = stdout.read().decode().splitlines()

            if files:
                files_by_analysis[folder_name] = [os.path.basename(f) for f in files]

        client.close()
        return {"analyses": files_by_analysis}

    except Exception as e:
        return {"error": str(e)}
    
    
@app.get("/")
def home():
    return {"message": "API is running"}

@app.get("/images")
def get_images():
    return list_remote_files()


@app.get("/image/{analysis}/{image_name}")
def get_image(analysis: str, image_name: str):
    """Récupère une image depuis un dossier d'analyse en SSH et la renvoie"""
    image_path = f"{REMOTE_IMAGE_DIR}/{analysis}/{image_name}"
    
    print(f"DEBUG: Trying to access: {image_path}")

    try:
        key = paramiko.RSAKey.from_private_key_file(SSH_KEY_PATH)
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(SSH_HOST, username=SSH_USER, pkey=key)

        # 🔹 Ouvrir une connexion SFTP pour lire le fichier
        sftp = client.open_sftp()
        with sftp.file(image_path, "rb") as remote_file:
            image_data = remote_file.read()
        
        sftp.close()
        client.close()

        # 🔹 Renvoyer l'image en tant que réponse HTTP
        return StreamingResponse(io.BytesIO(image_data), media_type="image/jpeg")

    except Exception as e:
        return {"error": str(e), "path_checked": image_path}
    