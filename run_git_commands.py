#!/usr/bin/env python3
import subprocess
import sys

def run_command(cmd, description):
    """Run a command and print stdout and stderr"""
    print(f"\n{'='*60}")
    print(f"Running: {description}")
    print(f"Command: {cmd}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True
        )
        
        print("STDOUT:")
        print(result.stdout if result.stdout else "(empty)")
        
        print("\nSTDERR:")
        print(result.stderr if result.stderr else "(empty)")
        
        print(f"\nReturn code: {result.returncode}")
        
        return result.returncode == 0
    except Exception as e:
        print(f"Error executing command: {e}")
        return False

def main():
    print("Starting Git Commands Script")
    
    # Command 1: git status
    success1 = run_command(
        "git status -sb",
        "Check git status"
    )
    
    # Command 2: git add
    success2 = run_command(
        "git add -A",
        "Stage all changes"
    )
    
    # Command 3: git commit
    success3 = run_command(
        'git commit -m "docs: TASK-008 add system diagram"',
        "Commit changes"
    )
    
    print(f"\n{'='*60}")
    print("Summary:")
    print(f"  git status -sb: {'✓ Success' if success1 else '✗ Failed'}")
    print(f"  git add -A: {'✓ Success' if success2 else '✗ Failed'}")
    print(f"  git commit: {'✓ Success' if success3 else '✗ Failed'}")
    print(f"{'='*60}\n")
    
    sys.exit(0 if (success1 and success2 and success3) else 1)

if __name__ == "__main__":
    main()
