# S.Q.L. — Setor de Qualificação e Liberação — versão 0.9.0

<p align="center">
  <img src="Emblema SQL_ Setor de Liberação.png" alt="S.Q.L. — Setor de Qualificação e Liberação" width="600">
</p>

Jogo de investigação inspirado em *That's Not My Neighbor*, em clima militar. O jogador é o sentinela do portão de um quartel e usa consultas SQL para verificar identidades, registros e autorizações antes de decidir quem pode entrar.

## Estrutura

```
sql-game/
├── index.html        # tela inicial (tela cheia, rodapé fixo) e seleção de dificuldade
├── game.html         # interface principal da inspeção
├── README.md
├── css/
│   ├── global.css    # reset, variáveis, fundo geral e botões base (compartilhado)
│   ├── home.css      # estilos da tela inicial
│   └── game.css      # estilos da partida, modais, cronômetro e explosão
└── js/
    ├── home.js       # seleção do modo e navegação para o jogo
    ├── portraits.js  # retratos vetoriais (SVG) dos militares
    └── script.js     # regras, banco AlaSQL, terminal, decisões e modais
```

- `portraits.js`: retratos vetoriais (SVG) de 16 militares; quepe, óculos e pele esverdeada seguem o solicitante apresentado.
- `script.js`: regras, banco AlaSQL, consultas, visitantes, decisões, cronômetro de decisão e modais.

## Como executar

Na pasta do projeto, execute:

```bash
python3 -m http.server 5501
```

Acesse `http://localhost:5501` no navegador. A tela inicial abre em `index.html`; após escolher a dificuldade, o jogo abre em `game.html`.

> Se a porta 5501 estiver ocupada, escolha outra, como 5502.

## Regras na partida

Ao entrar em `game.html`, o modal **Como o jogo funciona** abre automaticamente. Depois, o menu hambúrguer à esquerda da pontuação abre o modal **Ações**: Voltar ao jogo, Reiniciar (zera pontos, vidas e turnos e recomeça direto no primeiro turno, no mesmo modo), Ajuda (abre as regras e, ao fechar, volta ao menu) e Sair (volta à home). Os modais fecham com o botão, `Esc` ou clique fora.

## Dificuldades

- **Fácil:** 5 vidas, 5 consultas por visitante e 1 consulta SQL válida diferente para liberar a decisão.
- **Normal:** 3 vidas, 4 consultas por visitante e 2 consultas SQL válidas diferentes.
- **Difícil:** 1 vida, 4 consultas por visitante e 3 consultas SQL válidas diferentes.

A chance de impostores também aumenta conforme a dificuldade.

## Consultas esgotadas e cronômetro

Quando o jogador gasta a última consulta do solicitante, os botões de decisão são liberados imediatamente e um cronômetro de **10 segundos** aparece no painel de decisão. Se nenhuma ação for tomada a tempo, uma **explosão** toma a tela (com tremor) e o modal de derrota no padrão dos demais modais (cabeçalho, corpo, rodapé) mostra a pontuação com os botões **VOLTAR À TELA INICIAL** e **NOVO JOGO**. Todos os modais cobrem a tela e bloqueiam o fundo.

## Tecnologias

HTML5, CSS3, JavaScript e AlaSQL (carregado por CDN). É necessária conexão com a internet para carregar AlaSQL e as fontes externas.

## Observação

O banco é criado em memória no navegador e reiniciado ao iniciar uma nova partida. O terminal permite consultas `SELECT` nas tabelas `militares` (id_doc, nome, alojamento, patente, quepe, oculos, pele), `lista_hoje` e `logs_portao`.
