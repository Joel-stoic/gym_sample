import os
import re

directories = ['app', 'src']

replacements = [
    # More comprehensive background replacements
    (re.compile(r'bg-\[#(0a0a0f|111118|11111a|0f0f18|0f0f0f|121212|0a0a0a|000000|171717|1e1e1e|16161f|0e0e16|0e0e15|333333|2A2A2A)\]'), r'bg-background'),
    (re.compile(r'bg-black'), r'bg-background'),
    
    # Catch any style backgrounds that were missed
    (re.compile(r"background:\s*'#(16161f|0f0f18|11111a|0e0e16|0e0e15|333333|2A2A2A)'"), r"background: 'var(--background)'"),
    (re.compile(r"backgroundColor:\s*'#(16161f|0f0f18|11111a|0e0e16|0e0e15|333333|2A2A2A)'"), r"backgroundColor: 'var(--background)'"),

    # Borders
    (re.compile(r'border-\[#(ffffff0a|ffffff08|ffffff05|ffffff06|ffffff12|ffffff0f|1A1A1A|2A2A2A|ef444425|10b98125|7c3aed25|7c3aed30)\]'), r'border-border'),

    # Text Colors
    (re.compile(r'text-\[#(5c5c72|3d3d52|6b6b80|9898b0|4d4d66|888888|555555|a1a1aa)\]'), r'text-muted-foreground'),
    (re.compile(r'placeholder:text-\[#(5c5c72|3d3d52|6b6b80|9898b0|4d4d66|888888|555555|a1a1aa)\]'), r'placeholder:text-muted-foreground'),
    (re.compile(r'text-\[#f8f8f8\]|text-\[#fafafa\]|text-\[#ffffff\]'), r'text-foreground'),
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    for pattern, replacement in replacements:
        content = pattern.sub(replacement, content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

for d in directories:
    for root, dirs, files in os.walk(d):
        for file in files:
            if file.endswith(('.tsx', '.ts', '.css')):
                process_file(os.path.join(root, file))

print("Done.")
