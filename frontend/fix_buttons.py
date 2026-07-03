import os
import re

glassy_classes = "bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-full text-foreground"

# Regex patterns to find existing button styles
# We match class attributes that contain bg-violet-600 or specific bg-gradient combinations
patterns = [
    re.compile(r'bg-violet-[4567]00\s*(hover:bg-violet-[567]00)?\s*(disabled:opacity-\d+)?\s*(shadow-[^\s]+)?'),
    re.compile(r'bg-gradient-to-br\s*from-\[#[a-fA-F0-9]+\]\s*to-\[#[a-fA-F0-9]+\]\s*(shadow-\[[^\]]+\])?\s*(hover:shadow-\[[^\]]+\])?\s*(hover:-translate-y-\[[^\]]+\])?'),
    re.compile(r'border-0\s*bg-gradient-to-br\s*from-\[#[a-fA-F0-9]+\]\s*to-\[#[a-fA-F0-9]+\]\s*(shadow-\[[^\]]+\])?\s*(hover:shadow-\[[^\]]+\])?\s*(hover:-translate-y-\[[^\]]+\])?'),
    re.compile(r'rounded-(xl|lg|md|sm)'),
    re.compile(r'text-white') # We use text-foreground for glassy
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    
    # Only replace inside className="..."
    # We will find all className attributes, check if they look like primary buttons, and replace inside them
    class_pattern = re.compile(r'className=["\']([^"\']+)["\']')
    
    def replacer(match):
        classes = match.group(1)
        original_classes = classes
        
        # Check if it's a primary button
        is_primary = False
        if 'bg-violet-' in classes or 'bg-gradient-to-br from-[' in classes:
            # specifically check it's not just text-violet or border-violet
            if re.search(r'\bbg-violet-[4567]00\b', classes) or 'bg-gradient-to-br from-[' in classes:
                is_primary = True
            
        if is_primary:
            # Strip out all the old solid backgrounds, rounded corners, shadows, and text colors
            for p in patterns:
                classes = p.sub('', classes)
            
            # Clean up double spaces
            classes = re.sub(r'\s+', ' ', classes).strip()
            
            # Add glassy classes
            classes = f"{classes} {glassy_classes}".strip()
            return f'className="{classes}"'
        
        return match.group(0)
        
    content = class_pattern.sub(replacer, content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk("/media/dell/9CB8D8ADB8D88764/gym/frontend"):
    if "node_modules" in root or ".next" in root:
        continue
    for file in files:
        if file.endswith((".tsx", ".ts")):
            process_file(os.path.join(root, file))

print("Done replacing button styles.")
