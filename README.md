# rpcw_tp

Proposta 2: Inquirições de Génere

O que são

“Processos necessários para a ordenação dos párocos. Consistem na inquirição de testemunhas para comprovar a filiação, reputação, bom nome ou "limpeza de sangue" do requerente.
Incluem os seguintes documentos: requerimento inicial, carta de comissão, inquirições de genere a testemunhas e declarações dos párocos.
Estão incluídos nesta série processos de Justificação de Fraternidade que são requeridos quando há, na família, alguém ordenado e com inquirição de genere elaborada e concluída.”
http://pesquisa.adb.uminho.pt/details?id=1193713
Arquivo Distrital de Braga / Universidade do Minho

Objetivos

Analisar o dataset fornecido e tratá-lo de modo a carregá-lo no MongoDB:
Ter especial cuidado com o campo “Scope and Content”, há dados de relações genealógicas que se pretendem materializar em relações entre registos sempre que possivel.
Criar uma interface web de navegação nestes registos, especial atenção à navegação pelas relações entre registos;
Permitir adicionar novos registos;
Ter a possibilidade de navegar por nome (índice antroponímico), por lugar (índice toponímico) e data (índice cronológico);
Permitir que um utilizador edite a informação de um registo:
Podendo acrescentar novas relações entre registos.
Permitir que um utilizador faça um Post sobre um registo;
Permitir que os outros utilizadores comentem Posts;
E o que a imaginação ditar...

Utilizadores
O sistema deverá estar protegido com autenticação: username+password, chaveAPI, google, facebook, ...
Deverão existir pelo menos 2 níveis de acesso:
Administrador - tem acesso a todas as operações;
Consumidor - pode consultar, fazer posts e sugerir alterações;
Dados sobre o utilizador a guardar (sugestão):
nome, email, filiação (estudante, docente, curso, departamento, ...), nível (administrador, produtor ou consumidor), dataRegisto (registo na plataforma), dataUltimoAcesso, password, outros campos que julgue necessários...

Dataset
Disponível online: https://drive.google.com/file/d/1mEPD6bx9wjsuaDkwSZ5qXs1Tdo0CCN6M/view?usp=sharing
