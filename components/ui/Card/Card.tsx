import { cn } from '@/utils/cn';

interface Props {
  title: string;
  description: React.ReactNode;
  footer?: React.ReactNode;
  footerClassName?: string;
  children: React.ReactNode;
}

export default function Card({ title, description, footer, footerClassName, children }: Props) {
  return (
    <div className="w-full max-w-3xl m-auto my-8 border rounded-md p border-zinc-700">
      <div className="px-5 py-4">
        <h3 className="mb-1 text-2xl font-medium">{title}</h3>
        <div className="text-zinc-300">{description}</div>
        {children}
      </div>
      {footer && (
        <div 
          className={cn(
            "border-t border-zinc-700 bg-zinc-900 p-4",
            footerClassName
          )}
          onClick={(e) => {
            console.log('Footer clicked');
            // Ensure events bubble up
            e.stopPropagation();
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
