"use client";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        {description && (
          <p className="text-slate-400 text-sm max-w-2xl">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
