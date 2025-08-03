'use client';

import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
} from 'recharts';

export function ProfitChart({
    data,
}: {
    data: { date: string; profit: number }[];
}) {
    return (
        <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">📈 График прибыли</h2>
            <LineChart
                width={800}
                height={300}
                data={data}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
                <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#10b981"
                    strokeWidth={2}
                />
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
            </LineChart>
        </div>
    );
}
