import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import stylesheet from '../consultation.css?url';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'North Harris AI Use Norms Consultation' },
      { name: 'description', content: 'Share, discuss, and review AI use norms for North Harris.' },
      { name: 'theme-color', content: '#003768' },
    ],
    links: [{ rel: 'stylesheet', href: stylesheet }],
  }),
  component: () => <Outlet />,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
  return <html lang="en"><head><HeadContent /></head><body>{children}<Scripts /></body></html>;
}
