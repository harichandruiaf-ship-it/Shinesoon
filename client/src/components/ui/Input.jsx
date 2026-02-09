import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Input = ({ className, ...props }) => (
    <input className={cn("w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all", className)} {...props} />
);

export default Input;
