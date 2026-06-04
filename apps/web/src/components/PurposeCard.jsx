
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const PurposeCard = ({ icon: Icon, title, description, score, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-card border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            {score !== undefined && (
              <div className="ml-auto">
                <div className="text-2xl font-bold text-primary">{score}%</div>
              </div>
            )}
          </div>
          <CardTitle className="text-xl text-primary">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PurposeCard;
