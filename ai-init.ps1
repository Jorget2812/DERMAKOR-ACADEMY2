# ai-init.ps1 - Instalador del Framework de Ingeniería de IA
# Uso: .\ai-init.ps1

$SourceDir = "$HOME\Desktop\AI-FRAMEWORK\.claude"
$TargetDir = Join-Path $PWD ".claude"

# 1. Verificar si la carpeta maestra existe
if (-not (Test-Path $SourceDir)) {
    Write-Host "ERROR: No se encontró la carpeta maestra en $SourceDir" -ForegroundColor Red
    Write-Host "Asegúrate de haber creado primero tu carpeta maestra en el Escritorio." -ForegroundColor Yellow
    exit
}

# 2. Verificar si ya existe una configuración en el destino
if (Test-Path $TargetDir) {
    Write-Host "ADVERTENCIA: Ya existe una carpeta .claude en este proyecto." -ForegroundColor Yellow
    $Choice = Read-Host "¿Deseas sobrescribirla? (S/N)"
    if ($Choice -ne "S" -and $Choice -ne "s") {
        Write-Host "Operación cancelada por el usuario." -ForegroundColor Cyan
        exit
    }
    Remove-Item -Path $TargetDir -Recurse -Force
}

# 3. Copiar el Framework
Write-Host "Instalando AI Engineering Framework..." -ForegroundColor Cyan
Copy-Item -Path $SourceDir -Destination $TargetDir -Recurse -Force

# 4. Mensaje de éxito
Write-Host "`nAI Engineering Framework instalado correctamente en este proyecto." -ForegroundColor Green
Write-Host "Consulta 'ai-bootstrap.md' para los siguientes pasos." -ForegroundColor White
