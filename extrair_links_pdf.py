import re
import json
from typing import Dict, List

# Lista de encodings para tentar ler o arquivo
encodings = ['utf-8', 'utf-16', 'latin-1']

def ler_arquivo_com_encoding(arquivo: str) -> str:
    """
    Tenta ler o arquivo com diferentes encodings até encontrar um que funcione.
    
    Args:
        arquivo (str): Caminho do arquivo a ser lido
        
    Returns:
        str: Conteúdo do arquivo
        
    Raises:
        Exception: Se nenhum encoding funcionar
    """
    for enc in encodings:
        try:
            with open(arquivo, encoding=enc) as f:
                return f.read()
        except Exception as e:
            print(f'Falha ao ler com encoding {enc}: {e}')
    raise Exception('Não foi possível ler o arquivo com nenhum encoding conhecido.')

def extrair_categorias_e_links(conteudo: str) -> Dict[str, List[str]]:
    """
    Extrai categorias e links do conteúdo do arquivo.
    
    Args:
        conteudo (str): Conteúdo do arquivo
        
    Returns:
        Dict[str, List[str]]: Dicionário com categorias e seus respectivos links
    """
    categorias = {}
    categoria_atual = 'Geral'
    
    for linha in conteudo.splitlines():
        linha = linha.strip()
        if not linha:
            continue
            
        # Verifica se a linha é uma categoria (texto em maiúsculas)
        if re.match(r'^[A-Z][A-Z ]+$', linha) and len(linha) < 40:
            categoria_atual = linha.strip()
            categorias[categoria_atual] = []
            continue
            
        # Se a linha começa com http, adiciona como link
        if linha.startswith('http'):
            categorias.setdefault(categoria_atual, []).append(linha)
            
    return categorias

def main():
    """Função principal que coordena a extração e salvamento dos links"""
    # Lê o arquivo de entrada
    conteudo = ler_arquivo_com_encoding('extracted_videoaulas.txt')
    
    # Extrai categorias e links
    categorias = extrair_categorias_e_links(conteudo)
    
    # Salva o resultado em JSON
    with open('videoaulas_links.json', 'w', encoding='utf-8') as f:
        json.dump(categorias, f, ensure_ascii=False, indent=2)
    
    print('Links extraídos e salvos em videoaulas_links.json')

if __name__ == '__main__':
    main() 