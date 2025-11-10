const StatCard = ({ title, metricName, value, icon }) => {
    return (
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-5 flex flex-col justify-between h-48">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-gray-500 dark:text-gray-400">{icon}</span>
                    <h4 className="font-semibold text-gray-800 dark:text-white">{title}</h4>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{metricName}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            </div>
            <div className="flex items-end h-10 w-full gap-1">
                <div className="w-1/4 h-[20%] bg-green-500/30 rounded-t-sm"></div>
                <div className="w-1/4 h-[50%] bg-green-500/30 rounded-t-sm"></div>
                <div className="w-1/4 h-[80%] bg-green-500 rounded-t-sm"></div>
                <div className="w-1/4 h-[60%] bg-green-500 rounded-t-sm"></div>
            </div>
        </div>
    );
}

export default StatCard;