import os
import re

directories = ['app', 'src']

replacements = [
    # 1. Backgrounds
    # Tailwind classes
    (re.compile(r'bg-\[#(0a0a0f|111118|0f0f0f|121212|0a0a0a|000000|171717|1e1e1e)\]'), r'bg-background'),
    (re.compile(r'bg-black'), r'bg-background'),
    (re.compile(r'bg-\[#ffffff0a\]|bg-\[#ffffff08\]|bg-\[#ffffff05\]|bg-\[#ffffff06\]|bg-\[#ffffff12\]'), r'bg-muted'),
    (re.compile(r'bg-white/5|bg-white/10'), r'bg-muted'),
    (re.compile(r'hover:bg-\[#(ffffff05|ffffff0a|ffffff10|2a2a2a|202020)\]'), r'hover:bg-muted'),
    (re.compile(r'active:bg-\[#ffffff05\]'), r'active:bg-muted'),

    # Inline styles
    (re.compile(r"background:\s*'#(0a0a0f|111118|0f0f0f|121212|0a0a0a|171717)'"), r"background: 'var(--background)'"),
    (re.compile(r"background:\s*'rgba\(10,\s*10,\s*10,\s*0\.9\)'"), r"background: 'hsl(var(--background) / 0.9)'"),
    (re.compile(r"background:\s*'rgba\(5,\s*5,\s*5,\s*0\.75\)'"), r"background: 'hsl(var(--background) / 0.75)'"),
    (re.compile(r"backgroundColor:\s*'#(0a0a0f|111118|0f0f0f|121212|0a0a0a|171717)'"), r"backgroundColor: 'var(--background)'"),
    
    # Linear gradients with hardcoded dark values
    (re.compile(r"background:\s*'linear-gradient\(90deg,\s*#171717\s*25%,\s*#202020\s*50%,\s*#171717\s*75%\)'"), r"background: 'linear-gradient(90deg, var(--muted) 25%, var(--accent) 50%, var(--muted) 75%)'"),

    # 2. Borders
    # Tailwind
    (re.compile(r'border-\[#ffffff0a\]|border-\[#ffffff08\]|border-\[#ffffff05\]|border-\[#ffffff06\]|border-\[#ffffff12\]|border-\[#ffffff0f\]|border-\[#1A1A1A\]|border-\[#2A2A2A\]'), r'border-border'),
    (re.compile(r'border-white/10|border-white/5'), r'border-border'),

    # Inline styles
    (re.compile(r"border:\s*'1px solid #(ffffff0a|ffffff08|ffffff05|ffffff12|ffffff0f|1A1A1A|2A2A2A)'"), r"border: '1px solid var(--border)'"),
    (re.compile(r"borderBottom:\s*'1px solid #(ffffff0a|ffffff08|ffffff05|ffffff12|ffffff0f|1A1A1A|2A2A2A)'"), r"borderBottom: '1px solid var(--border)'"),
    (re.compile(r"borderTop:\s*'1px solid #(ffffff0a|ffffff08|ffffff05|ffffff12|ffffff0f|1A1A1A|2A2A2A)'"), r"borderTop: '1px solid var(--border)'"),
    (re.compile(r"borderColor:\s*'#(ffffff0a|ffffff08|ffffff05|ffffff12|ffffff0f|1A1A1A|2A2A2A)'"), r"borderColor: 'var(--border)'"),

    # 3. Text colors
    # Tailwind
    (re.compile(r'text-\[#(3d3d52|6b6b80|9898b0|4d4d66|888888|555555|a1a1aa)\]'), r'text-muted-foreground'),
    (re.compile(r'placeholder:text-\[#(3d3d52|6b6b80|9898b0|4d4d66|888888|555555|a1a1aa)\]'), r'placeholder:text-muted-foreground'),
    (re.compile(r'text-white(?!\w)'), r'text-foreground'),
    (re.compile(r'text-\[#f8f8f8\]|text-\[#fafafa\]|text-\[#ffffff\]'), r'text-foreground'),
    
    # Inline styles
    (re.compile(r"color:\s*'white'"), r"color: 'var(--foreground)'"),
    (re.compile(r"color:\s*'#(3d3d52|6b6b80|9898b0|4d4d66|888888|555555|a1a1aa)'"), r"color: 'var(--muted-foreground)'"),
    (re.compile(r"color:\s*value\s*\?\s*'white'\s*:\s*'#6b6b80'"), r"color: value ? 'var(--foreground)' : 'var(--muted-foreground)'"),

    # Shadows
    (re.compile(r"shadow-\[0_24px_64px_#00000080(,[^\]]+)?\]"), r"shadow-xl"),

    # Specific cleanups
    (re.compile(r"background:\s*inactive\s*\?\s*'#0e0e16'\s*:\s*'#111118'"), r"background: inactive ? 'var(--accent)' : 'var(--card)'"),
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
