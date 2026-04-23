import pandas as pd
import json
import argparse
import sys
from pathlib import Path


def parquet_to_json(input_path: str, output_path: str = None, orient: str = "records", indent: int = 2):
    """
    Converte um arquivo Parquet em JSON.

    Args:
        input_path: Caminho do arquivo .parquet de entrada.
        output_path: Caminho do arquivo .json de saída. Se não informado,
                     usa o mesmo nome do arquivo de entrada com extensão .json.
        orient: Formato de orientação do JSON. Opções:
                - "records"  → lista de dicionários [{col: val, ...}, ...]  (padrão)
                - "split"    → {"columns": [...], "index": [...], "data": [...]}
                - "index"    → {index: {col: val, ...}, ...}
                - "columns"  → {col: {index: val, ...}, ...}
                - "values"   → apenas os valores como lista de listas
                - "table"    → formato de tabela com schema e dados
        indent: Indentação do JSON (padrão: 2 espaços).
    """
    input_path = Path(input_path)

    if not input_path.exists():
        print(f"[ERRO] Arquivo não encontrado: {input_path}")
        sys.exit(1)

    if input_path.suffix.lower() != ".parquet":
        print(f"[AVISO] O arquivo '{input_path.name}' não tem extensão .parquet. Tentando ler mesmo assim...")

    # Define o caminho de saída
    if output_path is None:
        output_path = input_path.with_suffix(".json")
    else:
        output_path = Path(output_path)

    print(f"Lendo arquivo Parquet: {input_path}")
    df = pd.read_parquet(input_path)

    print(f"  → {len(df)} linhas | {len(df.columns)} colunas")
    print(f"  → Colunas: {list(df.columns)}")

    print(f"Convertendo para JSON (orient='{orient}')...")
    json_str = df.to_json(orient=orient, indent=indent, force_ascii=False, date_format="iso")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(json_str)

    print(f"Arquivo salvo em: {output_path}")
    print("Conversão concluída com sucesso!")


def main():
    parser = argparse.ArgumentParser(
        description="Converte arquivos Parquet para JSON.",
        formatter_class=argparse.RawTextHelpFormatter,
    )
    parser.add_argument("input", help="Caminho do arquivo .parquet de entrada")
    parser.add_argument(
        "-o", "--output",
        default=None,
        help="Caminho do arquivo .json de saída (opcional)",
    )
    parser.add_argument(
        "--orient",
        default="records",
        choices=["records", "split", "index", "columns", "values", "table"],
        help=(
            "Formato de orientação do JSON (padrão: records):\n"
            "  records → lista de dicionários [{col: val, ...}, ...]\n"
            "  split   → {columns, index, data}\n"
            "  index   → {index: {col: val}}\n"
            "  columns → {col: {index: val}}\n"
            "  values  → lista de listas\n"
            "  table   → schema + dados"
        ),
    )
    parser.add_argument(
        "--indent",
        type=int,
        default=2,
        help="Indentação do JSON em espaços (padrão: 2)",
    )

    args = parser.parse_args()
    parquet_to_json(args.input, args.output, args.orient, args.indent)


if __name__ == "__main__":
    main()
