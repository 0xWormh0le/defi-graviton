export function pushToArray(arr: any[], obj: any) {
    const index = arr.findIndex((e) => e.id === obj.id);

    if (index === -1) {
        arr.push(obj);
    } else {
        arr[index] = obj;
    }
}
