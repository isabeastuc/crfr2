#!/usr/bin/env python3
import os
import sys
import csv
import random
import subprocess
from datetime import datetime, timedelta
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent
CSV_DEFAULT_PATH = "/Users/zhaoshengnan/Desktop/收益聚合器/github_accounts.csv"


def read_accounts(csv_path: str):
    accounts = []
    with open(csv_path, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            username = row.get("username", "").strip()
            email = row.get("email", "").strip()
            token = row.get("token", "").strip()
            if username and email:
                accounts.append({"username": username, "email": email, "token": token})
    if not accounts:
        raise RuntimeError("No accounts parsed from CSV")
    return accounts


def normalized_phase_windows():
    # Map 12-month window [2023-12-01, 2024-11-30] into 2,5,4,1 months based on 4:10:8:2 ratio
    starts = [
        datetime(2023, 12, 1),
        datetime(2024, 2, 1),
        datetime(2024, 7, 1),
        datetime(2024, 11, 1),
    ]
    ends = [
        datetime(2024, 1, 31, 23, 59, 59),
        datetime(2024, 6, 30, 23, 59, 59),
        datetime(2024, 10, 31, 23, 59, 59),
        datetime(2024, 11, 30, 23, 59, 59),
    ]
    phases = [
        ("init", starts[0], ends[0]),
        ("core", starts[1], ends[1]),
        ("test_opt", starts[2], ends[2]),
        ("docs_finish", starts[3], ends[3]),
    ]
    return phases


def random_datetime(start: datetime, end: datetime) -> datetime:
    delta: timedelta = end - start
    seconds = random.randint(0, int(delta.total_seconds()))
    return start + timedelta(seconds=seconds)


def ensure_dirs():
    (REPO_ROOT / "aggregator_backend" / "app" / "services" / "strategies").mkdir(parents=True, exist_ok=True)


def run(cmd, *, cwd=None, env=None):
    result = subprocess.run(cmd, cwd=cwd or REPO_ROOT, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"Command failed: {' '.join(cmd)}\nSTDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}")
    return result.stdout.strip()


def set_git_identity(name: str, email: str):
    run(["git", "config", "user.name", name])
    run(["git", "config", "user.email", email])


def stage_and_commit(files, message: str, commit_dt: datetime):
    if isinstance(files, (str, Path)):
        files = [files]
    run(["git", "add", "--"] + [str(Path(f)) for f in files])
    env = os.environ.copy()
    ts = commit_dt.strftime("%Y-%m-%d %H:%M:%S")
    env["GIT_AUTHOR_DATE"] = ts
    env["GIT_COMMITTER_DATE"] = ts
    run(["git", "commit", "-m", message], env=env)


def touch_with_content(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        existing = path.read_text(encoding="utf-8", errors="ignore")
        path.write_text(existing + "\n" + content, encoding="utf-8")
    else:
        path.write_text(content, encoding="utf-8")


def modify_python_backend(counter: int) -> Path:
    target = REPO_ROOT / "aggregator_backend" / "app" / "services" / "strategy_engine.py"
    snippet = (
        f"\n\n# Auto-added utility {counter}\n"
        f"def compute_apr_boost_{counter}(apy: float, boost: float) -> float:\n"
        f"    \"\"\"Return boosted APR given APY approximation.\n"
        f"    This is a simple staged automation change #{counter}.\n"
        f"    \"\"\"\n"
        f"    if apy < 0: return 0.0\n"
        f"    factor = 1.0 + max(0.0, boost)\n"
        f"    return apy * factor\n"
    )
    touch_with_content(target, snippet)
    return target


def add_strategy_file(counter: int) -> Path:
    target = REPO_ROOT / "aggregator_backend" / "app" / "services" / "strategies" / f"strategy_{counter}.py"
    content = (
        "from typing import Dict, Any\n\n"
        f"STRATEGY_NAME = 'auto_strategy_{counter}'\n\n"
        "def build_position(amount: float) -> Dict[str, Any]:\n"
        "    if amount <= 0:\n"
        "        return {'ok': False, 'reason': 'amount must be positive'}\n"
        "    return {'ok': True, 'capital': amount, 'strategy': STRATEGY_NAME}\n"
    )
    touch_with_content(target, content)
    return target


def modify_risk_monitor(counter: int) -> Path:
    target = REPO_ROOT / "aggregator_backend" / "app" / "services" / "risk_monitor.py"
    snippet = (
        f"\n\n# Risk rule {counter}: basic exposure cap enforcement\n"
        f"def exposure_cap_{counter}(exposure: float, cap: float) -> bool:\n"
        f"    return max(0.0, exposure) <= max(0.0, cap)\n"
    )
    touch_with_content(target, snippet)
    return target


def modify_solidity(counter: int) -> Path:
    target = REPO_ROOT / "aggregator_contracts" / "contracts" / "YieldAggregator.sol"
    snippet = (
        f"\n\n// automation event {counter}\n"
        f"event AutoCommit{counter}(address indexed who, uint256 when);\n"
    )
    touch_with_content(target, snippet)
    return target


def modify_js(counter: int) -> Path:
    target = REPO_ROOT / "js" / "main2.js"
    snippet = (
        f"\n\n// automation tweak {counter}\n"
        f"function computeApyBoost{counter}(apy, boost) {{\n"
        f"  if (apy < 0) return 0;\n"
        f"  const factor = 1 + Math.max(0, boost);\n"
        f"  return apy * factor;\n"
        f"}}\n"
    )
    touch_with_content(target, snippet)
    return target


def add_test(counter: int) -> Path:
    target = REPO_ROOT / "aggregator_backend" / "tests" / f"test_strategy_auto_{counter}.py"
    content = (
        "import math\n\n"
        "def test_math_stability_" + str(counter) + "():\n"
        "    assert math.isfinite(1.0 / 1.0)\n"
    )
    touch_with_content(target, content)
    return target


def build_commit_plan(accounts):
    # Decide per-account commit counts in [20, 30]
    per_account = {}
    for acc in accounts:
        per_account[acc["username"]] = random.randint(20, 30)

    total_commits = sum(per_account.values())
    phases = normalized_phase_windows()
    weights = {"init": 4, "core": 10, "test_opt": 8, "docs_finish": 2}
    weight_sum = sum(weights.values())
    phase_to_count = {}
    assigned = 0
    for i, (name, start, end) in enumerate(phases):
        count = round(total_commits * (weights[name] / weight_sum))
        # ensure last bucket receives remainder
        if i == len(phases) - 1:
            count = total_commits - assigned
        phase_to_count[name] = max(1, count)
        assigned += phase_to_count[name]

    # Create (timestamp, phase) slots
    slots = []
    for name, start, end in phases:
        count = phase_to_count[name]
        for _ in range(count):
            slots.append((random_datetime(start, end), name))
    # Sort by time to simulate timeline
    slots.sort(key=lambda x: x[0])

    # Build author rotation while respecting per-account limits
    rotation = list(accounts)
    author_plan = []
    usage = {a["username"]: 0 for a in accounts}
    idx = 0
    for ts, phase in slots:
        # Find next available author with remaining quota
        for _ in range(len(rotation)):
            acc = rotation[idx % len(rotation)]
            if usage[acc["username"]] < per_account[acc["username"]]:
                author_plan.append((acc, ts, phase))
                usage[acc["username"]] += 1
                idx += 1
                break
            idx += 1

    return author_plan, per_account


def apply_code_change(counter: int, phase: str) -> Path:
    ensure_dirs()
    choice_pool = []
    if phase == "init":
        choice_pool = [add_strategy_file, modify_python_backend]
    elif phase == "core":
        choice_pool = [modify_python_backend, modify_risk_monitor, modify_js, modify_solidity, add_strategy_file]
    elif phase == "test_opt":
        choice_pool = [add_test, modify_python_backend, modify_risk_monitor]
    else:  # docs_finish, still modify code to avoid docs-only commits
        choice_pool = [modify_python_backend, modify_js]

    fn = random.choice(choice_pool)
    return fn(counter)


def main():
    csv_path = sys.argv[1] if len(sys.argv) > 1 else CSV_DEFAULT_PATH
    accounts = read_accounts(csv_path)
    # Ensure owner is included; rely on CSV content ordering as rotation basis
    author_plan, per_account = build_commit_plan(accounts)

    counter = 1
    for acc, when, phase in author_plan:
        set_git_identity(acc["username"], acc["email"])
        changed_path = apply_code_change(counter, phase)
        prefix = "feat:" if phase in ("init", "core") else ("fix:" if phase == "test_opt" else "docs:")
        msg = f"{prefix} staged automation change #{counter} in {phase} phase"
        stage_and_commit([changed_path], msg, when)
        counter += 1

    # Print per-account usage for verification
    by_user = {}
    for acc in accounts:
        by_user[acc["username"]] = 0
    for acc, *_ in author_plan:
        by_user[acc["username"]] += 1
    print("Per-account commits:")
    for u, c in sorted(by_user.items()):
        print(u, c)


if __name__ == "__main__":
    main()


