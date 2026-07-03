import os
import re

directory = 'frontend/app'
patterns = [
    (re.compile(r"bg-\[#(050505|0a0a12|0b0b12)\]"), r"bg-[#0a0a0f]"),
    (re.compile(r"style=\{\{\s*background:\s*'#(0a0a12|0b0b12|050505)'"), r"style={{ background: '#0a0a0f'"),
]

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            original = content
            for pat, repl in patterns:
                content = pat.sub(repl, content)
            
            if content != original:
                with open(filepath, 'w') as f:
                    f.write(content)
                print(f"Updated {filepath}")
