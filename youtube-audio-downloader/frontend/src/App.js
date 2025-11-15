import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

function App() {
  const [channelUrl, setChannelUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [downloadedFiles, setDownloadedFiles] = useState([]);

  useEffect(() => {
    if (taskId) {
      const interval = setInterval(async () => {
        try {
          const response = await axios.get(`${API_URL}/api/status/${taskId}`);
          setStatus(response.data);
          
          if (response.data.status === 'completed' || response.data.status === 'failed') {
            clearInterval(interval);
            setLoading(false);
            fetchDownloadedFiles();
          }
        } catch (err) {
          console.error('Error fetching status:', err);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [taskId]);

  const fetchDownloadedFiles = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/downloads`);
      setDownloadedFiles(response.data.files);
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus(null);
    setTaskId(null);

    if (!channelUrl.trim()) {
      setError('कृपया YouTube channel URL दर्ज करें');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/download-channel`, {
        channel_url: channelUrl
      });
      
      setTaskId(response.data.task_id);
    } catch (err) {
      setError(err.response?.data?.detail || 'Download शुरू करने में त्रुटि');
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    if (!status || status.total_videos === 0) return 0;
    return Math.round((status.downloaded / status.total_videos) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
            YouTube Channel Audio Downloader
          </h1>
          <p className="text-gray-600 text-lg">
            किसी भी YouTube channel की सभी videos को audio में convert करें
          </p>
        </div>

        {/* Main Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            {/* Input Form */}
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  YouTube Channel URL
                </label>
                <input
                  type="text"
                  value={channelUrl}
                  onChange={(e) => setChannelUrl(e.target.value)}
                  placeholder="https://www.youtube.com/@channelname"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-lg font-semibold text-white text-lg transition-all transform hover:scale-105 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Download हो रहा है...
                  </span>
                ) : (
                  'Download शुरू करें'
                )}
              </button>
            </form>

            {/* Status Display */}
            {status && (
              <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">Progress</span>
                    <span className="text-sm font-semibold text-purple-600">
                      {status.downloaded} / {status.total_videos} videos
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500 rounded-full"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                  <div className="text-center mt-2 text-2xl font-bold text-purple-600">
                    {getProgressPercentage()}%
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`text-sm font-bold ${
                      status.status === 'completed' ? 'text-green-600' :
                      status.status === 'failed' ? 'text-red-600' :
                      'text-blue-600'
                    }`}>
                      {status.status === 'completed' ? '✓ पूर्ण' :
                       status.status === 'failed' ? '✗ विफल' :
                       status.status === 'downloading' ? '⬇ Download हो रहा है' :
                       status.status === 'fetching' ? '🔍 Videos खोज रहे हैं' :
                       '⏳ शुरू हो रहा है'}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-lg">
                    <span className="text-sm font-medium text-gray-600">Current Video:</span>
                    <p className="text-sm text-gray-800 mt-1 break-words">{status.current_video}</p>
                  </div>

                  {status.completed_videos.length > 0 && (
                    <div className="p-3 bg-white rounded-lg">
                      <span className="text-sm font-medium text-green-600">
                        ✓ Downloaded ({status.completed_videos.length}):
                      </span>
                      <div className="mt-2 max-h-40 overflow-y-auto">
                        {status.completed_videos.map((video, idx) => (
                          <div key={idx} className="text-xs text-gray-600 py-1 border-b border-gray-100">
                            {video}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {status.failed_videos.length > 0 && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium text-red-600">
                        ✗ Failed ({status.failed_videos.length}):
                      </span>
                      <div className="mt-2 max-h-40 overflow-y-auto">
                        {status.failed_videos.map((video, idx) => (
                          <div key={idx} className="text-xs text-red-600 py-1 border-b border-red-100">
                            {video}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Downloaded Files */}
          {downloadedFiles.length > 0 && (
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Downloaded Files ({downloadedFiles.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {downloadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {file.size}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Made with ❤️ for downloading YouTube audio</p>
        </div>
      </div>
    </div>
  );
}

export default App;
