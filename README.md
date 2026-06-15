# Desterro Tracker

Plataforma de **monitoramento logístico em tempo real** para a **Desterro Transportes** —
transportadora rodoviária de metais (chapas e bobinas) e chapas de MDF, com frota agregada.

> Aplicação SaaS de demonstração: roda 100% no navegador, com um motor de
> simulação que move caminhões, atualiza ETAs e dispara alertas em tempo real —
> sem necessidade de banco de dados ou chaves de API.

## ✨ Funcionalidades

| Módulo | Descrição |
| --- | --- |
| **Dashboard Executivo** | KPIs, mapa nacional em tempo real, gráficos de desempenho e distribuição por região. |
| **Monitoramento de Frota** | Mapa interativo, posição/velocidade/status dos veículos, filtros por região e histórico. |
| **Gestão de Cargas** | Cadastro completo (origem, destino, tipo, peso, cliente) e ciclo de status. |
| **Gestão de Motoristas** | Ficha completa, disponibilidade, última localização e histórico de viagens. |
| **Oportunidades** | Sugestão automática e ranking dos motoristas mais próximos de cada carga (Haversine). |
| **Central de Rastreamento** | Caminhão responsável, rota percorrida, ETA e timeline de eventos por carga. |
| **Alertas** | Caminhão parado, desvio de rota, atraso, sem atualização e manutenção preventiva. |

## 🧰 Tecnologias

- **React + TypeScript** (Vite)
- **TailwindCSS** + componentes no estilo shadcn/ui
- **Leaflet + OpenStreetMap** (mapas, sem chave de API)
- **Recharts** (gráficos)
- **Zustand** (estado global + motor de tempo real)
- **lucide-react** (ícones)

## 🚚 Dados de demonstração

Gerados automaticamente: **30 motoristas**, **50 caminhões** e **100 cargas**,
distribuídos por polos logísticos de todas as regiões do Brasil.

## ▶️ Como executar

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

Use o botão **Pausar / Retomar** na barra superior para controlar o motor de tempo real.

## 🏗️ Build de produção

```bash
npm run build
npm run preview
```

## 🎨 Identidade visual

Tema corporativo **azul-marinho escuro + laranja**, layout responsivo e
visualização de mapas em destaque.
