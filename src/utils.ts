export const round = (value: number | null | undefined, decimals: number) => {
    if (!value) {
        return null;
    }
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}