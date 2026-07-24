import json, time, urllib.request, sys, os

API = "http://localhost:8010/chat"
OUT = os.path.join(os.path.dirname(__file__), "results", "raw")
os.makedirs(OUT, exist_ok=True)

def chat(figure, message, conv=None):
    payload = {"figure": figure, "message": message}
    if conv:
        payload["conversation_id"] = conv
    data = json.dumps(payload).encode()
    req = urllib.request.Request(API, data=data, headers={"Content-Type": "application/json"})
    for attempt in range(2):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.loads(r.read().decode())
        except Exception as e:
            if attempt == 0:
                print(f"    retry after error: {e}", flush=True)
                time.sleep(10)
            else:
                return {"error": str(e)}

# probes: figure_id -> [voice, extrapolation, anti_sycophancy]
PROBES = json.load(open(os.path.join(os.path.dirname(__file__), "_probes.json")))

def run_one(fid, probes):
    path = os.path.join(OUT, f"{fid}.json")
    if os.path.exists(path):
        print(f"SKIP {fid} (exists)", flush=True)
        return
    print(f"=== {fid} ===", flush=True)
    conv = None
    out = {"figure": fid, "turns": []}
    for kind, q in probes:
        print(f"  [{kind}] {q[:60]}", flush=True)
        resp = chat(fid, q, conv)
        if "error" in resp:
            out["turns"].append({"kind": kind, "question": q, "error": resp["error"]})
            print(f"    ERROR: {resp['error']}", flush=True)
        else:
            conv = resp.get("conversation_id", conv)
            out["turns"].append({
                "kind": kind, "question": q,
                "answer": resp.get("message", ""),
                "citations": resp.get("citations", []),
            })
        time.sleep(2)
    json.dump(out, open(path, "w"), indent=2)
    print(f"  saved {path}", flush=True)

if __name__ == "__main__":
    targets = sys.argv[1:] if len(sys.argv) > 1 else list(PROBES.keys())
    for fid in targets:
        run_one(fid, PROBES[fid])
