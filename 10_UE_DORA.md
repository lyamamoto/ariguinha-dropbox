# DORA --- Digital Operational Resilience Act

## Resumo executivo

DORA (UE 2022/2554) é o framework de **resiliência operacional digital**
do setor financeiro europeu. Não decide se BTC é security nem como
stablecoin mantém peg. Pergunta: **a instituição continua operando e se
recupera quando tecnologia falha ou é atacada?**

Para CASPs, MiCA e DORA são complementares.

## 1. Cinco pilares

1.  ICT risk management
2.  incident management/reporting
3.  resilience testing
4.  third-party ICT risk
5.  information sharing/supervisão

## 2. Governança

ICT risk não é responsabilidade isolada do CTO. Management body precisa
entender e supervisionar o framework.

## 3. Identify

Mapear sistemas, dados, processos, owners, dependências, terceiros e
single points of failure.

## 4. Protect

Access management, patching, encryption, network controls, secure
development. Em crypto: key ceremonies, signing policies, withdrawal
limits, API scope, allowlists e secrets management.

## 5. Detect

Detecção rápida é crítica porque withdrawal indevido pode ser
irreversível. Logs devem cobrir aplicação, signing e integrações
externas.

## 6. Response/recovery

Definir quem declara incidente, como trading/withdrawals são
interrompidos, como posições são hedged, RTO/RPO, comunicação e
recuperação.

## 7. Incident reporting

DORA harmoniza classificação e reporte de incidentes relevantes. É
preciso ter dados para classificar severidade rapidamente.

## 8. Testing

Planos precisam ser testados. "Tem backup" é diferente de "restaurou
backup com sucesso".

## 9. Threat-led penetration testing

Entidades abrangidas por requisitos avançados podem realizar testes
baseados em ameaças reais, indo além de scanner automático.

## 10. Third-party risk

Cloud, MPC, node providers, market data, Travel Rule, analytics e
custody tech podem ser críticos. DORA exige gestão durante todo o ciclo
de vida.

## 11. Contratos

Acordos com terceiros precisam tratar segurança, incidentes,
continuidade, auditoria/acesso, dados e exit strategy conforme
aplicável.

## 12. Concentração

Dez aplicações na mesma cloud region continuam sendo uma dependência
única.

## 13. Exit strategy

Se custody provider deixa de operar amanhã, a instituição consegue
migrar chaves, ativos e processos? Vendor lock-in é risco operacional.

## 14. Caso exchange outage

Long spot em venue A, short perp em B; A cai. DORA não escolhe hedge,
mas exige fallback, limites, comunicação, recovery e testes prévios.

## 15. Caso signing compromise

Atacante obtém signing capability. Kill switches, dual control e
incident playbooks precisam existir antes do ataque.

## 16. DORA × MiCA

MiCA: "está autorizado e presta corretamente?"\
DORA: "a máquina operacional sobrevive?"

## 17. Outsourcing

Terceirizar tecnologia não terceiriza accountability.

## 18. Checklist crypto

asset inventory; criticality; wallet architecture; key recovery; BCP/DR;
venue failover; provider concentration; incident playbooks; pentests;
exit plans; audit logs; tabletop exercises.

## 19. Como memorizar

**DORA assume que tecnologia vai falhar e exige preparação prévia.**

## Fontes

-   https://eur-lex.europa.eu/eli/reg/2022/2554/oj
-   https://finance.ec.europa.eu/digital-finance/digital-operational-resilience-act_en
