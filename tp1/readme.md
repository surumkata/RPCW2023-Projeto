# **Relatório RPCW-Projeto 2023**
Gonçalo Afonso - A93178 ; Tiago Silva - A93277 

## **Introdução**
O seguinte documento é referente ao projeto prático da cadeira de RPCW, para o qual foi escolhido o tópico de projeto nº 2, **Inquirições de Génere**.  
Este tinha como propósito a criação de uma interface web que permitisse a navegação sobre o registo destas inquirições, presentes no dataset fornecido pelo docente neste [drive](https://drive.google.com/file/d/1mEPD6bx9wjsuaDkwSZ5qXs1Tdo0CCN6M/view), ou na pasta data do repositório com o nome "PT-UM-ADB-DIO-MAB-006.CSV".  
Estas inquirições são destinadas à prova de ascendência de indíviduos, como forma de registar a sua 'limpeza de sangue' e origens.

### **Objetivos minímos**
* Tratar dataset de modo a carregar para uma bd do mongoDB  
    * Ter atenção às ligações entre registos (inquirições) 
* Criar interface web que permita navegar sobre estes dados
* Permitir criação de novos registos ou edição de existentes
* Permitir navegação sob diferentes campos dos registos, nome do titular, lugar de origem, data do processo
* Permitir fazer posts sobre os registos e comentários sobre estes posts
* Autenticação do sistema
* Pelo menos dois níveis de acesso, admin e consumidor. O admin é quem admite novos registos assim como a todas as outras operações. Consumidor além de consulta de dados e criação de posts, apenas faz sugestões de alterações dos registos ou de criação de novos.



## **Resumo da solução**
A solução foi conseguida com meio aos recursos estudados no decorrer das aulas, mais especificamente, na parte do servidor, a utilização de *express-generator* para o gerar e permitir a organização e gerência mais simplificada e estruturada, assim como o uso de outras ferramentas do *npm* como *passport* e *jwt* para autenticação, entre outras, e o uso de *mongoDB* para a persistência de dados e *mongoose* para permitir a comunicação entre estes e o servidor.

Com a conclusão do trabalho terminamos com uma única base de dados, assim como um único servidor para permitir a funcionalidade da aplicação web. A base de dados é composta por 5 coleções diferentes, sendo apenas a coleção *inquiricoes* respetiva aos dados originais, sendo as restantes povoadas por dados provenientes da utilização da aplicação.

* **inquiricoes**: Guarda os dados das inquirições. Estes dados estão no formato semelhante ao final do tratamento de dados, à exclusão do campo de posts, que é referente aos posts feitos por usuários (guarda a sua ordem correta). Novas inquirições aceites por administradores são também nesta coleção guardadas.
* **editedInquiricoes**: Guarda as sugestões de edições de inquirições feitas por consumidores. Estas incluem alterações a registos pré existentes ou criação de novos registos.
* **users**: Guarda as informações dos utilizadores, como username, email (id de utilizador), caminho para foto de perfil, nível de utiliziador, filiações com inquiridos, etc. .
* **posts**: Guarda os documentos referentes aos posts feitos por utilizadores (post ou comentário).
* **atividades**: Guarda informações simples sobre atividade no sistema, como visita a uma inquirição, realização de um post ou comentário numa inquirição.

A pasta 'app' apresenta a solução do servidor, enquanto que a pasta 'data' apresenta os dados das inquirições, pré e pós processados.  
A pasta 'app' segue a estrutura base resultante do *express-generator*, sendo que o engine escolhido foi o *pug*. 

Pastas extras resultantes foram a 'uploads' para a receção de imagens de perfil de utilizadores ou de inquéritos, 'sessions' para guardar sessões, 'utils' onde temos middleware de controlo de autenticação, assim como guardadas constantes.  
Pasta 'imagens' dentro de 'public', onde são guardadas as imagens enviadas para o servidor, provenientens de uma sugestão de edição de inquirição (temporário), inquirção, de perfil de utilizador, ou default do servidor.  
Pasta 'models' onde estão definidos os diferentes Schemas para os documentos das coleções, e por fim a pasta 'controllers', onde estão definidos métodos de consulta/manipulação destas coleções.  
O ficheiro '.env' guarda os segredos e opções das estratégias externas do *passport*, google e facebook.

## **Dados Iniciais**

Os dados iniciais são compostos por cerca de 34700 inquirições, cada uma composta por 35 campos, alguns deles não relevantes para a aplicação, como por exemplo os 3 diferentes tipos de ID, ou alguns campos que apenas apresentam um tipo de valor. Desta forma, tomando algumas liberdades como por exemplo no caso do ID, explorámos o dataset de forma a extrair a informação mais pertinente deste e cortando a que para nós era desnecessária. Tal foi conseguido com o script *python* 'treat_dataset.py', utilizando a biblioteca *pandas*.  
Realcemos apenas as modificações mais relevantes feitas:
* **ID**: resolvemos utilizar apenas o ID inicial, embora compreendemos que para uma futura expansão natural da aplicação, junção dos dados de diferentes repositórios, nacional ou internacionalmente, esta solução provavelmente tivesse de ser repensada. Este ID disponível é no entanto mais simples para a procura de documentos por parte do utilizador do que o campo *CompleteUnitId*.
* **UnitTitle**: foi retirada a informação dos titulares da inquirição a partir desta coluna, tornando-a numa lista de nomes.
* **RelatedMaterial**: foi retirado do texto deste campo, ligações diretas entre processos, procurando pelo padrão 'Proc.'. Campos deste estilo foram mantidos no dataset de forma a ser possível mostrar a sua informação original na aplicação web.
* **ScopeContent**: foi retirada deste campo: afiliações não diretas do titular (nomes de familiares, sem processo ditado), local de nascimento, concelho e distrito de residência, assim como possíveis outras relações diretas em casos excecionais.
* Colunas com apenas um valor entre todos os registos (ex.: *DescriptionLevel*) foram retiradas, visto serem redundantes.  

Os resultados deste tratamento foram então guardados num ficheiro JSON, disponível na pasta data (dataset.json), que é importado para a coleção inquiricoes e que servirá como base da aplicação.

## **Utilizadores e funcionalidades do sistema**
A nossa solução final é composta, como pedido, por dois tipos de utilizadores. 

O utilizador **normal**, ou **consumidor**, que é capaz de:

* Autenticação por email + palavra passe, google ou facebook (sendo esta apenas uma aplicação de teste, os emails disponíveis para autenticação nestes métodos externos é limitada).
* Consultar inquirções, quer seja através da página principal (paginada e não filtrada, ordenada por UnitID), ou através de uma pesquisa por: nome de titular, local de nascimento, concelho ou distrito de residência e intervalo de tempo do processo.
* Realizar um post sobre uma inquirição, ou fazer um comentário sobre um post previamente realizado.
* Fazer sugestões de edição de inquirição, quer seja apenas alterações numa pré existente, onde os campos de modificação são mais limitados, ou sugerir a criação de uma nova inquirição, onde tem a possibilidade de alterar todos os campos menos o ID.
* Consultar e alterar o seu perfil, podendo alterar a sua foto de perfil, ou alterar as suas filiações por exemplo (possível criar ligação direta).
* Consultar e gerenciar as suas notificações, i.e. ver notificação (de resultado da sugestão - aceite ou não -, comentário feito a um post), eliminar notificação, carregar na notificação para ir para a ligação referente (inquirição) se for o caso.


O utilizador **administrador**, que é capaz de:

* Realizar todas as operações que o utilizador normal, sendo que invés de sugestões, as suas modificações são diretamente aplicadas.
* As suas notificações incluem ainda avisos de novas sugestões de edição submetidas.
* Visualizar uma área de estatísticas das inquirições, que incluí estatístias obtidas através da coleção *atividades*, como as inquirições com mais atividade num dado período de tempo, ou a atividade numa inquirição específica num dado período de tempo.


## **Rotas do sistema**

### **Index**

* **'/'** : Página inicial da aplicação, onde são apresentadas informações básicas sobre as primeiras 100 inquirições da coleção (ordenadas por UnitID). Apresenta paginação de acordo com as inquirções disponíveis da query de pesquisa fornecida. A view extende **header**, uma aba que tem funcionalidades básicas do sistema, como botão para página inicial (com query default), botão de pesquisa (que serve para criar uma query de pesquisa para a rota inicial, que irá usar na procura na coleção (ex.: perído do processo da inquirição, titular)), no caso de user logged tem botão de página de perfil, e de notificações (estas que são pedidas ao servidor do lado do cliente após receber a página), botão de logout e, para admins, botão de página de estatísticas; ou no caso de não haver user logged, botão de login e de registo.
* **'/inquiry/:id'** : Página específica de uma inquirição. A view extende **header**. Tem as informações de uma inquirição, assim como a secção para realizar posts e comentários e botão para redirecionar para a página de edição da inquirição. Os posts são obtidos por parte do servidor através da coleção posts e reconstruídos de acordo com o campo 'posts' da inquirição. Esta rota resulta no registo de uma atividade de visita.
* **'/inquiry/:id/edit'** : Requer autenticação. Página para edição de uma inquirição. A view extende **header**.
* **'/inquiry/:id/edit'** (POST) : Requer autenticação. Envio da sugestão de criação de inquirição para o servidor. Os campos do body da request são lidos de forma específica e processados, de modo que campos extra fornecidos são ignorados. A sugestão é guardada na coleção editedInquiricoes, e os administradores são notificados, no caso de user ser normal. Se o user for administrador, a sugestão é imediatamente aplicada. 
* **'/createInquiry'** (GET e POST) : Funcionamento semelhante à de edição de inquirição, mas para a criação de uma nova inquirição. 
* **'/editedInquiry/accept/:id'** (POST) : Requer nível administrador. Rota para aceitar uma sugestão de edição de inquirição, com id nos parâmetros da request. Editor é notificado do resultado.
* **'/editedInquiry/accept/:id'** (POST) : Semelhante, mas para rejeição.
* **'/editedInquiry/:id'** : Requer nível administrador. Página para vizualizar uma sugestão de edição. A view extende **header**.
* **'/inquiry/post/:id'** (POST) : Requer autenticação. Servidor recebe um post realizado numa inquirição, atualizando a coleçaõ de posts, a inquirição (que guarda a ordem dos posts) e as páginas em que o utlizador realizou posts.
* **'/inquiry/response/:id'** (POST) : Semelhante ao anterior, no entanto é realizada a ligação do comentário com um pai (post original), e é notificado o autor desse pai.
* **'/stats'** : Requer nível administrador. Página de estatísticas do sistema. A view extende **header**. As estísticas são pedidas pelo cliente após a página lhe ter sido enviada (de modo a atender a natural escalabilidade do número de documentos na coleção 'atividades' e permitir adpatar os pedidos de filtragem dos gráficos).
* **'/stats/top'** : Requer nível administrador. Pedido estilo API, de informação das inquirições com mais atividade, de acordo com os filtros passados na query. Resultado devolvido em formato JSON.
* **'/stats/inquiry/:id'** : Semelhante, mas para uma inquirição específica.


### **Users**

* **'/profile'** : Requer autenticação. Página do utilizador, com a sua informação e botão para edição. A view extende **header**.
* **'/editProfile'** : Requer autenticação. Página de edição do utilizador. A view extende **header**.
* **'/editProfile'** (POST) : Requer autenticação. Post de edição de um utilizador, de forma semelhante às inquirições, os campos extra não procurados pelo servidor são ignorados.
* **'/login'** : Página de login de utilizador. Apresenta 3 opções de autenticação, email + password, google e facebook.
* **'/login'** (POST) : Utilizadondo passport, é verificado se o utilizador passado existe e, em caso positivo, é criada uma cookie com informação para autenticação por *jwt* e é redirecionado para a página principal, caso contrário retorna para a págian de login.
* **'/login/google'** : Redirecionamento para autenticação por google, utilizando passport.
* **'/login/google/callback'** : Resultado da autenticação google, onde é criado o token *jwt* e o user é redirecionado para a página inicial.
* **'/login/facebook'** : Semelhante ao caso de google.
* **'/login/facebook/callback'** :  Semelhante ao caso de google.
* **'/register'** : Página de registo de utilizador.
* **'/register'** (POST) : Post de registo de utilizador, onde se faz nova verificação entre as passwords passadas, e é verificado email fornecido para o utilizador (se é único). Em caso de erro o utilizador é redirecionado de volta para a página de registo, senão irá para a página de login.
* **'/logout'** : Requer autenticação. Autenticação do utilizador é removida.
* **'/api/notifications/seen/:id'** : Requer autenticação. Atualiza uma notificação do utilizador, especificada pelo id, para o estado de vista.
* **'/api/notifications/remove/:id'** : Requer autenticação. Remove uma notificação, especificada pelo id, do utilizador.