#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
service_pids=()

cleanup() {
  trap - EXIT INT TERM
  if ((${#service_pids[@]})); then
    kill "${service_pids[@]}" 2>/dev/null || true
    wait "${service_pids[@]}" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

if [[ ! -x "$project_root/.venv/bin/python" ]]; then
  echo "Missing .venv. Run the one-time setup from README.md first." >&2
  exit 1
fi

if [[ ! -d "$project_root/node_modules" ]]; then
  echo "Missing node_modules. Run npm install first." >&2
  exit 1
fi

(
  cd "$project_root/backend"
  exec ../.venv/bin/python server.py
) &
service_pids+=("$!")

(
  cd "$project_root/backend"
  exec ../.venv/bin/python agent.py dev
) &
service_pids+=("$!")

(
  cd "$project_root"
  exec npm run dev -- --host
) &
service_pids+=("$!")

echo "Archava started: frontend http://localhost:5173, token API http://localhost:5001"
echo "Press Ctrl+C to stop all services."

wait -n "${service_pids[@]}"
