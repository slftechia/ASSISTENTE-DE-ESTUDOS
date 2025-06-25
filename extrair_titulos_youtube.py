import json
import re
import requests
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configuração da API do YouTube
API_KEY = 'AIzaSyC765ooSvA3xyuuVY2i0xj54qcL_xQEvOM'
BASE_URL = 'https://www.googleapis.com/youtube/v3/videos'

@dataclass
class Video:
    """Classe para representar um vídeo do YouTube"""
    titulo: str
    url: str

def get_video_id(url: str) -> Optional[str]:
    """
    Extrai o ID do vídeo do YouTube a partir da URL.
    
    Args:
        url (str): URL do vídeo do YouTube
        
    Returns:
        Optional[str]: ID do vídeo ou None se não for encontrado
    """
    patterns = [
        r'youtube\.com/watch\?v=([\w-]+)',
        r'youtu\.be/([\w-]+)',
        r'youtube\.com/shorts/([\w-]+)',
        r'youtube\.com/embed/([\w-]+)'
    ]
    for pattern in patterns:
        if match := re.search(pattern, url):
            return match.group(1)
    return None

def get_title(video_id: str) -> Optional[str]:
    """
    Obtém o título do vídeo usando a API do YouTube.
    
    Args:
        video_id (str): ID do vídeo do YouTube
        
    Returns:
        Optional[str]: Título do vídeo ou None se não for encontrado
    """
    try:
        url = f'{BASE_URL}?part=snippet&id={video_id}&key={API_KEY}'
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        items = response.json().get('items', [])
        if items:
            return items[0]['snippet']['title']
    except (requests.RequestException, KeyError, IndexError) as e:
        print(f'Erro ao obter título do vídeo {video_id}: {e}')
    return None

def processar_video(link: str) -> Video:
    """
    Processa um único vídeo, extraindo seu ID e título.
    
    Args:
        link (str): URL do vídeo
        
    Returns:
        Video: Objeto contendo título e URL do vídeo
    """
    video_id = get_video_id(link)
    titulo = get_title(video_id) if video_id else None
    return Video(titulo=titulo or link, url=link)

def processar_categoria(categoria: str, links: List[str]) -> Dict[str, Any]:
    """
    Processa todos os vídeos de uma categoria.
    
    Args:
        categoria (str): Nome da categoria
        links (List[str]): Lista de URLs dos vídeos
        
    Returns:
        Dict[str, Any]: Dicionário com categoria e seus vídeos processados
    """
    videos = []
    with ThreadPoolExecutor(max_workers=5) as executor:
        future_to_link = {executor.submit(processar_video, link): link for link in links}
        for future in as_completed(future_to_link):
            try:
                video = future.result()
                videos.append({'titulo': video.titulo, 'url': video.url})
            except Exception as e:
                print(f'Erro ao processar vídeo: {e}')
    
    return {
        'categoria': categoria,
        'videos': videos
    }

def main():
    """Função principal que coordena o processamento dos vídeos"""
    try:
        # Carrega os links do arquivo JSON
        with open('videoaulas_links.json', encoding='utf-8') as f:
            categorias = json.load(f)
        
        # Processa todas as categorias
        resultado = []
        for categoria, links in categorias.items():
            print(f'Processando categoria: {categoria}')
            resultado.append(processar_categoria(categoria, links))
        
        # Salva o resultado
        with open('videoaulas_com_titulos.json', 'w', encoding='utf-8') as f:
            json.dump(resultado, f, ensure_ascii=False, indent=2)
        
        print('Estrutura com títulos salva em videoaulas_com_titulos.json')
        
    except Exception as e:
        print(f'Erro durante o processamento: {e}')

if __name__ == '__main__':
    main() 