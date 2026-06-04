
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Calendar, Target } from 'lucide-react';

const CareerRoadmapCard = ({ title, timeline, actions, priority, index = 0 }) => {
  const priorityColors = {
    high: 'bg-destructive/10 text-destructive',
    medium: 'bg-accent/10 text-accent-foreground',
    low: 'bg-secondary/10 text-secondary-foreground',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="h-full transition-all duration-200 hover:shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-lg">{title}</CardTitle>
            {priority && (
              <Badge className={priorityColors[priority] || priorityColors.medium}>
                {priority}
              </Badge>
            )}
          </div>
          {timeline && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <Calendar className="w-4 h-4" />
              <span>{timeline}</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {actions && actions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium mb-3">
                <Target className="w-4 h-4 text-primary" />
                <span>Action Items</span>
              </div>
              <ul className="space-y-2">
                {actions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-1">•</span>
                    <span className="leading-relaxed">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CareerRoadmapCard;
