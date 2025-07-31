"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { attachmentApi } from "@/api/attachment";

interface AvatarImageProps {
  avatarPath?: string;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
}

export default function AvatarImage({ 
  avatarPath, 
  alt = "头像", 
  className = "w-full h-full object-cover",
  fallbackClassName = "h-8 w-8 text-muted-foreground"
}: AvatarImageProps) {
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!avatarPath) {
      setAvatarUrl("");
      setError(false);
      return;
    }

    // 如果已经是完整URL，直接使用
    if (avatarPath.startsWith('http')) {
      setAvatarUrl(avatarPath);
      return;
    }

    // 如果是路径，通过个人中心API获取预览URL
    const fetchAvatarUrl = async () => {
      try {
        setLoading(true);
        setError(false);

        // 获取认证token
        const token = localStorage.getItem('token');
        if (!token) {
          setError(true);
          return;
        }

        const response = await fetch(`/api/v1/system/profile/avatar-url?path=${encodeURIComponent(avatarPath)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAvatarUrl(data.data.download_url);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to fetch avatar URL:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatarUrl();
  }, [avatarPath]);

  if (loading) {
    return (
      <div className={`${className} bg-muted animate-pulse flex items-center justify-center`}>
        <User className={fallbackClassName} />
      </div>
    );
  }

  if (error || !avatarUrl) {
    return (
      <div className={`${className} bg-muted flex items-center justify-center`}>
        <User className={fallbackClassName} />
      </div>
    );
  }

  return (
    <img 
      src={avatarUrl} 
      alt={alt} 
      className={className}
      onError={() => setError(true)}
    />
  );
}
