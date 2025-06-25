from extrair_capa_utils import extrair_capa_pdf, CONFIGURACOES

def main():
    """Função principal que extrai a capa do PDF de mapa mental"""
    config = CONFIGURACOES['mapa_mental']
    extrair_capa_pdf(config['pdf_path'], config['output_path'])

if __name__ == '__main__':
    main() 