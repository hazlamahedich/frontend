'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ArrowRight, Check, ExternalLink, Zap } from 'lucide-react';

export default function UIShowcase() {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>This is a default card component</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Cards can contain any content you want to display.</p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Learn More</Button>
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
              <Button size="sm">Learn More</Button>
            </CardFooter>
          </Card>

          <Card variant="secondary">
            <CardHeader>
              <CardTitle>Secondary Card</CardTitle>
              <CardDescription>This is a secondary card component</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Cards can contain any content you want to display.</p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Learn More</Button>
            </CardFooter>
          </Card>

          <Card variant="accent" hover>
            <CardHeader>
              <CardTitle>Accent Card with Hover</CardTitle>
              <CardDescription>This card has hover effects</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Hover over this card to see the animation effect.</p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Learn More</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Buttons</h2>
        <div className="p-6 bg-card rounded-lg border shadow-sm space-y-6">
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button variant="primary">
              <Zap size={16} className="mr-2" />
              With Left Icon
            </Button>
            <Button variant="secondary">
              With Right Icon
              <ArrowRight size={16} className="ml-2" />
            </Button>
            <Button variant="accent">
              <Check size={16} className="mr-2" />
              Both Icons
              <ExternalLink size={16} className="ml-2" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button variant="primary" isLoading>
              Loading
            </Button>
            <Button variant="secondary" disabled>
              Disabled
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
