import SimpleShowcase from '@/components/demo/simple-showcase';

export const metadata = {
  title: 'UI Showcase | Surge SEO Platform',
  description: 'Showcase of UI components with theme support',
};

export default function UIShowcasePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">UI Showcase</h1>
        <p className="text-muted-foreground mt-2">
          This page demonstrates the UI components with theme support.
        </p>
      </div>

      <SimpleShowcase />
    </div>
  );
}
