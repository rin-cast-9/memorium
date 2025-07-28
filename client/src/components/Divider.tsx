const Divider = () => {
    return (
        <div className="flex items-center gap-[10px] mt-[30px] mb-[40px]">
            <div className="flex-1 h-px bg-[color:var(--color-stroke)]/50"></div>
            <span className="font-small-text text-[color:var(--color-grey)]">
                or via email
            </span>
            <div className="flex-1 h-px bg-[color:var(--color-stroke)]/50"></div>
        </div>
    );
};

export default Divider;