"use client";
import React from 'react';
import { BarChart, Bar, ResponsiveContainer, Tooltip } from 'recharts';

const StatCard = ({ title, metricName, value, icon, color = '#22c55e', chartData = [] }) => {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 flex flex-col justify-between hover:border-gray-700 transition-colors duration-300">
            <div>
                <div className="flex items-center gap-3 text-gray-400">
                    {icon}
                    <h3 className="font-semibold text-white">
                        {title}
                    </h3>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                    {metricName}
                </p>
                <p className="text-5xl font-bold text-white mt-1">
                    {value}
                </p>
            </div>
            <div className="w-full h-12 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <Tooltip
                             cursor={{fill: 'rgba(128, 128, 128, 0.1)'}}
                             contentStyle={{
                                background: 'rgba(17, 24, 39, 0.9)',
                                borderColor: 'rgba(55, 65, 81, 1)',
                                color: '#fff',
                                fontSize: '12px',
                                padding: '4px 8px',
                                borderRadius: '0.5rem'
                             }}
                             labelFormatter={(label) => `Count: ${label}`}
                             formatter={(value, name, props) => [props.payload.count, 'Count']}
                        />
                        <Bar dataKey="count" fill={color} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StatCard;