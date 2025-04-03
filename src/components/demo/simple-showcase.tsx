'use client';

import React from 'react';
import { ThemeToggle } from '../../components/ui/theme-toggle';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';

export default function SimpleShowcase() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Theme Toggle</h2>
        <div className="p-6 bg-card rounded-lg border shadow-sm flex items-center justify-center">
          <ThemeToggle />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>This is a default card component</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Cards can contain any content you want to display.</p>
            </CardContent>
            <CardFooter>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">Learn More</button>
            </CardFooter>
          </Card>

          <Card variant="primary">
            <CardHeader>
              <CardTitle>Primary Card</CardTitle>
              <CardDescription>This is a primary card component</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Cards can contain any content you want to display.</p>
            </CardContent>
            <CardFooter>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">Learn More</button>
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  );
}
