const ColorPicker = ({
    colors,
    selected,
    onChange,
}: {
    colors: string[];
    selected: string;
    onChange: (color: string) => void;
}) => {
    return (
        <div className="flex gap-2 my-2">
            {colors.map((color) => (
                <button
                    key={color}
                    onClick={() => onChange(color)}
                    className={`w-6 h-6 rounded-full border-2 ${
                        color === selected
                            ? 'border-black dark:border-white'
                            : 'border-transparent'
                    }`}
                    style={{ backgroundСolor: color }}
                    title="Выбрать цвет"
                />
            ))}
        </div>
    );
};
