# La Brasa

Projeto de site de pizzaria com frontend estatico e backend basico para cardapio e pedidos.

## Estrutura

```text
La-Brasa/
  frontend/
  backend/
```

## Requisitos

- Node.js instalado
- Python instalado

## Como rodar

### 1. Subir o backend

Abra um terminal na pasta do projeto e rode:

```bash
cd backend
npm install
npm start
```

O backend vai rodar em:

```text
http://localhost:3001
```

### 2. Subir o frontend

Abra outro terminal e rode:

```bash
cd frontend
python -m http.server 5500
```

O frontend vai rodar em:

```text
http://localhost:5500/home.html
```

## Como testar

1. Abra `http://localhost:5500/home.html`
2. Entre na pagina de cardapio
3. Adicione itens ao carrinho
4. Clique em finalizar pedido
5. Preencha nome, whatsapp e CEP
6. Confira se rua, bairro, cidade e UF foram preenchidos automaticamente
7. Informe o numero do endereco
8. Escolha a forma de pagamento
9. Finalize o pedido

## Onde ver os pedidos salvos

Os pedidos ficam salvos em:

```text
backend/data/pedidos.json
```

Tambem podem ser visualizados pela API:

```text
http://localhost:3001/api/pedidos
```

## Rotas da API

- `GET /api/cardapio`
- `GET /api/pedidos`
- `POST /api/pedidos`
- `PUT /api/pedidos/:id/status`

## Observacoes

- O cardapio vem do arquivo `backend/data/cardapio.json`
- Os pedidos sao gravados em `backend/data/pedidos.json`
- O CEP usa a API do ViaCEP para preencher o endereco automaticamente
