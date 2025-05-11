
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskAlert, fetchRiskAlerts } from "@/lib/api";
import { useWallet } from "@/context/WalletContext";
import { AlertTriangle, Bell, ChartBar } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";

const AlertNotifications = () => {
  const { address, isConnected } = useWallet();
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  
  // Use React Query for data fetching with automatic refetching
  const { data, isLoading, error } = useQuery({
    queryKey: ['alerts', address],
    queryFn: () => fetchRiskAlerts(address || ''),
    enabled: isConnected && !!address,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Handle successful data fetching and notification logic in a useEffect
  useEffect(() => {
    if (data) {
      // Check for new alerts to display toast notifications
      if (alerts.length > 0) {
        const newNotifications = data.filter(
          alert => !alerts.some(existingAlert => existingAlert.id === alert.id)
        );
        
        // Show toast notifications for new alerts
        newNotifications.forEach(alert => {
          toast.warning(`${alert.assetSymbol} Alert: ${alert.message}`, {
            icon: <AlertTriangle className="h-4 w-4" />,
            description: `From: ${alert.source} (${alert.chain || 'Unknown Chain'})`,
            action: {
              label: "View",
              onClick: () => window.open(alert.url, "_blank")
            }
          });
        });
      }
      
      // Always limit to 5 most recent alerts
      setAlerts(data.slice(0, 5));
    }
  }, [data, alerts]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error("Failed to load alerts:", error);
      toast.error("Failed to fetch risk alerts");
    }
  }, [error]);

  if (!isConnected) {
    return null;
  }

  const getAlertClass = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high':
        return 'alert-high';
      case 'medium':
        return 'alert-medium';
      case 'low':
        return 'alert-low';
      default:
        return '';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000; // Difference in seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Risk Alerts</CardTitle>
        <div className="text-sm text-muted-foreground">
          Latest 5 alerts across chains
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="py-8 text-center">
            <Bell className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No active alerts at the moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className="flex items-start space-x-3 p-3 rounded-lg border border-muted bg-muted/30"
              >
                <div className="flex-shrink-0">
                  <div className={`alert-badge ${getAlertClass(alert.level)} animate-pulse-alert`}>
                    {alert.level === 'high' ? (
                      <AlertTriangle className="h-3.5 w-3.5" />
                    ) : (
                      <ChartBar className="h-3.5 w-3.5" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">
                      <span className="font-semibold">[{alert.chain || 'Unknown'}]</span> {alert.assetSymbol}: {alert.message}
                    </p>
                    <span className="text-xs text-muted-foreground ml-2">
                      {formatTime(alert.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Source: {alert.source}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertNotifications;
