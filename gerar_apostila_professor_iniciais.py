from fpdf import FPDF

# Dados da apostila
TITULO = "Apostila Completa - Professor de Anos Iniciais"
ANO = "2024"
CARGO = "Professor de Anos Iniciais"

# Estrutura dos capítulos (resumido para exemplo, mas pode ser expandido)
CAPITULOS = [
    {
        "titulo": "Fundamentos da Educação Infantil e Anos Iniciais",
        "conteudo": """
História da Educação Infantil e dos Anos Iniciais no Brasil\n\nA educação infantil e os anos iniciais do ensino fundamental representam etapas fundamentais na formação do indivíduo. No Brasil, a legislação educacional, como a LDB (Lei de Diretrizes e Bases da Educação Nacional), estabelece as bases para o atendimento educacional de crianças de 0 a 10 anos.\n\nTeorias pedagógicas:\n- Piaget: desenvolvimento cognitivo em estágios.\n- Vygotsky: aprendizagem mediada e zona de desenvolvimento proximal.\n- Wallon: papel das emoções no desenvolvimento.\n- Freire: educação libertadora e diálogo.\n\nO papel do professor é promover o desenvolvimento integral, respeitando as diferenças e estimulando a autonomia.\n\nExemplo prático: Planejamento de uma atividade lúdica para trabalhar coordenação motora e socialização.\n\nExercício:\n1. Cite duas contribuições de Vygotsky para a educação.\n2. Explique a importância do brincar nos anos iniciais.\n"""
    },
    {
        "titulo": "Psicologia do Desenvolvimento e da Aprendizagem",
        "conteudo": """
Estágios do desenvolvimento cognitivo, afetivo e social\n\nPiaget propôs quatro estágios do desenvolvimento cognitivo: sensório-motor, pré-operatório, operatório concreto e operatório formal. Vygotsky destacou a importância do contexto social e da linguagem.\n\nTeorias da aprendizagem:\n- Construtivismo: o aluno constrói o conhecimento.\n- Sociointeracionismo: aprendizagem ocorre na interação social.\n- Behaviorismo: aprendizagem por condicionamento.\n\nImplicações práticas: O professor deve propor situações-problema, incentivar a colaboração e adaptar estratégias conforme o estágio de desenvolvimento.\n\nExemplo: Atividade de resolução de problemas em grupo.\n\nExercício:\n1. Diferencie construtivismo e behaviorismo.\n2. Dê um exemplo de atividade baseada no sociointeracionismo.\n"""
    },
    # ... (adicionar todos os capítulos detalhados conforme estrutura sugerida)
]

# Função para adicionar um capítulo detalhado
def adicionar_capitulo(pdf, capitulo):
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(0, 10, capitulo["titulo"], ln=True, align='C')
    pdf.ln(5)
    pdf.set_font("Arial", '', 12)
    for paragrafo in capitulo["conteudo"].split("\n\n"):
        pdf.multi_cell(0, 8, paragrafo)
        pdf.ln(2)

# Criação do PDF
pdf = FPDF()
pdf.set_auto_page_break(auto=True, margin=15)

# Capa
pdf.add_page()
pdf.set_font("Arial", 'B', 22)
pdf.cell(0, 20, TITULO, ln=True, align='C')
pdf.ln(10)
pdf.set_font("Arial", '', 16)
pdf.cell(0, 10, f"Cargo: {CARGO}", ln=True, align='C')
pdf.cell(0, 10, f"Ano: {ANO}", ln=True, align='C')
pdf.ln(20)
pdf.set_font("Arial", '', 12)
pdf.multi_cell(0, 10, "Material aprofundado para concursos públicos. Apostila completa, com teoria, exemplos, exercícios e dicas para provas.")

# Índice
pdf.add_page()
pdf.set_font("Arial", 'B', 18)
pdf.cell(0, 12, "Índice", ln=True, align='C')
pdf.ln(5)
pdf.set_font("Arial", '', 12)
for idx, cap in enumerate(CAPITULOS, 1):
    pdf.cell(0, 8, f"{idx}. {cap['titulo']}", ln=True)
pdf.ln(10)

# Capítulos detalhados
for capitulo in CAPITULOS:
    adicionar_capitulo(pdf, capitulo)

# Resumo Final
pdf.add_page()
pdf.set_font("Arial", 'B', 16)
pdf.cell(0, 10, "Resumo Final", ln=True, align='C')
pdf.ln(5)
pdf.set_font("Arial", '', 12)
pdf.multi_cell(0, 8, "Esta apostila abordou os principais temas dos Anos Iniciais, com aprofundamento teórico e prático. Revise os pontos-chave e pratique os exercícios para garantir um excelente desempenho em concursos.")

# Referências
pdf.add_page()
pdf.set_font("Arial", 'B', 16)
pdf.cell(0, 10, "Referências", ln=True, align='C')
pdf.ln(5)
pdf.set_font("Arial", '', 12)
pdf.multi_cell(0, 8, "- BRASIL. Lei de Diretrizes e Bases da Educação Nacional (LDB).\n- BNCC - Base Nacional Comum Curricular.\n- PIAGET, J. A psicologia da criança.\n- VYGOTSKY, L. A formação social da mente.\n- FREIRE, P. Pedagogia do Oprimido.\n- Outros autores e materiais didáticos.")

# Salvar PDF
pdf.output("Apostila_Professor_Anos_Iniciais.pdf")
print("PDF gerado com sucesso: Apostila_Professor_Anos_Iniciais.pdf") 