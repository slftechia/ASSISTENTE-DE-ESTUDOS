# Script para mover PDFs para suas respectivas pastas
# Autor: Sistema de Assistente de Estudos
# Data: 2024

param(
    [Parameter(Mandatory=$true, HelpMessage="Caminho do arquivo PDF de origem")]
    [ValidateScript({Test-Path $_})]
    [string]$sourceFile,
    
    [Parameter(Mandatory=$true, HelpMessage="Caminho da pasta de destino")]
    [ValidateScript({Test-Path $_})]
    [string]$targetFolder
)

# Função para normalizar nomes de arquivo
function Normalize-FileName {
    param(
        [Parameter(Mandatory=$true)]
        [string]$fileName
    )
    
    # Mapa de caracteres acentuados para seus equivalentes sem acento
    $charMap = @{
        'á' = 'a'; 'à' = 'a'; 'ã' = 'a'; 'â' = 'a'; 'ä' = 'a'
        'é' = 'e'; 'è' = 'e'; 'ê' = 'e'; 'ë' = 'e'
        'í' = 'i'; 'ì' = 'i'; 'î' = 'i'; 'ï' = 'i'
        'ó' = 'o'; 'ò' = 'o'; 'õ' = 'o'; 'ô' = 'o'; 'ö' = 'o'
        'ú' = 'u'; 'ù' = 'u'; 'û' = 'u'; 'ü' = 'u'
        'ç' = 'c'
    }
    
    # Aplica as substituições
    $normalized = $fileName
    foreach ($key in $charMap.Keys) {
        $normalized = $normalized -replace $key, $charMap[$key]
    }
    
    # Remove caracteres especiais e converte para minúsculas
    $normalized = $normalized -replace '[^a-zA-Z0-9\-_\.]','_'
    return $normalized.ToLower()
}

# Função para verificar e criar backup do arquivo existente
function Backup-ExistingFile {
    param(
        [Parameter(Mandatory=$true)]
        [string]$filePath
    )
    
    if (Test-Path $filePath) {
        $backupPath = "$filePath.bak"
        $counter = 1
        while (Test-Path $backupPath) {
            $backupPath = "$filePath.bak$counter"
            $counter++
        }
        Copy-Item -Path $filePath -Destination $backupPath -Force
        Write-Host "Backup criado: $backupPath"
    }
}

# Função principal para mover o arquivo
function Move-PDFFile {
    param(
        [Parameter(Mandatory=$true)]
        [string]$sourceFile,
        
        [Parameter(Mandatory=$true)]
        [string]$targetFolder
    )
    
    try {
        # Obtém o nome do arquivo
        $fileName = Split-Path $sourceFile -Leaf
        
        # Normaliza o nome do arquivo
        $normalizedName = Normalize-FileName $fileName
        
        # Constrói o caminho de destino
        $targetPath = Join-Path $targetFolder $normalizedName
        
        # Cria backup do arquivo existente
        Backup-ExistingFile -filePath $targetPath
        
        # Move o arquivo
        Move-Item -Path $sourceFile -Destination $targetPath -Force
        
        Write-Host "✓ Arquivo movido com sucesso para: $targetPath"
        return $true
    }
    catch {
        Write-Error "✗ Erro ao mover arquivo: $_"
        return $false
    }
}

# Executa a movimentação do arquivo
$success = Move-PDFFile -sourceFile $sourceFile -targetFolder $targetFolder
exit [int](!$success) 