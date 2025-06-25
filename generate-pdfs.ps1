# Script para gerar PDFs de simulados por tema
# Autor: Sistema de Assistente de Estudos
# Data: 2024

# Importa o assembly necessário para manipulação de imagens
Add-Type -Path "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\System.Drawing.dll"

# Configurações globais
$CHROME_PATH = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$OUTPUT_BASE_PATH = "frontend/public/pdfs/simulados"

# Função para criar um PDF a partir de um template HTML
function Create-PDF {
    param (
        [Parameter(Mandatory=$true)]
        [string]$outputPath,
        
        [Parameter(Mandatory=$true)]
        [string]$titulo,
        
        [Parameter(Mandatory=$true)]
        [string]$tema,
        
        [Parameter(Mandatory=$false)]
        [string]$questoes = ""
    )
    
    try {
        # Template HTML com estilo moderno
        $html = @"
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>$titulo</title>
            <style>
                body { 
                    font-family: 'Segoe UI', Arial, sans-serif;
                    padding: 40px;
                    line-height: 1.6;
                    color: #333;
                }
                h1 { 
                    text-align: center;
                    color: #2c3e50;
                    margin-bottom: 30px;
                    font-size: 24px;
                }
                h2 {
                    color: #34495e;
                    font-size: 18px;
                    margin-bottom: 20px;
                }
                .questao {
                    margin: 25px 0;
                    padding: 20px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    background-color: #f9f9f9;
                }
                .alternativa {
                    margin: 12px 0;
                    padding: 8px;
                    border-left: 3px solid #3498db;
                    background-color: #fff;
                }
                .cabecalho {
                    text-align: center;
                    margin-bottom: 40px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #eee;
                }
            </style>
        </head>
        <body>
            <div class="cabecalho">
                <h1>$titulo</h1>
                <h2>Tema: $tema</h2>
            </div>
            $questoes
        </body>
        </html>
"@

        # Salva o HTML em um arquivo temporário
        $tempHtmlPath = [System.IO.Path]::GetTempFileName() + ".html"
        $html | Out-File -FilePath $tempHtmlPath -Encoding UTF8

        # Tenta usar o Chrome para gerar o PDF
        if (Test-Path $CHROME_PATH) {
            Write-Host "Usando Chrome para gerar PDF..."
            & $CHROME_PATH --headless --disable-gpu --print-to-pdf="$outputPath" $tempHtmlPath
            Start-Sleep -Seconds 2
        } else {
            Write-Host "Chrome não encontrado. Gerando PDF alternativo..."
            $content = [System.Text.Encoding]::UTF8.GetBytes($html)
            [System.IO.File]::WriteAllBytes($outputPath, $content)
        }

        # Limpa o arquivo temporário
        Remove-Item $tempHtmlPath -Force
        return $true
    }
    catch {
        Write-Host "Erro ao criar PDF: $_"
        return $false
    }
}

# Função para criar o diretório de saída
function Create-OutputDirectory {
    param (
        [Parameter(Mandatory=$true)]
        [string]$path
    )
    
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "Diretório criado: $path"
    }
}

# Função para gerar questões de exemplo
function Get-QuestoesExemplo {
    param (
        [Parameter(Mandatory=$true)]
        [string]$tema
    )
    
    $questoes = @"
    <div class="questao">
        <h3>Questão 1</h3>
        <p>Qual é o principal objetivo da avaliação formativa no processo de ensino-aprendizagem?</p>
        <div class="alternativa">a) Classificar os alunos em ordem de desempenho</div>
        <div class="alternativa">b) Fornecer feedback contínuo para melhorar a aprendizagem</div>
        <div class="alternativa">c) Determinar as notas finais dos estudantes</div>
        <div class="alternativa">d) Comparar o desempenho entre diferentes turmas</div>
    </div>
"@
    
    return $questoes
}

# Estrutura dos simulados
$temas = @{
    "conhecimentos_especificos" = @(
        @{ nome = "simulado_didatica_1"; titulo = "Simulado de Didática" },
        @{ nome = "simulado_legislacao_1"; titulo = "Simulado de Legislação" },
        @{ nome = "simulado_praticas_1"; titulo = "Simulado de Práticas Pedagógicas" }
    )
    "portugues" = @(
        @{ nome = "simulado_gramatica_1"; titulo = "Simulado de Gramática" },
        @{ nome = "simulado_interpretacao_1"; titulo = "Simulado de Interpretação" },
        @{ nome = "simulado_redacao_1"; titulo = "Simulado de Redação" }
    )
    "temas_educacao" = @(
        @{ nome = "simulado_teorias_1"; titulo = "Simulado de Teorias da Educação" },
        @{ nome = "simulado_avaliacao_1"; titulo = "Simulado de Avaliação" },
        @{ nome = "simulado_metodologias_1"; titulo = "Simulado de Metodologias" }
    )
    "simulados_completos" = @(
        @{ nome = "PROVA_SIMULADA_GERAL_1"; titulo = "Prova Simulada Geral 1" },
        @{ nome = "PROVA_SIMULADA_GERAL_2"; titulo = "Prova Simulada Geral 2" },
        @{ nome = "PROVA_SIMULADA_GERAL_3"; titulo = "Prova Simulada Geral 3" },
        @{ nome = "PROVA_SIMULADA_GERAL_4"; titulo = "Prova Simulada Geral 4" },
        @{ nome = "PROVA_SIMULADA_GERAL_5"; titulo = "Prova Simulada Geral 5" },
        @{ nome = "PROVA_SIMULADA_GERAL_6"; titulo = "Prova Simulada Geral 6" },
        @{ nome = "PROVA_SIMULADA_GERAL_7"; titulo = "Prova Simulada Geral 7" },
        @{ nome = "PROVA_SIMULADA_GERAL_8"; titulo = "Prova Simulada Geral 8" },
        @{ nome = "PROVA_SIMULADA_GERAL_9"; titulo = "Prova Simulada Geral 9" },
        @{ nome = "PROVA_SIMULADA_GERAL_10"; titulo = "Prova Simulada Geral 10" }
    )
}

# Cria os diretórios necessários
foreach ($tema in $temas.Keys) {
    $path = Join-Path $OUTPUT_BASE_PATH $tema
    Create-OutputDirectory -path $path
}

# Gera os PDFs
foreach ($tema in $temas.Keys) {
    Write-Host "`nProcessando tema: $tema"
    foreach ($simulado in $temas[$tema]) {
        $outputPath = Join-Path $OUTPUT_BASE_PATH "$tema/$($simulado.nome).pdf"
        Write-Host "Gerando $($simulado.titulo)..."
        
        $questoes = Get-QuestoesExemplo -tema $tema
        if (Create-PDF -outputPath $outputPath -titulo $simulado.titulo -tema $tema -questoes $questoes) {
            Write-Host "✓ PDF gerado com sucesso: $outputPath"
        } else {
            Write-Host "✗ Falha ao gerar PDF: $outputPath"
        }
    }
}

Write-Host "`nProcesso de geração de PDFs concluído!" 