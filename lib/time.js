export function getDateFilter(timeframe) {
    const now = new Date();
    let startDate;

    switch (timeframe) {
        case '1h':
            startDate = new Date(now.getTime() - (60 * 60 * 1000));
            break;
        case '24h':
            startDate = new Date(now.getTime() - (24 * 60 * 60 * 1000));
            break;
        case '7d':
            startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
            break;
        default:
            return undefined;
    }

    return {
        gte: startDate,
    };
}