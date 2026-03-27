'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  Play, 
  Search, 
  Film, 
  Eye,
  Clock,
  Shield,
  Flame,
  Sparkles,
  Menu,
  X,
  Shuffle,
  ArrowUpDown,
  TrendingUp,
  Clock3
} from 'lucide-react';

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
  msg: string;
  status: string;
  total_videos: number;
  total_pages: number;
  file: Video[];
}

type SortOption = 'newest' | 'oldest' | 'most_viewed' | 'least_viewed';
type NavSection = 'home' | 'trending' | 'new';

export default function HomePage() {
  const { toast } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<NavSection>('home');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  const fetchVideos = useCallback(async (folder = '') => {
    try {
      setLoading(true);
      let url = `/api/videos?page=1&perPage=100`;
      if (folder) {
        url += `&folder=${encodeURIComponent(folder)}`;
      }
      
      const res = await fetch(url);
      const data: VideoResponse = await res.json();
      
      if (res.ok && data.file) {
        setVideos(data.file);
        
        const uniqueFolders = [...new Set(
          data.file
            .flatMap(v => v.folder?.split(',') || [])
            .map(f => f.trim())
            .filter(Boolean)
        )];
        setFolders(uniqueFolders);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load videos', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchVideos();
    
    const interval = setInterval(() => {
      fetchVideos(selectedFolder || '');
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchVideos, selectedFolder]);

  // Close sort menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFolderClick = (folder: string) => {
    const newFolder = folder === selectedFolder ? '' : folder;
    setSelectedFolder(newFolder || null);
    fetchVideos(newFolder);
  };

  const handleNavClick = (nav: NavSection) => {
    setActiveNav(nav);
    setSelectedFolder(null);
    
    if (nav === 'trending') {
      setSortOption('most_viewed');
    } else if (nav === 'new') {
      setSortOption('newest');
    } else {
      setSortOption('newest');
    }
  };

  const handleRandomVideo = () => {
    if (videos.length > 0) {
      const randomVideo = videos[Math.floor(Math.random() * videos.length)];
      window.location.href = `/video/${randomVideo.video_id}`;
    }
  };

  // Filter and sort videos
  const processedVideos = (() => {
    let filtered = videos.filter(video => 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.folder?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortOption) {
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = new Date(a.date_uploaded || 0).getTime();
          const dateB = new Date(b.date_uploaded || 0).getTime();
          return dateB - dateA;
        });
        break;
      case 'oldest':
        filtered.sort((a, b) => {
          const dateA = new Date(a.date_uploaded || 0).getTime();
          const dateB = new Date(b.date_uploaded || 0).getTime();
          return dateA - dateB;
        });
        break;
      case 'most_viewed':
        filtered.sort((a, b) => (b.view || 0) - (a.view || 0));
        break;
      case 'least_viewed':
        filtered.sort((a, b) => (a.view || 0) - (b.view || 0));
        break;
    }

    return filtered;
  })();

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !searchInputRef.current?.matches(':focus')) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: Clock3 },
    { value: 'oldest', label: 'Oldest First', icon: Clock3 },
    { value: 'most_viewed', label: 'Most Viewed', icon: TrendingUp },
    { value: 'least_viewed', label: 'Least Viewed', icon: Eye },
  ];

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
                  priority
                />
              </div>
              <span className="text-xl font-semibold tracking-tight text-white">
                Blazzer
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { id: 'home' as NavSection, label: 'Home', icon: null },
                { id: 'trending' as NavSection, label: 'Trending', icon: Flame },
                { id: 'new' as NavSection, label: 'New', icon: Sparkles },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    activeNav === item.id 
                      ? "bg-white text-neutral-900" 
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                  )}
                >
                  {item.icon && <item.icon className="w-3.5 h-3.5" />}
                  {item.label}
                </button>
              ))}
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
              {/* Mobile Search */}
              <div className="relative mb-3">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <Input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-11 bg-neutral-900 border-neutral-700 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 text-white placeholder:text-neutral-500 rounded-xl text-base w-full"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Mobile Nav Items */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'home' as NavSection, label: 'Home', icon: null },
                  { id: 'trending' as NavSection, label: 'Trending', icon: Flame },
                  { id: 'new' as NavSection, label: 'New', icon: Sparkles },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleNavClick(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200",
                      activeNav === item.id 
                        ? "bg-white text-neutral-900" 
                        : "bg-neutral-800/50 text-neutral-400"
                    )}
                  >
                    {item.icon && <item.icon className="w-3.5 h-3.5" />}
                    {item.label}
                  </button>
                ))}
                
                {/* Random - Mobile */}
                <button
                  onClick={handleRandomVideo}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium bg-neutral-800/50 text-neutral-400 hover:text-white"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  Random
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Search Section - Dedicated */}
      <div className="bg-neutral-900/50 border-b border-neutral-800/30">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-neutral-900 border-neutral-700 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 text-white placeholder:text-neutral-500 rounded-xl text-base transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-neutral-900/30 border-b border-neutral-800/30">
        <div className="container mx-auto px-4">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 py-2.5">
              <button
                onClick={() => handleFolderClick('')}
                className={cn(
                  "h-8 px-4 rounded-full text-sm font-medium transition-all duration-200 flex-shrink-0",
                  selectedFolder === null 
                    ? "bg-white text-neutral-900" 
                    : "bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                )}
              >
                All
              </button>
              {folders.map((folder) => (
                <button
                  key={folder}
                  onClick={() => handleFolderClick(folder)}
                  className={cn(
                    "h-8 px-4 rounded-full text-sm font-medium transition-all duration-200 flex-shrink-0",
                    selectedFolder === folder 
                      ? "bg-white text-neutral-900" 
                      : "bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  )}
                >
                  {folder}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-neutral-900/20 border-b border-neutral-800/20">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-500">
              {processedVideos.length} videos
            </div>
            
            {/* Sort Dropdown */}
            <div className="relative" ref={sortMenuRef}>
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm text-neutral-400 hover:text-white bg-neutral-800/30 hover:bg-neutral-800/50 transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sort</span>
              </button>
              
              {showSortMenu && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-50 py-1">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortOption(option.value as SortOption);
                        setShowSortMenu(false);
                      }}
                      className={cn(
                        "flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors",
                        sortOption === option.value 
                          ? "bg-neutral-800 text-white" 
                          : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
                      )}
                    >
                      <option.icon className="w-3.5 h-3.5" />
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Fixed 4 Columns */}
      <main className="container mx-auto px-4 py-6 flex-1">
        {/* Video Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-video rounded-lg bg-neutral-800" />
                <Skeleton className="h-4 bg-neutral-800 w-full rounded" />
                <Skeleton className="h-3 bg-neutral-800 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : processedVideos.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 bg-neutral-900 rounded-xl flex items-center justify-center">
              <Film className="w-8 h-8 text-neutral-700" />
            </div>
            <h3 className="text-lg font-medium text-neutral-300 mb-2">No videos found</h3>
            <p className="text-neutral-600 text-sm">
              {searchQuery ? 'Try a different search term' : 'Videos will appear here'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {processedVideos.map((video, index) => (
              <Link
                key={video.video_id}
                href={`/video/${video.video_id}`}
                className="group"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-800 ring-1 ring-neutral-800 group-hover:ring-neutral-600 transition-all duration-300">
                  <img
                    src={video.poster}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Play Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <Play className="w-4 h-4 text-neutral-900 fill-neutral-900 ml-0.5" />
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                    <Clock className="w-2.5 h-2.5 inline mr-0.5" />
                    HD
                  </div>
                </div>
                
                <div className="mt-2.5">
                  <h3 className="text-sm font-medium text-neutral-200 line-clamp-2 group-hover:text-white transition-colors leading-snug">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatViews(video.view || 0)}
                    </span>
                    <span>•</span>
                    <span>{video.date_uploaded?.split(' ')[0] || ''}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900/50 border-t border-neutral-800/30 mt-auto">
        <div className="container mx-auto px-4 py-6">
          {/* 18+ Warning */}
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 mb-4 py-2 bg-neutral-800/30 rounded-lg">
            <Shield className="w-3.5 h-3.5" />
            <span>18+ Only - Adults Only Content</span>
            <Shield className="w-3.5 h-3.5" />
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative w-6 h-6">
                <Image
                  src="/blazzer-logo.png"
                  alt="Blazzer"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-sm text-neutral-400">
                © {new Date().getFullYear()} <span className="text-white font-medium">Blazzer</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
