"""Generate the etched-portrait set via OpenRouter's Gemini image model.

One portrait per published figure, per the design system's portrait brief
(.claude/skills/symposium-design/assets/portrait-brief.md): 19th-century
stipple etching, sepia ink on warm cream, head and shoulders, uniform series.

Usage:
  venv python scripts/generate_portraits.py            # all figures missing a portrait
  venv python scripts/generate_portraits.py --figure aurelius --force
"""
import argparse
import base64
import json
import sys
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from config import settings

OUT_DIR = Path("frontend/public/portraits")
MODEL = "google/gemini-2.5-flash-image"

TEMPLATE = (
    "Engraved portrait of {desc}, 19th-century stipple etching style, fine hatched "
    "linework, single dark sepia ink on warm cream paper (#f7f5f0), head and shoulders, "
    "facing slightly off-axis, neutral thoughtful expression, plain background, "
    "no border, no signature, no text."
)

# Reference looks per figure (brief's table, extended to the full roster).
LOOKS = {
    "aurelius": "Marcus Aurelius, Roman emperor, classical bust likeness with curled beard",
    "caesar": "Julius Caesar, Roman general, classical bust likeness, laurel-free, strong profile",
    "churchill": "Winston Churchill, elderly statesman, bowtie, resolute jowled face",
    "confucius": "Confucius, ancient Chinese philosopher, long thin beard, traditional robe",
    "darwin": "Charles Darwin, elderly naturalist with full white beard",
    "disney": "Walt Disney, 1950s showman, neat mustache, warm smile, suit",
    "douglass": "Frederick Douglass, mid-life, swept-back hair, formal coat",
    "einstein": "Albert Einstein, older physicist, unruly hair and mustache",
    "elon": "Elon Musk, contemporary engineer-entrepreneur, short hair, slight smile",
    "franklin": "Benjamin Franklin, spectacles, balding with long side hair",
    "gandhi": "Mahatma Gandhi, round spectacles, shaved head, simple shawl",
    "jacobs": "Harriet Jacobs, 19th-century woman, center-parted hair, modest dress",
    "keller": "Helen Keller, hair in a low bun, serene expression, early 1900s dress",
    "machiavelli": "Niccolo Machiavelli, Renaissance statesman, dark cap and robe, sharp features",
    "mrbeast": "MrBeast (Jimmy Donaldson), young man with short beard, casual crew-neck",
    "napoleon": "Napoleon Bonaparte, bicorne-free, side-swept hair, high military collar",
    "nietzsche": "Friedrich Nietzsche, huge drooping mustache, swept-back hair",
    "nightingale": "Florence Nightingale, Victorian nurse, hair parted under a simple cap",
    "obama": "Barack Obama, contemporary statesman, close-cropped hair, calm smile",
    "plato": "Plato, ancient Greek philosopher, classical bust likeness, broad brow, full beard",
    "rogan": "Joe Rogan, shaved head, compact build, direct gaze",
    "roosevelt": "Franklin D. Roosevelt, pince-nez glasses, confident smile, 1930s suit",
    "spinoza": "Baruch Spinoza, 17th-century philosopher, shoulder-length dark hair, white collar",
    "suntzu": "Sun Tzu, ancient Chinese general, topknot, thin beard, armor collar",
    "tesla": "Nikola Tesla, gaunt elegant inventor, center-parted dark hair, thin mustache",
    "thoreau": "Henry David Thoreau, chin-strap beard, unruly hair, plain coat",
    "trump": "Donald Trump, contemporary statesman, distinctive swept hair, suit and tie",
    "truth": "Sojourner Truth, elderly, white cap and shawl, spectacles, dignified",
    "twain": "Mark Twain, wild white hair and full mustache, white suit",
    "wollstonecraft": "Mary Wollstonecraft, 18th-century woman, loose curled hair, high-waisted dress",
}


def generate(figure_id: str, desc: str) -> bool:
    prompt = TEMPLATE.format(desc=desc)
    req = urllib.request.Request(
        settings.openrouter_base_url + "/chat/completions",
        data=json.dumps({
            "model": MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "modalities": ["image", "text"],
        }).encode(),
        headers={"Authorization": f"Bearer {settings.openrouter_api_key}",
                 "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=180) as resp:
        data = json.loads(resp.read())
    images = data["choices"][0]["message"].get("images") or []
    if not images:
        print(f"  {figure_id}: no image returned")
        return False
    b64 = images[0]["image_url"]["url"].split(",", 1)[1]
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / f"{figure_id}.png").write_bytes(base64.b64decode(b64))
    print(f"  {figure_id}: ok")
    return True


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--figure")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    targets = {args.figure: LOOKS[args.figure]} if args.figure else LOOKS
    done = failed = skipped = 0
    for fid, desc in targets.items():
        if not args.force and (OUT_DIR / f"{fid}.png").exists():
            skipped += 1
            continue
        try:
            done += generate(fid, desc)
        except Exception as exc:
            failed += 1
            print(f"  {fid}: FAILED {str(exc)[:120]}")
    print(f"portraits: {done} generated, {skipped} skipped, {failed} failed")


if __name__ == "__main__":
    main()
