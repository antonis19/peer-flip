import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';

interface HowItWorksProps {
    url: string;
}

const HowItWorks: React.FC<HowItWorksProps> = ({ url }) => {
    const [markdownContent, setMarkdownContent] = useState<string>('');

    useEffect(() => {
        const fetchMarkdown = async () => {
            try {
                const response = await axios.get(url);
                setMarkdownContent(response.data);
            } catch (error) {
                console.error("Error fetching markdown:", error);
            }
        };
        fetchMarkdown();
    }, [url]);

    return (
        <div className="markdown-container" style={{ marginLeft: '20px', marginRight: '20px' }}>
            <ReactMarkdown 
                children={markdownContent} 
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeRaw, (rehypeKatex as any)]}
                components={{
                    code({node, inline, className, children, ...props}) {
                        return  (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    }
                }}
            />
        </div>
    );
}

export default HowItWorks;
