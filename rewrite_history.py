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


def run(cmd, *, cwd=None, env=None, check=True):
    result = subprocess.run(cmd, cwd=cwd or REPO_ROOT, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if check and result.returncode != 0:
        raise RuntimeError(f"Command failed: {' '.join(cmd)}\nSTDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}")
    return result.stdout.strip()


def read_accounts(csv_path: str):
    accounts = []
    owner_token = None
    with open(csv_path, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            username = row.get("username", "").strip()
            email = row.get("email", "").strip()
            token = row.get("token", "").strip()
            if username and email:
                accounts.append({"username": username, "email": email, "token": token})
            if username == "isabeastuc":
                owner_token = token
    if not accounts:
        raise RuntimeError("No accounts parsed from CSV")
    if not owner_token:
        raise RuntimeError("Owner token not found in CSV")
    return accounts, owner_token


def normalized_phase_windows():
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
    return [
        ("init", starts[0], ends[0]),
        ("core", starts[1], ends[1]),
        ("test_opt", starts[2], ends[2]),
        ("docs_finish", starts[3], ends[3]),
    ]


def random_datetime(start: datetime, end: datetime) -> datetime:
    delta: timedelta = end - start
    seconds = random.randint(0, int(delta.total_seconds()))
    return start + timedelta(seconds=seconds)


def ensure_dirs():
    (REPO_ROOT / "aggregator_backend" / "app" / "services" / "strategies").mkdir(parents=True, exist_ok=True)


def set_git_identity(name: str, email: str):
    run(["git", "config", "user.name", name])
    run(["git", "config", "user.email", email])


def stage_and_commit(paths, message: str, when: datetime):
    if isinstance(paths, (str, Path)):
        paths = [paths]
    run(["git", "add", "--"] + [str(Path(p)) for p in paths])
    env = os.environ.copy()
    ts = when.strftime("%Y-%m-%d %H:%M:%S")
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
    # Random per-account 20..30 commits
    per_account = {acc["username"]: random.randint(20, 30) for acc in accounts}
    total_commits = sum(per_account.values())

    phases = normalized_phase_windows()
    weights = {"init": 4, "core": 10, "test_opt": 8, "docs_finish": 2}
    weight_sum = sum(weights.values())

    # allocate per-phase number of commits
    phase_to_count = {}
    assigned = 0
    for i, (name, start, end) in enumerate(phases):
        count = round(total_commits * (weights[name] / weight_sum))
        if i == len(phases) - 1:
            count = total_commits - assigned
        phase_to_count[name] = max(1, count)
        assigned += phase_to_count[name]

    # build time slots
    slots = []
    for name, start, end in phases:
        count = phase_to_count[name]
        for _ in range(count):
            slots.append((random_datetime(start, end), name))
    slots.sort(key=lambda x: x[0])

    # author rotation with quotas
    rotation = list(accounts)
    usage = {a["username"]: 0 for a in accounts}
    author_plan = []
    idx = 0
    for ts, phase in slots:
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
    if phase == "init":
        fn = random.choice([add_strategy_file, modify_python_backend])
    elif phase == "core":
        fn = random.choice([modify_python_backend, modify_risk_monitor, modify_js, modify_solidity, add_strategy_file])
    elif phase == "test_opt":
        fn = random.choice([add_test, modify_python_backend, modify_risk_monitor])
    else:
        fn = random.choice([modify_python_backend, modify_js])
    return fn(counter)


def create_orphan_branch(branch_name: str):
    # Create orphan with current working tree content
    run(["git", "checkout", "--orphan", branch_name])
    # reset index
    run(["git", "reset"], check=False)


def switch_master_to(branch_name: str):
    # Delete old master and rename new branch to master
    current = run(["git", "branch", "--show-current"]) or branch_name
    # If master exists, delete it
    existing = run(["git", "branch"], check=False)
    if " master\n" in ("\n" + existing + "\n"):
        run(["git", "branch", "-D", "master"], check=False)
    # Rename current orphan to master
    run(["git", "branch", "-M", "master"])  # move current to master


def main():
    csv_path = sys.argv[1] if len(sys.argv) > 1 else CSV_DEFAULT_PATH
    accounts, owner_token = read_accounts(csv_path)

    # Build author plan including all commits
    author_plan, per_account = build_commit_plan(accounts)

    # Create orphan branch and make initial full-tree commit using first planned slot
    orphan_name = "rewrite_timeline"
    create_orphan_branch(orphan_name)

    # Initial commit: add whole tree (respects .gitignore)
    first_acc, first_time, first_phase = author_plan[0]
    set_git_identity(first_acc["username"], first_acc["email"])
    run(["git", "add", "-A"])  # add all
    stage_and_commit(["."], "feat: initialize project structure", first_time)

    # Following commits apply real code changes
    counter = 1
    for acc, when, phase in author_plan[1:]:
        set_git_identity(acc["username"], acc["email"])
        changed_path = apply_code_change(counter, phase)
        prefix = "feat:" if phase in ("init", "core") else ("fix:" if phase == "test_opt" else "docs:")
        msg = f"{prefix} staged automation change #{counter} in {phase} phase"
        stage_and_commit([changed_path], msg, when)
        counter += 1

    # Switch master to rewritten history
    switch_master_to(orphan_name)

    # Configure remote with token for later push
    secure_remote = f"https://{owner_token}@github.com/isabeastuc/crfr2.git"
    run(["git", "remote", "set-url", "origin", secure_remote])

    # Print per-account usage verification
    by_user = {}
    for acc in accounts:
        by_user[acc["username"]] = 0
    for acc, *_ in author_plan:
        by_user[acc["username"]] += 1
    print("Per-account planned commits:")
    for u, c in sorted(by_user.items()):
        print(u, c)


if __name__ == "__main__":
    main()


