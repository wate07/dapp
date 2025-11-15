from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yt_dlp
import os
import asyncio
from typing import Dict, List
import uuid
import re

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store download tasks
download_tasks: Dict[str, dict] = {}

# Download directory
DOWNLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "downloads")
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

class ChannelRequest(BaseModel):
    channel_url: str

class DownloadStatus(BaseModel):
    task_id: str
    status: str
    total_videos: int
    downloaded: int
    current_video: str
    completed_videos: List[str]
    failed_videos: List[str]

def validate_youtube_url(url: str) -> bool:
    """Validate if the URL is a valid YouTube channel URL"""
    youtube_patterns = [
        r'(https?://)?(www\.)?youtube\.com/(c/|channel/|user/|@)[\w-]+',
        r'(https?://)?(www\.)?youtube\.com/[\w-]+',
    ]
    return any(re.match(pattern, url) for pattern in youtube_patterns)

def progress_hook(d, task_id):
    """Hook to track download progress"""
    if d['status'] == 'downloading':
        filename = d.get('filename', 'Unknown')
        download_tasks[task_id]['current_video'] = os.path.basename(filename)
    elif d['status'] == 'finished':
        filename = d.get('filename', 'Unknown')
        download_tasks[task_id]['downloaded'] += 1
        download_tasks[task_id]['completed_videos'].append(os.path.basename(filename))

async def download_channel_videos(channel_url: str, task_id: str):
    """Download all videos from a YouTube channel as audio"""
    try:
        download_tasks[task_id]['status'] = 'fetching'
        
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'outtmpl': os.path.join(DOWNLOAD_DIR, '%(title)s.%(ext)s'),
            'progress_hooks': [lambda d: progress_hook(d, task_id)],
            'quiet': False,
            'no_warnings': False,
            'extract_flat': False,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # First, get channel info and video list
            info = ydl.extract_info(channel_url, download=False)
            
            if 'entries' in info:
                videos = list(info['entries'])
                download_tasks[task_id]['total_videos'] = len(videos)
                download_tasks[task_id]['status'] = 'downloading'
                
                # Download each video
                for video in videos:
                    if video:
                        try:
                            video_url = f"https://www.youtube.com/watch?v={video['id']}"
                            ydl.download([video_url])
                        except Exception as e:
                            download_tasks[task_id]['failed_videos'].append(
                                f"{video.get('title', 'Unknown')} - Error: {str(e)}"
                            )
            else:
                # Single video
                download_tasks[task_id]['total_videos'] = 1
                download_tasks[task_id]['status'] = 'downloading'
                ydl.download([channel_url])
                download_tasks[task_id]['downloaded'] = 1
        
        download_tasks[task_id]['status'] = 'completed'
        download_tasks[task_id]['current_video'] = 'All downloads completed!'
        
    except Exception as e:
        download_tasks[task_id]['status'] = 'failed'
        download_tasks[task_id]['current_video'] = f'Error: {str(e)}'
        download_tasks[task_id]['failed_videos'].append(str(e))

@app.get("/")
async def root():
    return {"message": "YouTube Channel to Audio Downloader API"}

@app.post("/api/download-channel")
async def download_channel(request: ChannelRequest):
    """Start downloading all videos from a YouTube channel"""
    
    if not validate_youtube_url(request.channel_url):
        raise HTTPException(status_code=400, detail="Invalid YouTube channel URL")
    
    task_id = str(uuid.uuid4())
    
    download_tasks[task_id] = {
        'status': 'starting',
        'total_videos': 0,
        'downloaded': 0,
        'current_video': 'Initializing...',
        'completed_videos': [],
        'failed_videos': []
    }
    
    # Start download in background
    asyncio.create_task(download_channel_videos(request.channel_url, task_id))
    
    return {"task_id": task_id, "message": "Download started"}

@app.get("/api/status/{task_id}")
async def get_status(task_id: str):
    """Get the status of a download task"""
    
    if task_id not in download_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return download_tasks[task_id]

@app.get("/api/downloads")
async def list_downloads():
    """List all downloaded files"""
    try:
        files = []
        for filename in os.listdir(DOWNLOAD_DIR):
            if filename.endswith('.mp3'):
                filepath = os.path.join(DOWNLOAD_DIR, filename)
                size = os.path.getsize(filepath)
                files.append({
                    'name': filename,
                    'size': f"{size / (1024 * 1024):.2f} MB"
                })
        return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
