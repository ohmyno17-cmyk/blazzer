'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import VideoPlayer from '@/components/video/VideoPlayer';
import { 
  Play, 
  Eye, 
  Clock,
  Calendar,
  ChevronRight,
  Sparkles,
  HardDrive,
  Share2,
  Heart,
  Bookmark,
  Shield,
  Flame,
  Shuffle,
  Search,
  Menu,
  X
} from 'lucide-react';

interface VideoInfo {
  title: string;
  poster: string;
  duration: number;
  quality: number;
  size: string;
  view: number;
  date_uploaded: string;
}

interface Video {
  title: string;
  folder: string;
  video_id: string;
  embedLink: string;
  poster: string;
  view: number;
  date_uploaded: string;
}

interface VideoResponse {
  file: Video[];
}

export default function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { toast } = useToast();
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [videoCache, setVideoCache] = useState<Video | null>(null);
  const [streamData, setStreamData] = useState<{streamUrl: string | null; streamType: 'hls' | 'mp4' | null} | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setLoading(true);
        
        const [infoRes, streamRes, allVideosRes] = await Promise.all([
          fetch(`/api/videos/${resolvedParams.id}`),
          fetch(`/api/stream/${resolvedParams.id}`),
          fetch('/api/videos?perPage=100')
        ]);
        
        const infoData = await infoRes.json();
        const streamData = await streamRes.json();
        const allVideosData: VideoResponse = await allVideosRes.json();
        
        if (infoData.file) setVideoInfo(infoData.file);
        
        if (allVideosData.file) {
          const currentVideo = allVideosData.file.find(v => v.video_id === resolvedParams.id);
          setVideoCache(currentVideo || null);
          setAllVideos(allVideosData.file);
          
          // Sort by newest and get related videos
          const sorted = allVideosData.file
            .filter(v => v.video_id !== resolvedParams.id)
            .sort((a, b) => {
              const dateA = new Date(a.date_uploaded || 0).getTime();
              const dateB = new Date(b.date_uploaded || 0).getTime();
              return dateB - dateA;
            })
            .slice(0, 12);
          setRelatedVideos(sorted);
        }
        
        setStreamData(streamData);
      } catch {
        toast({ title: 'Error', description: 'Failed to load video', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchVideoData();
  }, [resolvedParams.id, toast]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copied!', description: 'Video link copied to clipboard' });
    } catch {
      toast({ title: 'Error', description: 'Failed to copy link' });
    }
  };

  const handleRandomVideo = () => {
    if (allVideos.length > 0) {
      const otherVideos = allVideos.filter(v => v.video_id !== resolvedParams.id);
      if (otherVideos.length > 0) {
        const randomVideo = otherVideos[Math.floor(Math.random() * otherVideos.length)];
        window.location.href = `/video/${randomVideo.video_id}`;
      }
    }
  };

  const title = videoCache?.title || videoInfo?.title || 'Video';

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-neutral-950/95 border-b border-neutral-800/50 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="relative w-8 h-8">
                <Image
                  src="/blazzer-logo.png"
                  alt="Blazzer"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-semibold tracking-tight text-white">Blazzer</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-all duration-200"
              >
                Home
              </Link>
              <Link
                href="/"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-all duration-200"
              >
                <Flame className="w-3.5 h-3.5" />
                Trending
              </Link>
              <Link
                href="/"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-all duration-200"
              >
                <Sparkles className="w-3.5 h-3.5" />
                New
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Random Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRandomVideo}
                className="hidden md:flex h-9 px-3 rounded-lg border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-600"
              >
                <Shuffle className="w-4 h-4" />
              </Button>

              {/* Back Button */}
              <Link href="/">
                <Button variant="ghost" size="sm" className="hidden md:flex text-neutral-400 hover:text-white text-sm gap-1 rounded-lg h-9 px-4">
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-neutral-400 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-neutral-800/50">
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium bg-neutral-800/50 text-neutral-400"
                >
                  Home
                </Link>
                <Link
                  href="/"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium bg-neutral-800/50 text-neutral-400"
                >
                  <Flame className="w-3.5 h-3.5" />
                  Trending
                </Link>
                <Link
                  href="/"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium bg-neutral-800/50 text-neutral-400"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  New
                </Link>
                <button
                  onClick={handleRandomVideo}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium bg-neutral-800/50 text-neutral-400"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  Random
                </button>
                <Link
                  href="/"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium bg-neutral-800/50 text-neutral-400"
                >
                  <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                  Back
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-5 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Player */}
            <div className="bg-neutral-900 rounded-xl overflow-hidden ring-1 ring-neutral-800">
              {loading ? (
                <div className="aspect-video bg-neutral-800 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-2 border-neutral-600 border-t-white rounded-full animate-spin" />
                    <span className="text-sm text-neutral-500">Loading...</span>
                  </div>
                </div>
              ) : (
                <VideoPlayer
                  streamUrl={streamData?.streamUrl || null}
                  embedLink={videoCache?.embedLink || ''}
                  poster={videoCache?.poster || videoInfo?.poster || ''}
                  title={title}
                  streamType={streamData?.streamType || null}
                />
              )}
            </div>

            {/* Video Info */}
            <div className="bg-neutral-900/50 rounded-xl p-5 ring-1 ring-neutral-800">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-5 bg-neutral-800 w-3/4 rounded" />
                  <Skeleton className="h-4 bg-neutral-800 w-1/2 rounded" />
                </div>
              ) : (
                <>
                  <h1 className="text-lg md:text-xl font-semibold mb-3 leading-tight text-white">{title}</h1>
                  
                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 mb-4">
                    <span className="flex items-center gap-1 bg-neutral-800/50 px-2.5 py-1 rounded-md">
                      <Eye className="w-3.5 h-3.5" />
                      <span className="text-white font-medium">{formatViews(videoInfo?.view || videoCache?.view || 0)}</span>
                      <span>views</span>
                    </span>
                    {videoInfo?.duration && (
                      <span className="flex items-center gap-1 bg-neutral-800/50 px-2.5 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDuration(videoInfo.duration)}
                      </span>
                    )}
                    {videoInfo?.quality && (
                      <span className="flex items-center gap-1 bg-neutral-800/50 px-2.5 py-1 rounded-md">
                        <Sparkles className="w-3.5 h-3.5 text-neutral-300" />
                        <span className="text-neutral-300">{videoInfo.quality}p</span>
                      </span>
                    )}
                    {videoInfo?.size && (
                      <span className="flex items-center gap-1 bg-neutral-800/50 px-2.5 py-1 rounded-md">
                        <HardDrive className="w-3.5 h-3.5" />
                        {videoInfo.size}
                      </span>
                    )}
                    <span className="flex items-center gap-1 bg-neutral-800/50 px-2.5 py-1 rounded-md">
                      <Calendar className="w-3.5 h-3.5" />
                      {videoCache?.date_uploaded?.split(' ')[0] || videoInfo?.date_uploaded?.split(' ')[0] || 'N/A'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLiked(!liked)}
                      className={cn(
                        "h-8 px-3 rounded-lg border-neutral-700 text-xs",
                        liked 
                          ? "bg-white/10 text-white border-neutral-600" 
                          : "text-neutral-400 hover:text-white hover:border-neutral-600"
                      )}
                    >
                      <Heart className={cn("w-3.5 h-3.5 mr-1.5", liked && "fill-white")} />
                      {liked ? 'Liked' : 'Like'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSaved(!saved)}
                      className={cn(
                        "h-8 px-3 rounded-lg border-neutral-700 text-xs",
                        saved 
                          ? "bg-white/10 text-white border-neutral-600" 
                          : "text-neutral-400 hover:text-white hover:border-neutral-600"
                      )}
                    >
                      <Bookmark className={cn("w-3.5 h-3.5 mr-1.5", saved && "fill-white")} />
                      {saved ? 'Saved' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="h-8 px-3 rounded-lg border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-600 text-xs"
                    >
                      <Share2 className="w-3.5 h-3.5 mr-1.5" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRandomVideo}
                      className="h-8 px-3 rounded-lg border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-600 text-xs"
                    >
                      <Shuffle className="w-3.5 h-3.5 mr-1.5" />
                      Random
                    </Button>
                  </div>

                  {/* Tags */}
                  {videoCache?.folder && (
                    <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-neutral-800">
                      {videoCache.folder.split(',').map((tag, i) => (
                        <Badge 
                          key={i} 
                          variant="secondary" 
                          className="bg-neutral-800/50 text-neutral-400 text-[10px] px-2 py-0.5 rounded-full border-0"
                        >
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sidebar - Related Videos */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-900/30 rounded-xl p-4 sticky top-16 ring-1 ring-neutral-800">
              <h2 className="text-sm font-medium text-white mb-4">More Videos</h2>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-28 aspect-video bg-neutral-800 rounded-lg" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 bg-neutral-800 rounded" />
                        <Skeleton className="h-2 bg-neutral-800 w-2/3 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : relatedVideos.length === 0 ? (
                <p className="text-xs text-neutral-600 text-center py-6">No more videos</p>
              ) : (
                <div className="space-y-3">
                  {relatedVideos.map((video) => (
                    <Link
                      key={video.video_id}
                      href={`/video/${video.video_id}`}
                      className="flex gap-3 group"
                    >
                      <div className="relative w-28 aspect-video flex-shrink-0 rounded-lg overflow-hidden bg-neutral-800 ring-1 ring-neutral-800 group-hover:ring-neutral-600 transition-all">
                        <img
                          src={video.poster}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                          <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
                            <Play className="w-3 h-3 text-neutral-900 fill-neutral-900 ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] px-1 rounded backdrop-blur-sm">
                          HD
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-medium text-neutral-300 line-clamp-2 group-hover:text-white transition-colors leading-snug">
                          {video.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 mt-1">
                          <Eye className="w-2.5 h-2.5" />
                          {formatViews(video.view || 0)}
                          <span>•</span>
                          <span>{video.date_uploaded?.split(' ')[0]}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Back to Home */}
              {relatedVideos.length > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-800">
                  <Link href="/">
                    <Button variant="outline" size="sm" className="w-full border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-600 rounded-lg h-8 text-xs">
                      View All Videos
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900/30 border-t border-neutral-800/30 mt-8">
        <div className="container mx-auto px-4 py-6">
          {/* 18+ Warning */}
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 mb-4 py-2 bg-neutral-800/30 rounded-lg">
            <Shield className="w-3.5 h-3.5" />
            <span>18+ Only - Adults Only Content</span>
            <Shield className="w-3.5 h-3.5" />
          </div>
          
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
            <div className="relative w-5 h-5">
              <Image
                src="/blazzer-logo.png"
                alt="Blazzer"
                fill
                className="object-contain"
              />
            </div>
            <span>© {new Date().getFullYear()} Blazzer</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
