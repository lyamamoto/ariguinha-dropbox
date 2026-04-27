---
title: Recursos
created: 2026-04-27
updated: 2026-04-27
tags: [index, resources]
---

# 📖 Recursos

Frameworks, livros, artigos, documentação interna, aprendizados.

## Recentes

```dataview
TABLE resource_type AS "Tipo", source AS "Fonte", applied_in AS "Aplicado em"
FROM "40-resources"
SORT updated DESC
LIMIT 20
```

## Por categoria

### Frameworks e modelos mentais
```dataview
LIST
FROM "40-resources"
WHERE resource_type = "framework"
```

### Livros
```dataview
LIST author
FROM "40-resources"
WHERE resource_type = "book"
SORT updated DESC
```

### Artigos e papers
```dataview
LIST source
FROM "40-resources"
WHERE resource_type = "article"
SORT updated DESC
LIMIT 15
```

### Documentação interna
```dataview
LIST
FROM "40-resources"
WHERE resource_type = "internal"
```

### Ferramentas
```dataview
LIST
FROM "40-resources"
WHERE resource_type = "tool"
```

### Aprendizados de experiência (lessons learned)
```dataview
LIST
FROM "40-resources"
WHERE resource_type = "learning"
SORT updated DESC
```

## Recursos mais aplicados

```dataview
TABLE length(applied_in) AS "Vezes aplicado"
FROM "40-resources"
WHERE applied_in AND length(applied_in) > 0
SORT length(applied_in) DESC
```
