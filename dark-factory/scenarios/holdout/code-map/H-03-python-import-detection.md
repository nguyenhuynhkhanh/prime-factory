# Scenario: Python import patterns correctly detected

## Type
feature

## Priority
high -- Python is a major supported language; import detection must be accurate

## Preconditions
- Python project containing:
  - Standard imports: `import os`, `import mypackage.submodule`
  - From imports: `from mypackage.utils import helper_func`
  - Relative imports: `from .models import User`, `from ..common import base`
  - __init__.py re-exports: `from .user_service import UserService` in __init__.py
  - Django INSTALLED_APPS: `INSTALLED_APPS = ['myapp.users', 'myapp.orders']` in settings.py
  - venv/ or .venv/ directory with pip packages

## Action
Scanner agent processes the Python project chunk.

## Expected Outcome
- All 5 Python import patterns detected
- Standard library imports (os, sys, etc.) distinguished from project imports
- Relative imports resolved to absolute module paths
- __init__.py re-exports traced through to actual source modules
- Django INSTALLED_APPS entries detected as module-level dependencies
- .venv/ excluded from scanning
- Dependency graph shows correct inter-module relationships

## Notes
Validates FR-15 for Python. Relative imports are the most error-prone pattern to resolve.
