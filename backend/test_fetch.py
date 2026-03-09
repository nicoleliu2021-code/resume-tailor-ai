#!/usr/bin/env python3
"""Quick test script to verify URL fetching works"""

import sys

# Test if dependencies are installed
try:
    import requests
    from bs4 import BeautifulSoup
    print("✓ Dependencies installed successfully")
except ImportError as e:
    print(f"✗ Missing dependency: {e}")
    print("\nPlease install requirements:")
    print("  pip install -r requirements.txt")
    sys.exit(1)

# Test fetching a URL
test_url = "https://careers.rocket.com/careers/r-081789/director-p"

print(f"\nTesting URL fetch: {test_url}")
print("-" * 60)

try:
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    response = requests.get(test_url, headers=headers, timeout=10)
    print(f"Status Code: {response.status_code}")

    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')

        # Remove unwanted elements
        for script in soup(['script', 'style', 'nav', 'header', 'footer']):
            script.decompose()

        text = soup.get_text(separator='\n', strip=True)
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        cleaned_text = '\n'.join(lines)

        print(f"Extracted Text Length: {len(cleaned_text)} characters")
        print(f"\nFirst 500 characters:")
        print("-" * 60)
        print(cleaned_text[:500])
        print("\n✓ URL fetch test PASSED")
    else:
        print(f"✗ Unexpected status code: {response.status_code}")

except Exception as e:
    print(f"✗ Error: {str(e)}")
    sys.exit(1)
