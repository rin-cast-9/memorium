interface CircleProgressViewProps {
    value: number;
}

const CircleProgressView = ({
    value,
}: CircleProgressViewProps) => {

    const radius = 60;
    const strokeWidth = 18;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <div className="relative w-[120px] h-[120px]">
            <svg height={120} width={120}>
                <circle
                    stroke="var(--color-black-1)"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    r={normalizedRadius}
                    cx="60"
                    cy="60"
                />
                <circle
                    stroke="var(--color-green-border)"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="butt"
                    r={normalizedRadius}
                    cx="60"
                    cy="60"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[var(--color-white)] font-h3">
                {value}%
            </div>
        </div>
    )

};

export default CircleProgressView;