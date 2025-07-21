# Script de inicialização do Assistente de Estudos
# Autor: Sistema de Assistente de Estudos
# Data: 2024

# Configurações
$CONFIG = @{
    # Estrutura de pastas do projeto
    Folders = @(
        # Pastas principais
        "Conhecimentos_Especificos",
        "Portugues",
        "Temas_de_Educacao",
        "Apostilas_Simulados",
        
        # Pastas do frontend
        "frontend/public/pdfs",
        "frontend/public/pdfs/Conhecimentos_Especificos",
        "frontend/public/pdfs/Portugues",
        "frontend/public/pdfs/Temas_de_Educacao",
        "frontend/public/pdfs/simulados/conhecimentos_especificos",
        "frontend/public/pdfs/simulados/portugues",
        "frontend/public/pdfs/simulados/temas_educacao"
    )
    
    # Comandos npm
    NpmCommands = @(
        "install",
        "run dev"
    )
}

# Função para criar diretório
function Create-Directory {
    param(
        [Parameter(Mandatory=$true)]
        [string]$path
    )
    
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "✓ Pasta criada: $path"
        return $true
    } else {
        Write-Host "ℹ Pasta já existe: $path"
        return $true
    }
}

# Função para executar comandos npm
function Invoke-NpmCommands {
    param(
        [Parameter(Mandatory=$true)]
        [string]$workingDirectory
    )
    
    try {
        # Muda para o diretório do frontend
        Push-Location $workingDirectory
        
        # Executa os comandos npm
        foreach ($command in $CONFIG.NpmCommands) {
            Write-Host "`nExecutando: npm $command"
            npm $command
            if ($LASTEXITCODE -ne 0) {
                throw "Erro ao executar: npm $command"
            }
        }
        
        return $true
    }
    catch {
        Write-Error "✗ Erro ao executar comandos npm: $_"
        return $false
    }
    finally {
        # Retorna ao diretório original
        Pop-Location
    }
}

# Função principal
function Start-Application {
    try {
        Write-Host "`nIniciando configuração do Assistente de Estudos...`n"
        
        # Cria as pastas necessárias
        $foldersCreated = $true
        foreach ($folder in $CONFIG.Folders) {
            if (-not (Create-Directory -path $folder)) {
                $foldersCreated = $false
                break
            }
        }
        
        if (-not $foldersCreated) {
            throw "Erro ao criar estrutura de pastas"
        }
        
        # Inicia a aplicação
        Write-Host "`nIniciando aplicação frontend...`n"
        if (-not (Invoke-NpmCommands -workingDirectory "frontend")) {
            throw "Erro ao iniciar aplicação frontend"
        }
        
        Write-Host "`n✓ Configuração concluída com sucesso!"
        return $true
    }
    catch {
        Write-Error "`n✗ Erro durante a inicialização: $_"
        return $false
    }
}

# Executa a inicialização
$success = Start-Application
exit [int](!$success) 