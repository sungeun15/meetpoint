import Link from "next/link";

const gradientBackground =
    "linear-gradient(198.712deg, rgb(102, 117, 247) 0%, rgb(87, 0, 123) 100%)";

type GradientActionLinkProps = {
    href: string;
    className: string;
    children: React.ReactNode;
    onClick?: () => void;
};

export function GradientActionLink({
    href,
    className,
    children,
    onClick,
}: GradientActionLinkProps) {
    return (
        <Link href={href} onClick={onClick} className={className} style={{ backgroundImage: gradientBackground }}>
            {children}
        </Link>
    );
}