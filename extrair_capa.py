import fitz  # PyMuPDF
from pathlib import Path
from typing import Optional
from extrair_capa_utils import extrair_capa_pdf, CONFIGURACOES

def extrair_capa_pdf(
    pdf_path: str,
    output_path: str,
    dpi: int = 200,
    pagina: int = 0
) -> Optional[str]:
    """
    Extrai a capa de um arquivo PDF e salva como imagem.
    
    Args:
        pdf_path (str): Caminho do arquivo PDF
        output_path (str): Caminho onde a imagem será salva
        dpi (int, optional): Resolução da imagem. Padrão é 200
        pagina (int, optional): Número da página a ser extraída. Padrão é 0 (primeira página)
        
    Returns:
        Optional[str]: Caminho do arquivo salvo ou None em caso de erro
    """
    try:
        # Verifica se o arquivo PDF existe
        if not Path(pdf_path).exists():
            raise FileNotFoundError(f"Arquivo PDF não encontrado: {pdf_path}")
            
        # Abre o PDF e extrai a página
        doc = fitz.open(pdf_path)
        page = doc.load_page(pagina)
        
        # Converte a página para imagem
        pix = page.get_pixmap(dpi=dpi)
        
        # Cria o diretório de saída se não existir
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        
        # Salva a imagem
        pix.save(output_path)
        
        print(f"Capa extraída com sucesso: {output_path}")
        return output_path
        
    except Exception as e:
        print(f"Erro ao extrair capa: {e}")
        return None
    finally:
        if 'doc' in locals():
            doc.close()

def main():
    """Função principal que extrai a capa do PDF completo"""
    config = CONFIGURACOES['completa']
    extrair_capa_pdf(config['pdf_path'], config['output_path'])

if __name__ == '__main__':
    main() 