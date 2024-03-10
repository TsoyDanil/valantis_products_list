export const mapFieldsArray = (serverResponse :any) =>  [...new Set(serverResponse?.result)];


export const mapStringArrayToOptions = (stringArray: Array<string | null>):{label: string; value: string | null}[] => {
    return stringArray.map((string) => {
        const oprionItem = {
            label: string ? string : 'Все',
            value: string
        }
        return oprionItem
    })
}