import React, { useEffect, useState } from 'react';
import { marked } from 'marked';
import './Intro.css';
import { apiService } from './apiService';

const Intro = ({ roomId = 'intro' }) => {
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadRoomInfo = async () => {
            try {
                setLoading(true);
                // API 現在直接返回 markdown 內容
                const markdownContent = await apiService.getRoomInfo(roomId);
                setContent(markdownContent);
                // 從 markdown 內容中提取標題（第一個 # 標題）
                const titleMatch = markdownContent.match(/^#\s+(.+)$/m);
                setTitle(titleMatch ? titleMatch[1] : 'Interactive Tutorial Platform');
            } catch (error) {
                console.error('Error loading room info:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        loadRoomInfo();
    }, [roomId]);

    if (loading) {
        return (
            <div className="intro">
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="intro">
            <div 
                className="markdown-content"
                dangerouslySetInnerHTML={{ 
                    __html: marked(content) 
                }}
            />
            {error && (
                <div style={{ color: 'red', fontSize: '0.9em', marginTop: '1rem' }}>
                    Note: Using fallback content due to API error
                </div>
            )}
        </div>
    );
}

export default Intro;