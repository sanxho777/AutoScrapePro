import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  price: string;
  mileage: number;
  images: string[];
  sourceUrl: string;
}

interface FacebookGroup {
  id: string;
  name: string;
  memberCount: number;
  isActive: boolean;
}

interface QuickPostProps {
  vehicleId?: string;
}

export function QuickPost({ vehicleId }: QuickPostProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(vehicleId || null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [postingProgress, setPostingProgress] = useState(0);
  const [isPosting, setIsPosting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch vehicles
  const { data: vehiclesData, isLoading: vehiclesLoading } = useQuery<{vehicles: Vehicle[]}>({
    queryKey: ['/api/vehicles'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/vehicles?limit=50');
      return response.json();
    }
  });

  // Fetch Facebook groups
  const { data: groupsData, isLoading: groupsLoading } = useQuery<FacebookGroup[]>({
    queryKey: ['/api/facebook-groups'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/facebook-groups');
      return response.json();
    }
  });

  // Quick post mutation
  const quickPostMutation = useMutation({
    mutationFn: async (data: { vehicleId: string; groupIds: string[] }) => {
      const response = await apiRequest('POST', '/api/facebook/quick-post', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "Quick Post Successful!",
        description: `Posted to ${data.successCount} groups successfully`
      });
      setIsPosting(false);
      setPostingProgress(0);
      setSelectedGroups([]);
      queryClient.invalidateQueries({ queryKey: ['/api/facebook-posts'] });

      // Open Facebook Marketplace with pre-filled data
      if (data.marketplaceUrl) {
        window.open(data.marketplaceUrl, '_blank');
      }
    },
    onError: () => {
      toast({ 
        title: "Quick Post Failed",
        description: "Failed to post to Facebook groups",
        variant: "destructive"
      });
      setIsPosting(false);
      setPostingProgress(0);
    },
  });

  const handleQuickPost = () => {
    if (!selectedVehicle || selectedGroups.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select a vehicle and at least one Facebook group",
        variant: "destructive"
      });
      return;
    }

    setIsPosting(true);
    setPostingProgress(0);

    // Simulate posting progress
    const interval = setInterval(() => {
      setPostingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 20;
      });
    }, 500);

    quickPostMutation.mutate({ 
      vehicleId: selectedVehicle, 
      groupIds: selectedGroups 
    });
  };

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const selectedVehicleData = vehiclesData?.vehicles.find(v => v.id === selectedVehicle);
  const activeGroups = groupsData?.filter(g => g.isActive) || [];

  if (vehiclesLoading || groupsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full" data-testid="quick-post-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <i className="fab fa-facebook text-blue-600"></i>
          Quick Post to Facebook Marketplace
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Vehicle Selection */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Select Vehicle</h3>
          <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
            {vehiclesData?.vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => setSelectedVehicle(vehicle.id)}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedVehicle === vehicle.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                data-testid={`vehicle-option-${vehicle.id}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </div>
                    <div className="text-sm text-gray-600">
                      ${parseInt(vehicle.price).toLocaleString()} • {vehicle.mileage.toLocaleString()} miles
                    </div>
                    <div className="text-xs text-gray-500">VIN: {vehicle.vin}</div>
                  </div>
                  {selectedVehicle === vehicle.id && (
                    <i className="fas fa-check-circle text-blue-600"></i>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Vehicle Preview */}
        {selectedVehicleData && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Selected Vehicle</h4>
            <div className="flex items-center gap-4">
              {selectedVehicleData.images[0] && (
                <img 
                  src={selectedVehicleData.images[0]} 
                  alt="Vehicle"
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div>
                <div className="font-medium">
                  {selectedVehicleData.year} {selectedVehicleData.make} {selectedVehicleData.model}
                </div>
                <div className="text-sm text-gray-600">
                  ${parseInt(selectedVehicleData.price).toLocaleString()} • {selectedVehicleData.mileage.toLocaleString()} miles
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Group Selection */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Select Facebook Groups</h3>
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
            {activeGroups.map((group) => (
              <div
                key={group.id}
                onClick={() => toggleGroupSelection(group.id)}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedGroups.includes(group.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                data-testid={`group-option-${group.id}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{group.name}</div>
                    <div className="text-sm text-gray-600">
                      {group.memberCount?.toLocaleString()} members
                    </div>
                  </div>
                  {selectedGroups.includes(group.id) && (
                    <i className="fas fa-check-circle text-blue-600"></i>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {selectedGroups.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedGroups.map(groupId => {
                const group = activeGroups.find(g => g.id === groupId);
                return group ? (
                  <Badge key={groupId} variant="secondary" className="text-xs">
                    {group.name}
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Posting Progress */}
        {isPosting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">Posting Progress</span>
              <span className="text-gray-600">{postingProgress}%</span>
            </div>
            <Progress value={postingProgress} className="h-2" />
            <div className="text-sm text-gray-600 text-center">
              Posting to {selectedGroups.length} groups...
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handleQuickPost}
            disabled={!selectedVehicle || selectedGroups.length === 0 || isPosting}
            className="flex-1"
            data-testid="button-quick-post"
          >
            {isPosting ? (
              <>
                <i className="fas fa-spinner animate-spin mr-2"></i>
                Posting...
              </>
            ) : (
              <>
                <i className="fab fa-facebook mr-2"></i>
                Quick Post ({selectedGroups.length} groups)
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              setSelectedVehicle(null);
              setSelectedGroups([]);
            }}
            disabled={isPosting}
            data-testid="button-clear-selection"
          >
            Clear
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedGroups(activeGroups.map(g => g.id))}
            disabled={isPosting}
            data-testid="button-select-all-groups"
          >
            Select All Groups
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedGroups([])}
            disabled={isPosting}
            data-testid="button-clear-groups"
          >
            Clear Groups
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}