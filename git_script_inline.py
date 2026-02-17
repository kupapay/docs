import subprocess
import sys
import os

os.chdir('C:\\Users\\HomePC\\Documents\\kupapay')

commands = [
    ('git status -sb', 'Check git status'),
    ('git add -A', 'Stage all changes'),
    ('git commit -m "docs: TASK-008 add system diagram"', 'Commit changes')
]

all_success = True

for cmd, desc in commands:
    print(f"\n{'='*60}")
    print(f"Running: {desc}")
    print(f"Command: {cmd}")
    print(f"{'='*60}")
    
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    
    print("STDOUT:")
    print(result.stdout if result.stdout else "(empty)")
    
    print("\nSTDERR:")
    print(result.stderr if result.stderr else "(empty)")
    
    print(f"\nReturn code: {result.returncode}")
    
    if result.returncode != 0 and 'commit' in cmd:
        # Commit can fail if nothing to commit - this may be expected
        pass
    elif result.returncode != 0:
        all_success = False

print(f"\n{'='*60}")
print("All commands completed!")
print(f"{'='*60}\n")
