#!/usr/bin/env python3
"""
Image List Updater Utility

This script automatically updates the virtual-love-letter.html file with the 
current list of images in the photos/meetings and photos/perfect_moments directories.
"""

import os
import re
import sys

# File paths
HTML_FILE = 'virtual-love-letter.html'
MEETINGS_DIR = 'photos/meetings'
PERFECT_MOMENTS_DIR = 'photos/perfect_moments'

def get_image_files(directory):
    """Get all image files from a directory."""
    if not os.path.exists(directory):
        print(f"Error: Directory '{directory}' does not exist.")
        return []
    
    image_extensions = ('.jpg', '.jpeg', '.png', '.gif', '.webp')
    return [f for f in os.listdir(directory) 
            if os.path.isfile(os.path.join(directory, f)) 
            and f.lower().endswith(image_extensions)
            and not f.endswith('Zone.Identifier')]

def update_html_file():
    """Update the HTML file with the current list of images."""
    # Get image lists
    meetings_images = get_image_files(MEETINGS_DIR)
    perfect_moments_images = get_image_files(PERFECT_MOMENTS_DIR)
    
    if not meetings_images and not perfect_moments_images:
        print("No images found in either directory.")
        return False
    
    # Read the HTML file
    try:
        with open(HTML_FILE, 'r', encoding='utf-8') as file:
            html_content = file.read()
    except FileNotFoundError:
        print(f"Error: HTML file '{HTML_FILE}' not found.")
        return False
    except Exception as e:
        print(f"Error reading HTML file: {e}")
        return False
    
    # Update meetings images list
    meetings_pattern = r"(const MEETINGS_IMAGES = \[)([^\]]*?)(\];)"
    meetings_replacement = "\\1" + ", ".join([f"'{img}'" for img in meetings_images]) + "\\3"
    html_content = re.sub(meetings_pattern, meetings_replacement, html_content)
    
    # Update perfect moments images list
    perfect_moments_pattern = r"(const PERFECT_MOMENTS_IMAGES = \[)([^\]]*?)(\];)"
    perfect_moments_replacement = "\\1" + ", ".join([f"'{img}'" for img in perfect_moments_images]) + "\\3"
    html_content = re.sub(perfect_moments_pattern, perfect_moments_replacement, html_content)
    
    # Write the updated content back to the file
    try:
        with open(HTML_FILE, 'w', encoding='utf-8') as file:
            file.write(html_content)
        print("Successfully updated the HTML file with the current image lists.")
        print(f"- Added {len(meetings_images)} images to the 'When We First Met' section.")
        print(f"- Added {len(perfect_moments_images)} images to the 'Our Special Moments' section.")
        return True
    except Exception as e:
        print(f"Error writing to HTML file: {e}")
        return False

def main():
    """Main function."""
    print("Image List Updater Utility")
    print("==========================")
    
    # Check if the script is being run from the correct directory
    if not os.path.exists(HTML_FILE):
        print(f"Error: '{HTML_FILE}' not found in the current directory.")
        print("Please run this script from the same directory as the virtual-love-letter.html file.")
        return 1
    
    # Update the HTML file
    success = update_html_file()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
