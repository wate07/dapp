# YouTube Channel Audio Downloader

एक powerful application जो किसी भी YouTube channel की सभी videos को audio format (MP3) में download करता है।

## Features

- ✅ किसी भी YouTube channel की सभी videos को download करें
- ✅ Automatic audio conversion (MP3 format)
- ✅ Real-time progress tracking
- ✅ Beautiful और responsive UI
- ✅ Download status के साथ detailed information
- ✅ Failed downloads की list
- ✅ Downloaded files की complete list

## Technology Stack

### Backend
- Python 3
- FastAPI
- yt-dlp (YouTube downloader)
- uvicorn (ASGI server)

### Frontend
- React
- Tailwind CSS
- Axios

## Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 14+
- npm या yarn
- ffmpeg (audio conversion के लिए)

### Backend Setup

1. Backend directory में जाएं:
```bash
cd backend
```

2. Dependencies install करें:
```bash
pip install -r requirements.txt
```

3. Backend server start करें:
```bash
python main.py
```

Backend server `http://localhost:8000` पर run होगा।

### Frontend Setup

1. Frontend directory में जाएं:
```bash
cd frontend
```

2. Dependencies install करें:
```bash
npm install
```

3. Frontend development server start करें:
```bash
npm start
```

Frontend application `http://localhost:3000` पर open होगा।

## Usage

1. दोनों servers (backend और frontend) को start करें
2. Browser में `http://localhost:3000` open करें
3. YouTube channel का URL enter करें (जैसे: `https://www.youtube.com/@channelname`)
4. "Download शुरू करें" button पर click करें
5. Download progress को real-time में देखें
6. सभी audio files `downloads` folder में save होंगी

## Supported URL Formats

- `https://www.youtube.com/@channelname`
- `https://www.youtube.com/c/channelname`
- `https://www.youtube.com/channel/CHANNEL_ID`
- `https://www.youtube.com/user/username`

## API Endpoints

### POST `/api/download-channel`
Channel से videos download करना start करें

**Request Body:**
```json
{
  "channel_url": "https://www.youtube.com/@channelname"
}
```

**Response:**
```json
{
  "task_id": "uuid",
  "message": "Download started"
}
```

### GET `/api/status/{task_id}`
Download task की status check करें

**Response:**
```json
{
  "status": "downloading",
  "total_videos": 10,
  "downloaded": 5,
  "current_video": "video_name.mp3",
  "completed_videos": ["video1.mp3", "video2.mp3"],
  "failed_videos": []
}
```

### GET `/api/downloads`
Downloaded files की list प्राप्त करें

**Response:**
```json
{
  "files": [
    {
      "name": "video1.mp3",
      "size": "5.23 MB"
    }
  ]
}
```

## Project Structure

```
youtube-audio-downloader/
├── backend/
│   ├── main.py              # FastAPI application
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   ├── index.js        # React entry point
│   │   └── index.css       # Tailwind CSS
│   ├── package.json
│   └── tailwind.config.js
├── downloads/               # Downloaded audio files
└── README.md
```

## Notes

- Download speed आपके internet connection पर depend करता है
- Large channels में बहुत सारी videos हो सकती हैं, इसलिए download में time लग सकता है
- सभी audio files MP3 format में 192kbps quality के साथ save होती हैं
- Failed downloads की information UI में display होती है

## Troubleshooting

### Backend Error: "No module named pip"
```bash
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python3 get-pip.py
```

### FFmpeg not found
Ubuntu/Debian:
```bash
sudo apt-get install ffmpeg
```

MacOS:
```bash
brew install ffmpeg
```

### CORS Error
सुनिश्चित करें कि backend server `http://localhost:8000` पर run हो रहा है।

## License

MIT License - Free to use and modify

## Support

Issues या questions के लिए, कृपया GitHub repository पर issue create करें।
