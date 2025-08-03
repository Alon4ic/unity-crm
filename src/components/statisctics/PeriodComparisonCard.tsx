interface PeriodComparisonProps {
    profitCurrent: number;
    profitPrevious: number;
    delta: number;
}

export function PeriodComparisonCard({
    profitCurrent,
    profitPrevious,
    delta,
}: PeriodComparisonProps) {
    return (
        <div className="p-4 bg-white dark:bg-gray-900 border rounded shadow-md space-y-2">
            <p>
                Прибыль за текущий период:{' '}
                <strong>{profitCurrent.toFixed(2)} грн</strong>
            </p>
            <p>
                Прибыль за предыдущий период:{' '}
                <strong>{profitPrevious.toFixed(2)} грн</strong>
            </p>
            <p>
                Изменение:{' '}
                <span
                    className={delta >= 0 ? 'text-green-600' : 'text-red-600'}
                >
                    {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(2)}%
                </span>
            </p>
        </div>
    );
}
