"""Repo-root ASGI entrypoint for deployments that run from the repository root.

Render (and other PaaS) setups sometimes default to the repo root and run:

  PYTHONPATH=. uvicorn main:app

The actual backend lives in `backend/`, whose modules use imports that expect the
`backend/` directory itself to be on `PYTHONPATH`. This shim makes that work.
"""

from __future__ import annotations

import os
import sys

_REPO_ROOT = os.path.dirname(__file__)
_BACKEND_DIR = os.path.join(_REPO_ROOT, "backend")

if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

from backend.main import app  # noqa: E402,F401

