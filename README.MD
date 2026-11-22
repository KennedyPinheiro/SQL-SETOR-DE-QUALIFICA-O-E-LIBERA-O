# S.Q.L. — Setor de Qualificação e Liberação

Jogo de investigação e controle de acesso com temática militar. Você assume o posto de sentinela de um quartel: observa o solicitante, confere sua declaração e seus documentos, investiga os registros com SQL e decide se autoriza ou nega a entrada.

## Como executar

O jogo roda no navegador e não precisa de etapa de build. Na pasta do projeto, inicie um servidor local:

```bash
python3 -m http.server 5501
```

Abra `http://localhost:5501` e escolha uma modalidade:

- **Prática SQL:** abre `practice.html`, com banco didático próprio, editor em tela ampla, explorador hierárquico em acordeão (banco → tabela → coluna), resultados e histórico local das instruções SQL executadas. O histórico fica no `localStorage` do navegador. Importa dados CSV, TSV e JSON como tabelas consultáveis, aceita carregar scripts `.sql` no editor e exportá-los. Editor e resultados compartilham um painel; a divisória ajusta o espaço de cada área e os resultados podem ser ocultados e reabertos. Não usa as tabelas da partida nem tem visitantes, eventos, vidas ou pontuação.
- **Falha do Sistema:** abre a partida com o evento de falha ativo em todos os turnos. O terminal SQL fica bloqueado; o jogador decide usando identidade, retrato, declaração, perguntas, rádio e arquivo do efetivo.
- **Clássico:** mantém o ciclo atual de inspeção, investigação SQL e decisão.

Clássico e Falha do Sistema oferecem Fácil, Normal e Difícil. No modo Falha, a dificuldade muda apenas as vidas: 5, 3 ou 1.

O navegador precisa de acesso à internet para carregar AlaSQL e as fontes do Google Fonts via CDN. Os dados do jogo são criados em memória e reiniciados ao iniciar uma nova partida.

## Ciclo clássico

1. **Inspecione o solicitante:** compare o retrato, a declaração e a identidade militar. Se ele disser que está sem documento, a identidade não é apresentada.
2. **Faça perguntas:** há quatro perguntas predefinidas por solicitante — documento, alojamento, aparência e autorização. Cada uma só pode ser feita uma vez. As respostas variam e aparecem em **Declaração do solicitante**; são afirmações a comparar com os dados, não evidências automáticas.
3. **Investigue com SQL:** consulte os registros do efetivo, autorizações, lista do dia, portão e movimentações. O terminal aceita uma consulta `SELECT` por execução.
4. **Compare os dados:** use também o rádio para chamar o alojamento e o arquivo do efetivo para consultar os alojamentos cadastrados.
5. **Decida:** autorize militares sem irregularidades, negue visitantes com sinais de identidade falsa ou encaminhe divergências nos registros ao comando para confirmação. Uma inconsistência cadastral, sozinha, não prova fraude. Uma decisão incorreta custa uma vida.

O painel de suspeita registra evidências únicas confirmadas por consultas SQL. As perguntas fornecem declarações do visitante para comparar com o cadastro. Entre as irregularidades investigáveis estão documento ou alojamento divergente, anomalias visuais, duplicidade no portão, falta de autorização, responsável inexistente, setor divergente, horário inconsistente e incompatibilidade entre autorização e movimentação.

## Consultas e progresso

O terminal permite consultar as cinco tabelas descritas abaixo. Cada execução SQL válida consome uma tentativa; consultas vazias, inválidas ou com erro não são executadas. A saída mostra o resultado mais recente.

O progresso SQL conta pesquisas direcionadas por combinações de tabelas ainda não investigadas. A consulta precisa filtrar por um dado apresentado pelo solicitante, como documento, nome ou alojamento; uma busca direcionada sem resultados também pode avançar. Consultas sem filtro e novas consultas às mesmas fontes consomem uma tentativa, mas não avançam, mesmo que mudem as colunas, espaços ou capitalização do SQL. Essa barra mede pesquisas realizadas, não evidências encontradas.

O painel de suspeita mostra separadamente a quantidade de evidências únicas confirmadas por SQL e os pontos de suspeita acumulados. Uma pesquisa pode avançar a barra de progresso sem revelar uma evidência.

A decisão fica disponível ao atingir a quantidade de consultas exigida pela dificuldade ou ao esgotar as tentativas. Quando as tentativas acabam, começa um prazo de **10 segundos** para decidir; se o tempo terminar, ocorre a sequência de derrota.

## Dificuldades

| Nível | Vidas | Consultas por solicitante | Consultas relacionadas exigidas | Chance-base de impostor aleatório |
| --- | ---: | ---: | ---: | ---: |
| Fácil | 5 | 5 | 1 | 28% |
| Normal | 3 | 4 | 2 | 45% |
| Difícil | 1 | 4 | 3 | 62% |

No modo **Falha do Sistema**, as dificuldades oferecem respectivamente **5, 3 e 1 vida**. As consultas permanecem bloqueadas em todos os turnos, sem penalidade por investigação incompleta.

## Banco de dados

O banco usa AlaSQL no navegador e é recriado a cada partida. Ele começa com 16 militares cadastrados.

| Tabela | Colunas |
| --- | --- |
| `militares` | `id_doc`, `nome`, `alojamento`, `patente`, `quepe`, `oculos`, `pele` |
| `lista_hoje` | `id_doc`, `autorizado` |
| `logs_portao` | `id_doc`, `status_atual` |
| `autorizacoes` | `id_doc`, `responsavel`, `horario`, `setor`, `motivo` |
| `movimentacoes` | `id_doc`, `local`, `horario`, `atividade` |

O modo **Prática SQL** usa um banco separado, com dados didáticos de logística. As tabelas são `pessoal` (matrícula, nome, patente, setor e alojamento), `equipamentos` (equipamento, tipo, setor e condição), `ordens_servico` (responsável, equipamento, prioridade e status), `suprimentos` (categoria, quantidade e estoque mínimo) e `movimentacoes_suprimentos` (item, responsável, tipo e quantidade). Os exemplos de `JOIN` e `GROUP BY` usam esse esquema de treino. O editor executa scripts em lote no navegador com AlaSQL, permite importar e exportar `.sql` e lista tabelas criadas durante a sessão. A compatibilidade depende do dialeto suportado por AlaSQL; não é um servidor SQLite nem um banco remoto. Use **RESTAURAR BANCO** para voltar às cinco tabelas iniciais.

Exemplo:

```sql
SELECT nome, alojamento, patente
FROM militares
WHERE id_doc = '8841-FM';
```

## Pontuação e fim de partida

- Autorizar um militar legítimo corretamente rende **100 pontos-base**. Com índice de suspeita zero, há **50 pontos adicionais**; com índice até 20, há **25 pontos adicionais**.
- Identificar um infiltrado corretamente rende **150 pontos-base**. Evidências acumuladas podem render bônus de até **100 pontos**; descobrir todas as evidências esperadas do caso concede mais **100 pontos**.
- Encaminhar corretamente um militar real com registros inconsistentes rende **100 pontos-base**. O índice de suspeita e a identificação de todas as evidências do caso também podem conceder bônus.
- Decidir antes de cumprir o objetivo de consultas desconta **50 pontos**.
- Uma decisão incorreta desconta **uma vida**. Ao perder todas as vidas, a partida termina.
- Deixar o prazo de decisão de 10 segundos acabar aciona a sequência de derrota.

## Eventos

Há **35% de chance** de surgir um evento quando não há outro ativo. O primeiro turno de uma partida nova começa sem evento; os sorteios começam nos turnos seguintes. Os eventos duram de dois a quatro turnos, conforme o evento.

- **Alerta de segurança:** restringe temporariamente a leitura do painel de suspeita.
- **Falha no sistema:** bloqueia consultas SQL durante o evento; autorizar, negar e encaminhar continuam disponíveis.
- **Inspeção surpresa:** exige uma consulta direcionada adicional, usando uma combinação de tabelas ainda não investigada.
- **Visitante prioritário:** inicia um prazo de 15 segundos para decidir. Esse prazo substitui o cronômetro comum de 10 segundos; o tempo esgotado custa uma vida.
- **Ordem do comando:** destaca temporariamente o painel de decisão e mostra uma notificação; não altera as regras de autorização.

## Interface e configurações

A home e a partida usam uma interface de terminal militar, com efeitos de radar, câmera, rádio e alertas. As configurações permitem ajustar efeitos sonoros, música ambiente e seus volumes, animações da interface e folhas decorativas da home. A preferência de movimento reduzido do sistema também desativa animações e transições.

A ajuda abre automaticamente no começo da partida. O menu oferece retorno ao jogo, reinício, configurações, ajuda e saída para a home. Os modais podem ser fechados pelo botão, por `Esc` ou clicando fora, quando aplicável.

## Estrutura do projeto

```text
sql-game/
├── index.html
├── game.html
├── practice.html
├── README.MD
├── css/
│   ├── global.css
│   ├── home.css
│   ├── game.css
│   ├── practice.css
│   └── leaves.css
└── js/
    ├── game.js
    ├── practice.js
    ├── settings.js
    ├── portraits.js
    ├── sounds.js
    ├── ambient.js
    ├── leaves.js
    ├── core/
    │   ├── game-state.js
    │   ├── database.js
    │   └── utils.js
    ├── systems/
    │   ├── visitor.js
    │   ├── suspicion.js
    │   ├── sql.js
    │   ├── decision.js
    │   ├── events.js
    │   └── timer.js
    └── interface/
        ├── visitor-ui.js
        ├── hud.js
        ├── suspicion-ui.js
        ├── modals.js
        └── building.js
```

`index.html` e `game.html` carregam os módulos ativos diretamente. `js/script.js` é um backup legado e não é carregado por essas páginas; as regras atuais estão nos módulos listados acima.
