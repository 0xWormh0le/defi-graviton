export enum SortOrder {
    desc = -1,
    asc = 1,
}

export function dynamicSort(property: any, sortOrder = SortOrder.asc) {
    return (a: any, b: any) => {
        const result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    };
}
