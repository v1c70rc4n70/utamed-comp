# utamed-comp
 Script para macOS Apple Silicon (M1 / M2 / M3) + Jupyter
# ============================================================
# Script para macOS Apple Silicon (M1 / M2 / M3) + Jupyter
#
# OBJETIVO GENERAL
# ----------------
# Este script automatiza la creación de un entorno conda aislado
# con soporte GPU (Metal) para TensorFlow en macOS, y registra
# dicho entorno como un kernel seleccionable en Jupyter Notebook.
#
# El enfoque es deliberadamente defensivo:
# - Detecta 'conda' incluso si Jupyter no hereda el PATH correcto
# - Fija (pin) versiones compatibles de TensorFlow y tensorflow-metal
# - Evita ejecuciones accidentales mediante confirmación explícita
#
# Este tipo de script es típico en proyectos de IA donde:
# - Se quiere garantizar reproducibilidad
# - El profesor o revisor puede ejecutar el notebook en otra máquina
# ============================================================

import os
import sys
import shutil
import subprocess
from textwrap import dedent


# ============================================================
# PASO 0) CONFIRMACIÓN EXPLÍCITA DE EJECUCIÓN
# ============================================================
#
# Este script:
# - crea entornos conda
# - instala paquetes
# - registra kernels en Jupyter
#
# Son acciones con efectos persistentes en el sistema del usuario,
# por lo que es buena práctica pedir confirmación explícita antes
# de continuar (especialmente en un notebook).
#
# Si el usuario no escribe exactamente "SI", el script se detiene.
#

respuesta = input(
"⚠️ Este script creará un entorno conda y registrará un kernel en Jupyter.\n"
"¿Estás seguro de que quieres continuar? Escribe 'SI' para confirmar: "
)

if respuesta.strip() != "SI":
print("❌ Ejecución cancelada por el usuario.")
sys.exit(0)


# ============================================================
# CONFIGURACIÓN GENERAL (AJUSTABLE)
# ============================================================

# Nombre del entorno conda que se va a crear
ENV_NAME = "tf-metal311"

# Nombre que aparecerá en el selector de kernels de Jupyter
KERNEL_DISPLAY_NAME = "Python (tf-metal311)"

# Instalación opcional de librerías relacionadas con YOLO / visión
INSTALL_YOLO = True

# Instalación de TensorFlow con aceleración Metal (GPU Apple)
INSTALL_TF_METAL = True


# ============================================================
# PIN DE VERSIONES (CRÍTICO EN APPLE SILICON)
# ============================================================
#
# En Apple Silicon, tensorflow-metal es un plugin binario.
# Si la versión NO coincide con la de TensorFlow:
# → errores del tipo "Symbol not found" al importar tensorflow
#
# Por eso se fijan versiones concretas que se sabe que funcionan.
#

TF_VERSION = "2.18.0"
TF_METAL_VERSION = "1.2.0"


# ============================================================
# LISTAS DE PAQUETES
# ============================================================

# Paquetes típicos en un pipeline de visión por computador
YOLO_PKGS = [
"ultralytics",
"opencv-python",
"matplotlib",
"pyyaml",
"ipykernel", # Necesario para registrar el kernel en Jupyter
]

# Paquetes TensorFlow + Metal con versiones fijadas
TF_METAL_PKGS = [
f"tensorflow=={TF_VERSION}",
f"tensorflow-metal=={TF_METAL_VERSION}",
]


# ============================================================
# AUTODETECCIÓN DE CONDA
# ============================================================
def detect_conda():
"""
Intenta localizar el ejecutable 'conda' incluso cuando Jupyter
no hereda correctamente el PATH del sistema.

Estrategia:
1) Probar si 'conda' está disponible en PATH
2) Probar rutas típicas de Anaconda / Miniconda / Miniforge en macOS

Devuelve:
- ruta a 'conda' si se encuentra
- lista de rutas probadas (útil para mensajes de error)
"""
tried = []

# 1) Caso ideal: conda está en PATH
p = shutil.which("conda")
if p:
return p, tried

# 2) Rutas típicas en macOS
home = os.path.expanduser("~")
candidates = [
os.path.join(home, "anaconda3", "bin", "conda"),
os.path.join(home, "miniconda3", "bin", "conda"),
os.path.join(home, "miniforge3", "bin", "conda"),
os.path.join(home, "mambaforge", "bin", "conda"),
"/opt/anaconda3/bin/conda",
"/opt/miniconda3/bin/conda",
"/opt/miniforge3/bin/conda",
"/opt/mambaforge/bin/conda",
]

for c in candidates:
tried.append(c)
if os.path.exists(c) and os.access(c, os.X_OK):
return c, tried

return None, tried


# ============================================================
# UTILIDADES
# ============================================================
def run(cmd):
"""
Ejecuta un comando externo mostrando exactamente qué se ejecuta.
Si el comando falla, se lanza una excepción (fail fast).
"""
print("\n>>", " ".join(cmd))
subprocess.run(cmd, check=True)


def ensure_mac():
"""
Verifica que el sistema operativo es macOS.
TensorFlow + Metal solo tiene sentido en este entorno.
"""
if sys.platform != "darwin":
raise RuntimeError(
"Este script está diseñado exclusivamente para macOS (Apple Silicon)."
)


# ============================================================
# FUNCIÓN PRINCIPAL
# ============================================================
def main():
# 1) Comprobación de plataforma
ensure_mac()

# 2) Detección de conda
conda_path, tried = detect_conda()
if not conda_path:
raise RuntimeError(dedent(f"""
No se ha podido localizar 'conda'.

Rutas probadas:
- """ + "\n - ".join(tried) + """

Posible solución:
- Abre Terminal y ejecuta: which conda
- Añade esa ruta a la lista de 'candidates'
""").strip())

print("✅ Usando conda en:", conda_path)

# 3) Creación del entorno (si ya existe, se continúa)
print(f"\nCreando entorno '{ENV_NAME}' con Python 3.11...")
try:
run([conda_path, "create", "-n", ENV_NAME, "python=3.11", "-y"])
except subprocess.CalledProcessError:
print(f"(Info) El entorno '{ENV_NAME}' ya existe. Continúo.")

# 4) Actualización de pip dentro del entorno
run([
conda_path, "run", "-n", ENV_NAME,
"python", "-m", "pip", "install", "--upgrade", "pip"
])

# 5) Instalación opcional de paquetes de visión / YOLO
if INSTALL_YOLO:
print("\nInstalando paquetes de visión / YOLO...")
run([
conda_path, "run", "-n", ENV_NAME,
"python", "-m", "pip", "install", *YOLO_PKGS
])

# 6) Instalación de TensorFlow + Metal con versiones fijadas
if INSTALL_TF_METAL:
print("\nInstalando TensorFlow + Metal (versiones fijadas)...")
for pkg in TF_METAL_PKGS:
print(" -", pkg)

run([
conda_path, "run", "-n", ENV_NAME,
"python", "-m", "pip", "install",
"--no-cache-dir",
"--force-reinstall",
*TF_METAL_PKGS
])

# 7) Registro del kernel de Jupyter
print("\nRegistrando kernel de Jupyter...")
run([
conda_path, "run", "-n", ENV_NAME,
"python", "-m", "ipykernel", "install",
"--user",
"--name", ENV_NAME,
"--display-name", KERNEL_DISPLAY_NAME
])

# 8) Validación básica: TensorFlow + GPU
if INSTALL_TF_METAL:
print("\nValidación de TensorFlow y GPU Metal...")
run([
conda_path, "run", "-n", ENV_NAME,
"python", "-c",
(
"import tensorflow as tf; "
"print('TensorFlow:', tf.__version__); "
"print('GPUs:', tf.config.list_physical_devices('GPU'))"
)
])

# 9) Mensaje final
print(dedent(f"""
✅ Entorno configurado correctamente.

En Jupyter:
Kernel → Change Kernel → {KERNEL_DISPLAY_NAME}

Para desinstalar:
- Quitar kernel: jupyter kernelspec uninstall {ENV_NAME}
- Borrar entorno: {conda_path} remove -n {ENV_NAME} --all -y
""").strip())


# ============================================================
# EJECUCIÓN
# ============================================================
main()
 

 
