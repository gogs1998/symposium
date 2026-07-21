"""Seed the v2 registry from v1's hardcoded figures (scripts/legacy_figures.py).
All figures land as drafts: v1 prompts are placeholders until the Plan 2
persona generator re-derives them from each corpus."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))
sys.path.insert(0, str(Path(__file__).parent))

import registry
from legacy_figures import FIGURE_REGISTRY


def seed(conn) -> int:
    count = 0
    for figure_id, fig in FIGURE_REGISTRY.items():
        try:
            registry.get_figure(conn, figure_id)
            continue  # already seeded
        except registry.FigureNotFound:
            pass
        registry.create_figure(
            conn,
            id=figure_id,
            name=fig.name,
            type="historical",
            description=fig.description,
            metadata={"era": fig.era, "fields": fig.fields, "categories": fig.categories},
            persona_prompt=fig.system_prompt,
        )
        count += 1
    return count


if __name__ == "__main__":
    from config import settings
    from db import connect, init_db
    conn = connect(settings.db_path)
    init_db(conn)
    print(f"Seeded {seed(conn)} figures as drafts")
