export function getSlotAlias(name: string) {
    let alias = name.replace(/\s+/g, "_");
    alias = alias.toUpperCase();
    return "$" + alias;
}

export function validateSlotName(name: string) {
    const lengthValid = name.length > 0 && name.length < 32;
    const regexValid = /^[a-zA-Z0-9 ]+$/.test(name);
    const startValid = /^[a-zA-Z]/.test(name);
    const endValid = /[a-zA-Z0-9]$/.test(name);

    return lengthValid && regexValid && startValid && endValid;
}