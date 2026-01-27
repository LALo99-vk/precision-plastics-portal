import { cn } from "@/lib/utils";

export const BentoGrid = ({
    className,
    children,
}: {
    className?: string;
    children?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ",
                className
            )}
        >
            {children}
        </div>
    );
};

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon,
    image,
    count,
    href,
    onClick,
}: {
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    header?: React.ReactNode;
    icon?: React.ReactNode;
    image?: string;
    count?: number;
    href?: string;
    onClick?: () => void;
}) => {
    return (
        <div
            className={cn(
                "row-span-1 rounded-3xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border-2 border-transparent hover:border-black/5 flex flex-col space-y-4 relative overflow-hidden",
                "border-zinc-200", // Thick border base
                className
            )}
            onClick={onClick}
        >
            {/* Background Image / Header */}
            <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-neutral-800 overflow-hidden relative">
                {image ? (
                    <img
                        src={image}
                        alt={typeof title === 'string' ? title : ''}
                        className="w-full h-full object-cover scale-100 group-hover/bento:scale-110 transition-transform duration-500"
                    />
                ) : (
                    header
                )}

                {/* Overlay Hover Button */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/bento:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm transform translate-y-4 group-hover/bento:translate-y-0 transition-transform duration-300">
                        View Specifications
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="group-hover/bento:translate-x-2 transition duration-200">
                <div className="flex items-center justify-between mb-2">
                    <div className="font-sans font-bold text-neutral-800 dark:text-neutral-200 text-xl">
                        {title}
                    </div>
                    {icon}
                </div>
                <div className="font-sans font-normal text-neutral-600 text-xs dark:text-neutral-300 line-clamp-2">
                    {description}
                </div>
                {count !== undefined && (
                    <div className="mt-2 text-xs font-bold text-primary uppercase tracking-wider">
                        {count} Products
                    </div>
                )}
            </div>

            {/* Click handler overlay if it's a link */}
            {href && <a href={href} className="absolute inset-0 z-10" />}
        </div>
    );
};
