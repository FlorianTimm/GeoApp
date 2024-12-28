export const round = (value: number | null, decimals: number) => {
    if (value === null) {
        return null;
    }
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}