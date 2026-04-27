# Scripts

Utilitários Python que o Devin usa para tarefas pontuais. Você também pode rodar localmente.

## Disponíveis

### `validate_links.py`
Valida wikilinks e links markdown relativos. Ignora `templates/`, `80-archive/`, `scripts/`, `docs/`, `70-career/`, e pastas hidden.

```bash
python3 scripts/validate_links.py
```

### `check_freshness.py`
Encontra notas paradas há muito tempo.

```bash
python3 scripts/check_freshness.py stakeholders 60
python3 scripts/check_freshness.py projects 14
python3 scripts/check_freshness.py adrs 30
```

## Por que Python e não Dataview?

Dataview cuida de visualização **dentro do Obsidian**. Estes scripts cuidam de:
- Validações que você quer rodar antes de commit
- Inputs estruturados para o Devin (ex: lista de stakeholders frios para o weekly review)
- Coisas que você quer no terminal, não na UI

Os dois coexistem sem conflito.
