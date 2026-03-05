#!/usr/bin/env python3

# Read the file
with open('main.py', 'r') as f:
    content = f.read()

# Fix the indentation issues
content = content.replace(
    '        if "InvalidId" in str(e) or "Invalid" in str(e):\n        raise HTTPException',
    '        if "InvalidId" in str(e) or "Invalid" in str(e):\n            raise HTTPException'
)

# Write back to file
with open('main.py', 'w') as f:
    f.write(content)

print("Fixed indentation issues")
