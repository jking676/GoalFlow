import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const IconComp = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  if (!IconComp) return <Icons.Circle {...props} />;
  return <IconComp {...props} />;
}
