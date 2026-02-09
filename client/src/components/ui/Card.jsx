import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Card = ({ children, className }) => (
    <div className={cn("bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg", className)}>{children}</div>
);

export default Card;
