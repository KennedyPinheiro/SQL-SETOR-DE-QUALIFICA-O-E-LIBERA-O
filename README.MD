# S.Q.L. — Setor de Qualificação e Liberação

## Antes de começar: a proposta

S.Q.L. é um jogo educativo de investigação. A sigla significa **Setor de Qualificação e Liberação**, e a história coloca o jogador no posto de controle de um quartel fictício. A tarefa é decidir se cada solicitante pode entrar, deve ser recusado ou precisa ser encaminhado para uma verificação do comando.

A ideia central é praticar leitura crítica de dados: uma consulta SQL pode confirmar uma informação, revelar uma divergência ou não encontrar nada. Nenhum desses resultados, sozinho, substitui a análise do caso. O jogador compara registros com documentos, aparência, declarações e respostas do visitante. Assim, o jogo busca ensinar SQL junto com uma distinção importante: erro cadastral é motivo para investigar ou encaminhar; não é prova automática de fraude.

O quartel, os cadastros e as decisões são ficcionais. O projeto é um jogo de navegador, não um sistema real de controle de acesso.

## Como a experiência funciona

Nos modos de partida, cada turno apresenta um solicitante. O jogador observa seu retrato, lê a declaração inicial, confere a identidade quando ela é apresentada e consulta as informações disponíveis. No modo Clássico, também pode investigar com SQL; nos dois modos de partida, pode fazer perguntas, consultar o rádio e abrir o arquivo do efetivo. Ao final, escolhe uma entre três ações: autorizar, negar a entrada ou encaminhar o caso.

Os casos são gerados a partir de militares cadastrados e podem trazer combinações diferentes de sinais. Um militar legítimo pode ter uma irregularidade nos registros e precisar de revisão. Um impostor pode ter dados que parecem corretos, mas apresentar documento, alojamento ou aparência incompatível. O objetivo é cruzar indícios e tomar uma decisão proporcional ao que foi encontrado.

## Modos de jogo

### Clássico — investigação completa

O modo Clássico é a experiência principal de controle de acesso. O jogador recebe um solicitante por turno e usa o terminal SQL como ferramenta de investigação, junto da observação visual, da identidade, da declaração, das perguntas, do rádio e do arquivo do efetivo. As consultas ajudam a verificar documentos, autorização para o dia, registros de entrada, responsáveis, horários, setores e movimentações.

O jogador não precisa provar que alguém é impostor para perceber que há algo a revisar. Quando o visitante é legítimo, mas seus dados apresentam uma inconsistência, a resposta adequada é encaminhar ao comando. Quando as evidências apontam para uma tentativa de fraude, a decisão é negar a entrada. Um militar sem irregularidades pode ser autorizado. Uma decisão errada custa uma vida, e investigações incompletas podem reduzir a pontuação.

O modo tem eventos temporários que alteram as condições de alguns turnos. Por exemplo, uma falha temporária pode bloquear o SQL, uma inspeção surpresa pode exigir outra consulta direcionada e um visitante prioritário pode impor um prazo menor. Os eventos não substituem as decisões do jogador; eles mudam a pressão ou a informação disponível.

### Falha do Sistema — decisão sem SQL

O modo Falha do Sistema é uma partida de contingência: o evento de pane começa ativo no primeiro turno e permanece ativo durante toda a partida. O terminal fica bloqueado, então o jogador precisa tomar decisões sem consultar o banco. Não há sorteio de outros eventos nesse modo.

A investigação passa a depender do retrato, da identidade apresentada, da declaração e das quatro perguntas disponíveis para cada visitante. O jogador também pode consultar o rádio e o arquivo do efetivo. As respostas às perguntas variam conforme o caso e devem ser comparadas com as informações já visíveis; perguntar não registra uma evidência automaticamente.

As três dificuldades continuam disponíveis, mas aqui elas alteram somente a quantidade de vidas: Fácil oferece cinco, Normal oferece três e Difícil oferece uma. A chance-base de impostor é fixa neste modo. Como o SQL está indisponível, não há objetivo de consultas a cumprir nem penalidade por investigação SQL incompleta.

### Prática SQL — laboratório livre

Prática SQL é um ambiente separado da partida. Não há visitantes, eventos, vidas, pontuação ou decisões de acesso. A finalidade é explorar tabelas e escrever consultas sem a pressão de um turno.

O banco começa com cinco tabelas didáticas de logística. O explorador organiza as informações em acordeões — banco, tabela e coluna — e permite preparar consultas iniciais a partir de uma tabela ou coluna. O editor aceita scripts em lote no dialeto AlaSQL, e os resultados podem ser redimensionados ou ocultados. O histórico mantém as últimas 50 instruções executadas no `localStorage` deste navegador; ele é específico para o endereço e navegador em uso.

É possível importar arquivos CSV ou TSV com cabeçalho e arquivos JSON como tabelas consultáveis. Os nomes dos arquivos são usados como agrupamentos visuais no explorador; as tabelas importadas ficam disponíveis no mesmo ambiente AlaSQL da sessão. Também é possível carregar um script `.sql` no editor para revisar e executar manualmente, ou exportar o texto atual do editor. Os dados e tabelas da sessão são reiniciados ao recarregar a tela ou restaurar o banco. Este modo não é um servidor SQLite e não importa diretamente arquivos binários `.db` ou `.sqlite`.

## Como iniciar

O projeto roda no navegador e não precisa de etapa de build. Na pasta do projeto, inicie um servidor local:

```bash
python3 -m http.server 55000
```

Abra `http://localhost:5500` e selecione um dos três modos na Home. Clássico e Falha do Sistema oferecem as dificuldades Fácil, Normal e Difícil. Prática SQL não usa dificuldade.

O navegador precisa de acesso à internet para carregar AlaSQL e as fontes do Google Fonts via CDN. O banco da partida é criado em memória quando uma nova partida começa. Configurações e histórico da Prática SQL são armazenados localmente no navegador.

## Um turno de investigação

1. **Observe e leia:** compare o retrato, a declaração inicial e a identidade militar. Quando o visitante diz que está sem documento, a identidade não é apresentada e o jogador pode usar as informações fornecidas para investigar.
2. **Pergunte:** há quatro perguntas por solicitante: documento, alojamento, aparência e autorização. Cada pergunta pode ser usada uma vez. A resposta aparece no campo **Declaração do solicitante** como uma fala, que deve ser comparada com os outros dados.
3. **Consulte os recursos:** no Clássico, use SQL para investigar as cinco tabelas disponíveis. Nos dois modos de partida, o rádio e o arquivo do efetivo ajudam a confirmar informações. No modo Falha, o terminal SQL fica bloqueado.
4. **Cruze os indícios:** aparência diferente, documento divergente, falta de autorização ou inconsistência de responsável, setor, horário e movimentação podem apontar para situações distintas. As perguntas oferecem declarações; as consultas SQL confirmam ou contradizem cadastros.
5. **Decida:** autorize um militar sem irregularidades, negue a entrada quando houver evidências de fraude ou encaminhe divergências cadastrais ao comando. Uma inconsistência cadastral, por si só, não prova que a pessoa é impostora.

## SQL no modo Clássico

O terminal da partida aceita uma consulta `SELECT` por execução e somente as cinco tabelas do jogo. Uma consulta válida consome uma tentativa; texto vazio, SQL inválido ou erro de execução não consome. Para executar, use o botão ou `Ctrl + Enter`.

A barra de progresso conta **pesquisas direcionadas**, não evidências. Para avançar, a consulta precisa filtrar por uma informação do solicitante — como documento, nome ou alojamento — e usar uma combinação de tabelas ainda não investigada. Consultas amplas ou repetidas podem consumir uma tentativa sem avançar a barra. Mudar colunas, espaços ou capitalização não transforma a mesma combinação de fontes em uma nova pesquisa.

O painel de suspeita acompanha separadamente as evidências únicas encontradas e a suspeita acumulada. Uma pesquisa direcionada pode avançar o progresso sem encontrar uma evidência; uma saída vazia também pode ser relevante, dependendo da consulta. O bônus de investigação completa considera todas as evidências esperadas para o caso, inclusive cada irregularidade de um caso com múltiplas inconsistências.

Você pode decidir quando alcançar o número de pesquisas exigido pela dificuldade ou quando esgotar as tentativas. Se as tentativas acabarem antes de atingir o objetivo, há dez segundos para tomar a decisão; deixar o prazo terminar encerra a partida por falha.

## Dificuldades

| Nível | Vidas | Tentativas SQL por solicitante | Pesquisas direcionadas exigidas | Chance-base de impostor no Clássico |
| --- | ---: | ---: | ---: | ---: |
| Fácil | 5 | 5 | 1 | 28% |
| Normal | 3 | 4 | 2 | 45% |
| Difícil | 1 | 4 | 3 | 62% |

No modo Falha do Sistema, as dificuldades oferecem respectivamente cinco, três e uma vida. A chance-base de impostor fica em 45% nos três níveis desse modo.

## Banco do modo Clássico

O banco do jogo usa AlaSQL no navegador e começa com 16 militares cadastrados. Suas tabelas são:

| Tabela | Colunas |
| --- | --- |
| `militares` | `id_doc`, `nome`, `alojamento`, `patente`, `quepe`, `oculos`, `pele` |
| `lista_hoje` | `id_doc`, `autorizado` |
| `logs_portao` | `id_doc`, `status_atual` |
| `autorizacoes` | `id_doc`, `responsavel`, `horario`, `setor`, `motivo` |
| `movimentacoes` | `id_doc`, `local`, `horario`, `atividade` |

Exemplo de consulta:

```sql
SELECT nome, alojamento, patente
FROM militares
WHERE id_doc = '8841-FM';
```

O banco didático de Prática SQL é independente e usa outro esquema: `pessoal`, `equipamentos`, `ordens_servico`, `suprimentos` e `movimentacoes_suprimentos`.

## Pontuação e fim de partida

- Autorizar corretamente um militar legítimo rende 100 pontos-base. Há até 50 pontos de bônus de verificação, conforme a suspeita acumulada.
- Negar corretamente a entrada de um impostor rende 150 pontos-base. A suspeita pode dar até 100 pontos adicionais; encontrar todas as evidências esperadas do caso concede mais 100.
- Encaminhar corretamente uma irregularidade cadastral rende 100 pontos-base, com os mesmos bônus de suspeita e investigação completa.
- Decidir sem atingir o objetivo de pesquisas SQL desconta 50 pontos no modo Clássico.
- Uma decisão incorreta custa uma vida. Perder todas as vidas encerra a partida.
- Quando as tentativas SQL acabam, deixar o prazo de decisão de dez segundos terminar também encerra a partida.

## Eventos do modo Clássico

Quando não há evento ativo, há 35% de chance de iniciar um evento por turno. Uma partida começa sem evento; os sorteios podem ocorrer nos turnos seguintes. Eventos temporários duram de dois a quatro turnos.

- **Alerta de segurança:** restringe temporariamente as informações do painel de suspeita.
- **Falha no sistema:** bloqueia temporariamente as consultas SQL; as opções de decisão permanecem disponíveis.
- **Inspeção surpresa:** acrescenta uma consulta direcionada ao objetivo do turno.
- **Visitante prioritário:** dá 15 segundos para decidir.
- **Ordem do comando:** destaca a área de decisão e mostra uma notificação, sem mudar as regras de autorização.

## Interface e configurações

A Home e a partida usam uma interface de terminal militar com efeitos visuais e sonoros. A Home permite escolher modo e dificuldade; na partida, o menu oferece retorno ao jogo, reinício, configurações, ajuda e saída. A ajuda apresenta regras ajustadas ao modo selecionado.

As configurações controlam efeitos sonoros, música ambiente, volumes, animações e o efeito de folhas da Home. O sistema também respeita a preferência de movimento reduzido do navegador ou sistema operacional.

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

`index.html`, `game.html` e `practice.html` carregam as páginas ativas. `js/script.js` é um backup legado e não é carregado por essas páginas; as regras atuais da partida ficam nos módulos listados acima.
