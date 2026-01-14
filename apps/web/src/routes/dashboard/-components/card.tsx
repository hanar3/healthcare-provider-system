import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { LucideIcon } from "lucide-react"

export interface KpisProps {
  title: string;
  value: string;
  change: string;
  changeType: string;
  icon: LucideIcon;
}

export function KPICard(kpi: KpisProps) {
        const Icon = kpi.icon
        return (
          <Card key={kpi.title} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-foreground">{kpi.value}</div>
              <p className="text-xs text-primary mt-1 font-medium">{kpi.change}</p>
            </CardContent>
          </Card>
        )
      }
