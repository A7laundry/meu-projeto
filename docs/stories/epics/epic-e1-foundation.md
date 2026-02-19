# EPIC E1 — Foundation
**Synkra Laundry OS | Wave 1**
**Status:** Draft
**Criado por:** @pm Morgan | 2026-02-18

## Objetivo
Construir a infraestrutura base do sistema: autenticação, multi-tenant (12 unidades), PWA, permissões e estrutura de dados fundamental. Pré-requisito para todos os outros epics.

## User Stories (a criar pelo @sm)
- E1.1 — Setup do projeto Next.js + Supabase + Shadcn/ui
- E1.2 — Sistema de autenticação com perfis (Diretor, Gerente, Funcionário, Loja, Cliente)
- E1.3 — Multi-tenant: isolamento de dados por unidade
- E1.4 — Cadastro de unidades, equipamentos e funcionários
- E1.5 — PWA base: instalável em tablet e celular, offline shell
- E1.6 — Sistema de permissões granulares por módulo e perfil

## Critérios de Conclusão
- [ ] Login funcionando com todos os perfis
- [ ] 12 unidades cadastradas e isoladas
- [ ] App instalável como PWA em tablet Android/iOS
- [ ] Permissões bloqueando acesso indevido

## Dependências
- Nenhuma (é o foundation)

## Épicos que dependem deste
- E2, E3, E4, E5, E6, E7 (todos)
