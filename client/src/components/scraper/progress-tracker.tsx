import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ScrapingProgress {
  id: string;
  url: string;
  sourceSite: string;
  status: 'running' | 'success' | 'error' | 'paused' | 'cancelled';
  vehiclesFound: number;
  vehiclesScraped: number;
  totalPages?: number;
  currentPage?: number;
  progress: number;
  currentAction?: string;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
}

interface ProgressTrackerProps {
  sessionId?: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export function ProgressTracker({ sessionId, onComplete, onError }: ProgressTrackerProps) {
  const [isPolling, setIsPolling] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch current scraping session progress
  const { data: progressData, isLoading } = useQuery<ScrapingProgress>({
    queryKey: ['/api/scraper/progress', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const response = await apiRequest('GET', `/api/scraper/progress/${sessionId}`);
      return response.json();
    },
    enabled: !!sessionId,
    refetchInterval: isPolling ? 2000 : false,
  });

  // Stop scraping mutation
  const stopMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/scraper/stop/${sessionId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Scraping stopped successfully" });
      setIsPolling(false);
      queryClient.invalidateQueries({ queryKey: ['/api/scraper/progress'] });
    },
    onError: () => {
      toast({ 
        title: "Failed to stop scraping",
        variant: "destructive"
      });
    },
  });

  // Pause/Resume scraping mutation
  const pauseResumeMutation = useMutation({
    mutationFn: async (action: 'pause' | 'resume') => {
      const response = await apiRequest('POST', `/api/scraper/${action}/${sessionId}`);
      return response.json();
    },
    onSuccess: (_, action) => {
      toast({ title: `Scraping ${action}d successfully` });
      queryClient.invalidateQueries({ queryKey: ['/api/scraper/progress'] });
    },
    onError: () => {
      toast({ 
        title: "Failed to update scraping status",
        variant: "destructive"
      });
    },
  });

  // Auto-start polling when session begins
  useEffect(() => {
    if (sessionId && progressData?.status === 'running') {
      setIsPolling(true);
    } else if (progressData?.status && ['success', 'error', 'cancelled'].includes(progressData.status)) {
      setIsPolling(false);
      
      if (progressData.status === 'success' && onComplete) {
        onComplete();
      } else if (progressData.status === 'error' && onError) {
        onError(progressData.errorMessage || 'Scraping failed');
      }
    }
  }, [sessionId, progressData?.status, onComplete, onError]);

  if (!sessionId || isLoading) {
    return null;
  }

  if (!progressData) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No active scraping session found
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-500';
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'paused': return 'bg-yellow-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return 'In Progress';
      case 'success': return 'Completed';
      case 'error': return 'Failed';
      case 'paused': return 'Paused';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '0s';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getCurrentDuration = () => {
    if (progressData.completedAt) {
      return progressData.duration;
    }
    const start = new Date(progressData.startedAt).getTime();
    return Date.now() - start;
  };

  return (
    <Card className="w-full" data-testid="progress-tracker">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Scraping Progress</CardTitle>
          <Badge 
            className={`${getStatusColor(progressData.status)} text-white`}
            data-testid={`status-${progressData.status}`}
          >
            {getStatusText(progressData.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700">Overall Progress</span>
            <span className="text-gray-600" data-testid="progress-percentage">
              {progressData.progress}%
            </span>
          </div>
          <Progress 
            value={progressData.progress} 
            className="h-3"
            data-testid="progress-bar"
          />
        </div>

        {/* Current Action */}
        {progressData.currentAction && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
            <div className="flex items-center">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
              <span className="text-sm font-medium text-blue-800" data-testid="current-action">
                {progressData.currentAction.charAt(0).toUpperCase() + progressData.currentAction.slice(1)}...
              </span>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600" data-testid="vehicles-found">
              {progressData.vehiclesFound}
            </div>
            <div className="text-sm text-gray-600">Vehicles Found</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600" data-testid="vehicles-scraped">
              {progressData.vehiclesScraped}
            </div>
            <div className="text-sm text-gray-600">Vehicles Scraped</div>
          </div>
        </div>

        {/* Page Progress */}
        {progressData.totalPages && progressData.currentPage && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Page Progress</span>
              <span className="text-sm text-gray-600" data-testid="page-progress">
                {progressData.currentPage} / {progressData.totalPages}
              </span>
            </div>
            <Progress 
              value={(progressData.currentPage / progressData.totalPages) * 100} 
              className="h-2"
            />
          </div>
        )}

        {/* Session Info */}
        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Source:</span>
            <span className="font-medium text-gray-900">{progressData.sourceSite}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium text-gray-900" data-testid="session-duration">
              {formatDuration(getCurrentDuration())}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Started:</span>
            <span className="font-medium text-gray-900">
              {new Date(progressData.startedAt).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {progressData.errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
            <div className="text-sm text-red-800" data-testid="error-message">
              <strong>Error:</strong> {progressData.errorMessage}
            </div>
          </div>
        )}

        {/* Control Buttons */}
        {progressData.status === 'running' && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pauseResumeMutation.mutate('pause')}
              disabled={pauseResumeMutation.isPending}
              data-testid="button-pause"
            >
              <i className="fas fa-pause mr-2"></i>
              Pause
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => stopMutation.mutate()}
              disabled={stopMutation.isPending}
              data-testid="button-stop"
            >
              <i className="fas fa-stop mr-2"></i>
              Stop
            </Button>
          </div>
        )}

        {progressData.status === 'paused' && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => pauseResumeMutation.mutate('resume')}
              disabled={pauseResumeMutation.isPending}
              data-testid="button-resume"
            >
              <i className="fas fa-play mr-2"></i>
              Resume
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => stopMutation.mutate()}
              disabled={stopMutation.isPending}
              data-testid="button-stop"
            >
              <i className="fas fa-stop mr-2"></i>
              Stop
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}