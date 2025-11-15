import argparse
import os
import subprocess

def main():
    parser = argparse.ArgumentParser(description='Download all videos from a YouTube channel as MP3 audio.')
    parser.add_argument('channel_url', help='YouTube channel URL')
    args = parser.parse_args()

    # Create downloads directory
    os.makedirs('downloads', exist_ok=True)

    # youtube-dl command
    command = [
        'youtube-dl',
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '0',
        '--download-archive', './downloads/archive.txt',
        '-o', './downloads/%(title)s.%(ext)s',
        args.channel_url
    ]

    try:
        subprocess.run(command, check=True)
        print("Download completed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error during download: {e}")
        return 1

    return 0

if __name__ == '__main__':
    exit(main())