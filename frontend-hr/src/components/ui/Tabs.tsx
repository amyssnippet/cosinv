import React, { ReactNode } from 'react';

interface TabsProps {
  children: ReactNode;
  defaultActive?: string;
}

interface TabProps {
  id: string;
  title: string;
  children: ReactNode;
}

export function Tabs({ children, defaultActive }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultActive || '');

  return (
    <div>
      <div className="flex border-b">
        {React.Children.map(children, (child: any) => (
          <button
            key={child.props.id}
            onClick={() => setActiveTab(child.props.id)}
            className={`px-4 py-2 ${activeTab === child.props.id ? 'border-b-2 border-blue-500' : ''}`}
          >
            {child.props.title}
          </button>
        ))}
      </div>
      <div className="p-4">
        {React.Children.map(children, (child: any) =>
          activeTab === child.props.id ? child : null
        )}
      </div>
    </div>
  );
}

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}